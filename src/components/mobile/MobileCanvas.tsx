import { useCallback, useRef, useEffect, useState } from 'react';
import type { WorksheetElement, Worksheet } from '@/types/worksheet';
import CanvasElement from '@/components/editor/CanvasElement';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCanvasProps {
  elements: WorksheetElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  paperWidth: number;
  paperHeight: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onCanvasTap: (paperX: number, paperY: number) => void;
  worksheet: Worksheet;
  activeTool: string;
}

export default function MobileCanvas({
  elements,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  paperWidth,
  paperHeight,
  showGrid,
  gridSize,
  snapToGrid,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onCanvasTap,
  worksheet,
  activeTool,
}: MobileCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  // Viewport pan state
  const panRef = useRef({ x: 0, y: 0, active: false });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Touch tracking for gestures
  const touchState = useRef<{
    touches: Map<number, { x: number; y: number }>;
    lastDist: number;
    lastCenter: { x: number; y: number } | null;
    startTime: number;
    startPos: { x: number; y: number } | null;
    hasMoved: boolean;
    isPinching: boolean;
    isDragging: boolean;
    dragElementId: string | null;
    dragStartEl: { x: number; y: number } | null;
    longPressTimer: ReturnType<typeof setTimeout> | null;
    isLongPress: boolean;
  }>({
    touches: new Map(),
    lastDist: 0,
    lastCenter: null,
    startTime: 0,
    startPos: null,
    hasMoved: false,
    isPinching: false,
    isDragging: false,
    dragElementId: null,
    dragStartEl: null,
    longPressTimer: null,
    isLongPress: false,
  });

  // Dragging element state for visual feedback
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);

  const snap = useCallback((val: number) => {
    if (!snapToGrid) return val;
    return Math.round(val / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Compute paper centering offset
  const getPaperOffset = useCallback(() => {
    const containerW = containerRef.current?.clientWidth || window.innerWidth;
    const containerH = containerRef.current?.clientHeight || window.innerHeight;
    const scaledW = paperWidth * zoom;
    const scaledH = paperHeight * zoom;
    const offsetX = Math.max(0, (containerW - scaledW) / 2);
    const offsetY = Math.max(0, (containerH - scaledH) / 2);
    return { offsetX, offsetY, containerW, containerH };
  }, [paperWidth, paperHeight, zoom]);

  // Get paper coordinates from touch client coordinates
  const getPaperCoords = useCallback((clientX: number, clientY: number) => {
    const { offsetX, offsetY } = getPaperOffset();
    const paperX = (clientX - pan.x - offsetX) / zoom;
    const paperY = (clientY - pan.y - offsetY) / zoom;
    return { paperX, paperY };
  }, [getPaperOffset, pan, zoom]);

  // Grid background
  const gridOpacity = gridSize <= 4 ? 0.15 : gridSize <= 8 ? 0.3 : 0.4;
  const gridStyle: React.CSSProperties = showGrid
    ? {
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(231,229,224,${gridOpacity}) 0px, rgba(231,229,224,${gridOpacity}) 1px, transparent 1px, transparent ${gridSize * zoom}px),
          repeating-linear-gradient(90deg, rgba(231,229,224,${gridOpacity}) 0px, rgba(231,229,224,${gridOpacity}) 1px, transparent 1px, transparent ${gridSize * zoom}px)
        `,
        backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      }
    : {};

  // Page background
  const getPageBackgroundStyle = (): React.CSSProperties => {
    const bg = worksheet.pageBackground || 'blank';
    switch (bg) {
      case 'lined':
        return { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, #E7E5E0 23px, #E7E5E0 24px)', backgroundSize: '100% 24px' };
      case 'graph':
        return { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #F0EBE0 19px, #F0EBE0 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #F0EBE0 19px, #F0EBE0 20px)', backgroundSize: '20px 20px' };
      case 'dot':
        return { backgroundImage: 'radial-gradient(circle, #D6D3CC 1px, transparent 1px)', backgroundSize: '20px 20px' };
      case 'story':
        return { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 47px, #E7E5E0 47px, #E7E5E0 48px)', backgroundSize: '100% 48px' };
      case 'manuscript':
        return { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, #A8A29E 27px, #A8A29E 28px, transparent 28px, transparent 55px, #A8A29E 55px, #A8A29E 56px)', backgroundSize: '100% 56px' };
      default:
        return {};
    }
  };

  // Desktop drag handlers passed to CanvasElement
  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    // Desktop mouse drag - handled by CanvasElement + window events
  }, []);

  const handleResizeStart = useCallback((id: string, handle: string, e: React.MouseEvent) => {
    // Desktop resize - not used on mobile
  }, []);

  // Touch event handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ts = touchState.current;

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches: TouchList) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      ts.touches.clear();
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        ts.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }

      ts.startTime = Date.now();
      ts.hasMoved = false;
      ts.isPinching = false;
      ts.isLongPress = false;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        ts.startPos = { x: touch.clientX, y: touch.clientY };

        // Check if touching an element
        const target = e.target as HTMLElement;
        const elementEl = target.closest('[data-element-id]') as HTMLElement | null;
        if (elementEl) {
          const elId = elementEl.dataset.elementId!;
          const el = elements.find((x) => x.id === elId);
          if (el) {
            ts.dragElementId = elId;
            ts.dragStartEl = { x: el.x, y: el.y };

            // Long press to drag
            ts.longPressTimer = setTimeout(() => {
              ts.isLongPress = true;
              ts.isDragging = true;
              setDraggingElementId(elId);
              if (navigator.vibrate) navigator.vibrate(20);
              onSelect(elId);
            }, 350);
          }
        } else {
          ts.dragElementId = null;
          ts.dragStartEl = null;
        }
      } else if (e.touches.length === 2) {
        // Two finger pinch / pan
        ts.isPinching = true;
        ts.lastDist = getTouchDistance(e.touches);
        ts.lastCenter = getTouchCenter(e.touches);
        if (ts.longPressTimer) {
          clearTimeout(ts.longPressTimer);
          ts.longPressTimer = null;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scroll

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (!ts.startPos) return;

        const dx = touch.clientX - ts.startPos.x;
        const dy = touch.clientY - ts.startPos.y;

        if (!ts.hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
          ts.hasMoved = true;
          // Cancel long press if moved significantly
          if (ts.longPressTimer && !ts.isLongPress) {
            clearTimeout(ts.longPressTimer);
            ts.longPressTimer = null;
          }
        }

        if (ts.isDragging && ts.dragElementId && ts.dragStartEl) {
          // Drag element
          const { paperX: startPaperX, paperY: startPaperY } = getPaperCoords(ts.startPos.x, ts.startPos.y);
          const { paperX: curPaperX, paperY: curPaperY } = getPaperCoords(touch.clientX, touch.clientY);
          const ddx = curPaperX - startPaperX;
          const ddy = curPaperY - startPaperY;
          const newX = snap(Math.max(0, ts.dragStartEl.x + ddx));
          const newY = snap(Math.max(0, ts.dragStartEl.y + ddy));
          onUpdate(ts.dragElementId, { x: newX, y: newY });
        } else if (!ts.dragElementId && ts.hasMoved && activeTool === 'select') {
          // Pan viewport with 1 finger on empty canvas
          setPan((prev) => ({ x: prev.x + dx * 0.5, y: prev.y + dy * 0.5 }));
          ts.startPos = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2 && ts.isPinching) {
        const dist = getTouchDistance(e.touches);
        const center = getTouchCenter(e.touches);

        if (ts.lastDist > 0) {
          const scaleDelta = dist / ts.lastDist;
          if (scaleDelta > 1.02) {
            onZoomIn();
            ts.lastDist = dist;
          } else if (scaleDelta < 0.98) {
            onZoomOut();
            ts.lastDist = dist;
          }
        }

        // Two-finger pan
        if (ts.lastCenter && ts.hasMoved) {
          const pdx = center.x - ts.lastCenter.x;
          const pdy = center.y - ts.lastCenter.y;
          setPan((prev) => ({ x: prev.x + pdx, y: prev.y + pdy }));
        }

        ts.lastCenter = center;
        ts.hasMoved = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      const duration = now - ts.startTime;
      const wasTap = !ts.hasMoved && duration < 300;

      if (ts.longPressTimer) {
        clearTimeout(ts.longPressTimer);
        ts.longPressTimer = null;
      }

      if (wasTap && !ts.isPinching) {
        // Handle tap
        if (ts.startPos) {
          const changedTouch = e.changedTouches[0];
          if (changedTouch) {
            const { paperX, paperY } = getPaperCoords(changedTouch.clientX, changedTouch.clientY);

            // Check if tapped on an element
            const target = e.target as HTMLElement;
            const elementEl = target?.closest('[data-element-id]') as HTMLElement | null;

            if (elementEl) {
              const elId = elementEl.dataset.elementId!;
              if (selectedId === elId) {
                // Already selected - could trigger inline edit for text
                // For now just keep selected
              } else {
                onSelect(elId);
              }
            } else {
              // Tapped on empty canvas
              if (activeTool === 'select') {
                onSelect(null);
              } else {
                // Place element at tap position
                onCanvasTap(paperX, paperY);
              }
            }
          }
        }
      }

      if (e.touches.length === 0) {
        // All touches ended - reset
        ts.isDragging = false;
        ts.dragElementId = null;
        ts.dragStartEl = null;
        ts.isPinching = false;
        ts.lastDist = 0;
        ts.lastCenter = null;
        ts.isLongPress = false;
        setDraggingElementId(null);
      } else if (e.touches.length === 1) {
        // One finger remains (lifted from 2-finger gesture)
        const remaining = e.touches[0];
        ts.startPos = { x: remaining.clientX, y: remaining.clientY };
        ts.lastDist = 0;
        ts.lastCenter = null;
        ts.isPinching = false;
        ts.hasMoved = false;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [elements, selectedId, activeTool, zoom, pan, onSelect, onUpdate, onCanvasTap, getPaperCoords, snap]);

  // Clamp pan to keep paper visible
  const { offsetX, offsetY } = getPaperOffset();
  const scaledW = paperWidth * zoom;
  const scaledH = paperHeight * zoom;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden touch-none select-none"
      style={{ backgroundColor: '#FAF6EF' }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      {/* Paper */}
      <div
        className="absolute"
        style={{
          left: offsetX + pan.x,
          top: offsetY + pan.y,
          width: scaledW,
          height: scaledH,
          willChange: 'transform',
        }}
      >
        <div
          ref={paperRef}
          className="relative bg-white shadow-lg"
          style={{
            width: scaledW,
            height: scaledH,
            borderRadius: '2px',
            border: '1px solid #E7E5E0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Page background */}
          <div className="absolute inset-0 pointer-events-none" style={getPageBackgroundStyle()} />

          {/* Elements - scaled container */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              width: paperWidth,
              height: paperHeight,
              transform: `scale(${zoom})`,
            }}
          >
            {elements.map((el) => (
              <div
                key={el.id}
                data-element-id={el.id}
                className={cn(
                  "absolute",
                  draggingElementId === el.id && "opacity-80"
                )}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: el.zIndex,
                }}
              >
                <MobileCanvasElement
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                />
              </div>
            ))}
          </div>

          {/* Empty state */}
          {elements.length === 0 && activeTool === 'select' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-sm text-ink-tertiary text-center px-8">
                Tap + to add elements, or tap a tool then tap here to place it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls overlay */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-border-light px-2 py-1.5">
          <button
            onClick={onZoomOut}
            className="w-10 h-10 flex items-center justify-center rounded-md active:bg-canvas-dark transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
          </button>
          <span className="text-[13px] font-medium text-ink min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="w-10 h-10 flex items-center justify-center rounded-md active:bg-canvas-dark transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
          </button>
          <button
            onClick={onZoomFit}
            className="w-10 h-10 flex items-center justify-center rounded-md active:bg-canvas-dark transition-colors"
            aria-label="Fit to width"
          >
            <Maximize2 className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Active tool indicator */}
      {activeTool !== 'select' && (
        <div className="absolute top-3 left-3 z-30 bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
          Tap canvas to place {activeTool.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      )}
    </div>
  );
}

/* Simplified element renderer for mobile - wraps the existing renderers */
function MobileCanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
}: {
  element: WorksheetElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
}) {
  // Build element style
  const rotation = element.rotation || 0;
  const opacity = element.opacity !== undefined ? element.opacity : 1;
  const borderRadius = (element as { borderRadius?: number }).borderRadius || 0;
  const borderStyle = (element as { borderStyle?: string }).borderStyle;
  const borderWidth = (element as { borderWidth?: number }).borderWidth;
  const border = (element as { border?: boolean }).border;
  const borderColor = (element as { borderColor?: string }).borderColor;

  const elementStyle: React.CSSProperties = {
    left: 0,
    top: 0,
    width: element.width,
    height: element.height,
    cursor: 'grab',
    transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
    opacity,
    borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
    border: border || borderStyle
      ? `${borderWidth || 1}px ${borderStyle || 'solid'} ${borderColor || '#D6D3CC'}`
      : undefined,
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  return (
    <div
      className="relative w-full h-full"
      style={elementStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {/* Selection border - touch-optimized, thicker */}
      {isSelected && (
        <div
          className="absolute -inset-[3px] rounded-sm pointer-events-none"
          style={{
            border: '3px solid #D97757',
            backgroundColor: 'rgba(250, 243, 239, 0.15)',
            borderRadius: borderRadius > 0 ? `${borderRadius + 3}px` : undefined,
          }}
        />
      )}

      {/* Touch handle indicators for selected element */}
      {isSelected && (
        <>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-accent rounded-full" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-accent rounded-full" />
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-full" />
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-full" />
        </>
      )}

      {/* Content */}
      <div className="w-full h-full overflow-hidden" style={{
        borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
      }}>
        <CanvasElement
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onUpdate={onUpdate}
          onDragStart={() => {}}
          onResizeStart={() => {}}
        />
      </div>
    </div>
  );
}
