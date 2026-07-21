import { useCallback, useRef, useState, useEffect } from 'react';
import type { WorksheetElement } from '@/types/worksheet';
import CanvasElement from './CanvasElement';
import ZoomControls from './ZoomControls';
import { PlusCircle, ArrowDown } from 'lucide-react';
import type { Worksheet } from '@/types/worksheet';

interface CanvasProps {
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
  onCanvasClick: (e: React.MouseEvent) => void;
  worksheet: Worksheet;
}

export default function Canvas({
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
  onCanvasClick,
  worksheet,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    isDragging: boolean;
  } | null>(null);
  const resizeState = useRef<{
    id: string;
    handle: string;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origX: number;
    origY: number;
    isResizing: boolean;
  } | null>(null);
  const [, setDraggingId] = useState<string | null>(null);
  const [, setResizingId] = useState<string | null>(null);

  const snap = useCallback((val: number) => {
    if (!snapToGrid) return val;
    return Math.round(val / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const el = elements.find((x) => x.id === id);
    if (!el) return;
    dragState.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      isDragging: false,
    };
    setDraggingId(id);
  }, [elements]);

  const handleResizeStart = useCallback((id: string, handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const el = elements.find((x) => x.id === id);
    if (!el) return;
    resizeState.current = {
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origW: el.width,
      origH: el.height,
      origX: el.x,
      origY: el.y,
      isResizing: false,
    };
    setResizingId(id);
  }, [elements]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // Handle drag
      if (dragState.current) {
        const ds = dragState.current;
        const dx = (e.clientX - ds.startX) / zoom;
        const dy = (e.clientY - ds.startY) / zoom;

        if (!ds.isDragging && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          ds.isDragging = true;
        }

        if (ds.isDragging) {
          const newX = snap(Math.max(0, ds.origX + dx));
          const newY = snap(Math.max(0, ds.origY + dy));
          onUpdate(ds.id, { x: newX, y: newY });
        }
      }

      // Handle resize
      if (resizeState.current) {
        const rs = resizeState.current;
        const dx = (e.clientX - rs.startX) / zoom;
        const dy = (e.clientY - rs.startY) / zoom;

        if (!rs.isResizing && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          rs.isResizing = true;
        }

        if (rs.isResizing) {
          let newW = rs.origW;
          let newH = rs.origH;
          let newX = rs.origX;
          let newY = rs.origY;

          if (rs.handle.includes('e')) newW = snap(Math.max(40, rs.origW + dx));
          if (rs.handle.includes('s')) newH = snap(Math.max(20, rs.origH + dy));
          if (rs.handle.includes('w')) {
            const proposed = snap(rs.origX + dx);
            newW = snap(Math.max(40, rs.origW + (rs.origX - proposed)));
            if (newW >= 40) newX = proposed;
          }
          if (rs.handle.includes('n')) {
            const proposed = snap(rs.origY + dy);
            newH = snap(Math.max(20, rs.origH + (rs.origY - proposed)));
            if (newH >= 20) newY = proposed;
          }

          onUpdate(rs.id, { x: newX, y: newY, width: newW, height: newH });
        }
      }
    }

    function onMouseUp() {
      if (dragState.current) {
        dragState.current = null;
        setDraggingId(null);
      }
      if (resizeState.current) {
        resizeState.current = null;
        setResizingId(null);
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [zoom, snap, onUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete(selectedId);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const el = elements.find((x) => x.id === selectedId);
        if (!el) return;
        const step = snapToGrid ? gridSize : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        onUpdate(selectedId, { x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) });
        return;
      }

      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        onDuplicate(selectedId);
        return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, elements, snapToGrid, gridSize, onDelete, onUpdate, onDuplicate]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas/paper background
    if (e.target === canvasRef.current || e.target === paperRef.current) {
      onSelect(null);
      onCanvasClick(e);
    }
  }, [onSelect, onCanvasClick]);

  // Grid background style
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

  // Page background style based on worksheet setting
  const pageBackground = worksheet.pageBackground || 'blank';
  const columns = worksheet.columns || 1;
  const columnGap = worksheet.columnGap || 24;

  const getPageBackgroundStyle = (): React.CSSProperties => {
    switch (pageBackground) {
      case 'lined':
        return {
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, #E7E5E0 23px, #E7E5E0 24px)',
          backgroundSize: '100% 24px',
          backgroundPosition: '0 0',
        };
      case 'graph':
        return {
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 19px, #F0EBE0 19px, #F0EBE0 20px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, #F0EBE0 19px, #F0EBE0 20px)
          `,
          backgroundSize: '20px 20px',
        };
      case 'dot':
        return {
          backgroundImage: 'radial-gradient(circle, #D6D3CC 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        };
      case 'story':
        return {
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 47px, #E7E5E0 47px, #E7E5E0 48px)',
          backgroundSize: '100% 48px',
          backgroundPosition: '0 0',
        };
      case 'manuscript':
        return {
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 27px, #A8A29E 27px, #A8A29E 28px, transparent 28px, transparent 55px, #A8A29E 55px, #A8A29E 56px)
          `,
          backgroundSize: '100% 56px',
          backgroundPosition: '0 0',
        };
      case 'blank':
      default:
        return {};
    }
  };

  // Column guides
  const columnGuides = columns > 1 ? (
    <div className="absolute inset-0 pointer-events-none flex" style={{ padding: '0' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="h-full border-r border-dashed border-border-light/50"
          style={{
            width: `${100 / columns}%`,
            marginRight: i < columns - 1 ? `${columnGap}px` : '0',
          }}
        />
      ))}
    </div>
  ) : null;

  return (
    <div
      ref={canvasRef}
      className="fixed top-12 left-[72px] right-[280px] h-[calc(100vh-48px)] overflow-auto"
      style={{ backgroundColor: '#FAF6EF' }}
      onClick={handleCanvasClick}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={gridStyle}
      />

      {/* Paper container (centered) */}
      <div className="flex items-start justify-center py-10 px-10">
        <div
          ref={paperRef}
          className="relative bg-white shadow-lg"
          style={{
            width: paperWidth * zoom,
            height: paperHeight * zoom,
            borderRadius: '2px',
            border: '1px solid #E7E5E0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          }}
          onClick={handleCanvasClick}
        >
          {/* Page background pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={getPageBackgroundStyle()}
          />

          {/* Column guides */}
          {columnGuides}

          {/* Elements container (unscaled coordinates, CSS scaled) */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              width: paperWidth,
              height: paperHeight,
              transform: `scale(${zoom})`,
            }}
          >
            {elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                isSelected={selectedId === el.id}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
              />
            ))}
          </div>

          {/* Empty state */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <PlusCircle
                className="w-12 h-12 text-ink-tertiary mb-4 animate-pulse"
                strokeWidth={1.5}
                style={{ animationDuration: '2s' }}
              />
              <p className="text-[14px] text-ink-tertiary">
                Click a tool on the left to start building your worksheet
              </p>
              <ArrowDown
                className="w-5 h-5 text-ink-tertiary mt-2"
                strokeWidth={1.5}
                style={{ animation: 'bounce 1.5s ease-in-out infinite' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="fixed bottom-4 left-[88px] z-40">
        <ZoomControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onZoomFit={onZoomFit}
        />
      </div>
    </div>
  );
}
