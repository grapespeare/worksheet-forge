import { useState, useCallback, useEffect, useRef } from 'react';
import type { Worksheet, WorksheetElement, ElementType } from '@/types/worksheet';
import type { ToolType } from '@/components/editor/Toolbar';
import type { ViewMode } from '@/components/editor/ViewToggle';
import { createDefaultElement } from '@/lib/worksheet';
import { useMobile } from '@/hooks/use-mobile';
import MobileCanvas from './MobileCanvas';
import MobileToolSheet from './MobileToolSheet';
import MobilePropertiesSheet from './MobilePropertiesSheet';
import MobilePageManager from './MobilePageManager';
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Share2,
  Plus,
  Grid3X3,
  SlidersHorizontal,
  MoreHorizontal,
  Layers,
  Maximize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileEditorProps {
  worksheet: Worksheet;
  currentPageIndex: number;
  selectedElementId: string | null;
  activeTool: ToolType;
  viewMode: ViewMode;
  zoom: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  undoStack: Worksheet[];
  redoStack: Worksheet[];
  dispatch: React.Dispatch<EditorAction>;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onShare: () => void;
  onTitleChange: (title: string) => void;
  onUpdateElement: (id: string, updates: Partial<WorksheetElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: () => void;
  onBack: () => void;
  paperWidth: number;
  paperHeight: number;
  currentElements: WorksheetElement[];
  selectedElement: WorksheetElement | null;
}

// Re-declare EditorAction type locally to avoid circular deps
type EditorAction =
  | { type: 'SET_WORKSHEET'; payload: Worksheet }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'ZOOM_FIT' }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_GRID_SIZE'; size: number }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'ADD_ELEMENT'; element: WorksheetElement }
  | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<WorksheetElement> }
  | { type: 'DELETE_ELEMENT'; id: string }
  | { type: 'DUPLICATE_ELEMENT'; id: string }
  | { type: 'BRING_TO_FRONT'; id: string }
  | { type: 'SEND_TO_BACK'; id: string }
  | { type: 'CHANGE_PAGE'; index: number }
  | { type: 'ADD_PAGE' }
  | { type: 'REMOVE_PAGE'; index: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_WORKSHEET'; updates: Partial<Worksheet> }
  | { type: 'SAVE_STATE' };

export default function MobileEditor({
  worksheet,
  currentPageIndex,
  selectedElementId,
  activeTool,
  zoom,
  showGrid,
  gridSize,
  snapToGrid,
  undoStack,
  redoStack,
  dispatch,
  onUndo,
  onRedo,
  onSave,
  onShare,
  onTitleChange,
  onUpdateElement,
  onDelete,
  onDuplicate,
  onExport,
  onBack,
  paperWidth,
  paperHeight,
  currentElements,
  selectedElement,
}: MobileEditorProps) {
  const { isTouch } = useMobile();

  // Bottom sheet states
  const [toolSheetOpen, setToolSheetOpen] = useState(false);
  const [propertiesSheetOpen, setPropertiesSheetOpen] = useState(false);
  const [pageManagerOpen, setPageManagerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Editing title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(worksheet.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Last used tool for quick-add
  const [lastUsedTool, setLastUsedTool] = useState<ElementType>('text');

  // Track saved state feedback
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Update title input when worksheet changes
  useEffect(() => {
    setTitleInput(worksheet.title);
  }, [worksheet.title]);

  // Auto-focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle canvas tap to place element
  const handleCanvasTap = useCallback((paperX: number, paperY: number) => {
    if (activeTool !== 'select') {
      dispatch({ type: 'SAVE_STATE' });
      const newEl = createDefaultElement(activeTool as ElementType, Math.max(0, paperX - 50), Math.max(0, paperY - 20));
      dispatch({ type: 'ADD_ELEMENT', element: newEl });
      setLastUsedTool(activeTool as ElementType);
    }
  }, [activeTool, dispatch]);

  // Quick add element
  const handleQuickAdd = useCallback(() => {
    dispatch({ type: 'SAVE_STATE' });
    const newEl = createDefaultElement(lastUsedTool, 50, 50 + currentElements.length * 10);
    dispatch({ type: 'ADD_ELEMENT', element: newEl });
    dispatch({ type: 'SET_TOOL', tool: 'select' });
  }, [lastUsedTool, currentElements.length, dispatch]);

  // Handle save with feedback
  const handleSave = useCallback(() => {
    onSave();
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 1500);
  }, [onSave]);

  // Handle title save
  const handleTitleSave = useCallback(() => {
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    } else {
      setTitleInput(worksheet.title);
    }
    setIsEditingTitle(false);
  }, [titleInput, onTitleChange, worksheet.title]);

  // Handle tool select
  const handleToolSelect = useCallback((tool: ToolType) => {
    dispatch({ type: 'SET_TOOL', tool });
    if (tool !== 'select') {
      setLastUsedTool(tool as ElementType);
    }
  }, [dispatch]);

  // Handle bring to front / send to back
  const handleBringToFront = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'BRING_TO_FRONT', id });
  }, [dispatch]);

  const handleSendToBack = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'SEND_TO_BACK', id });
  }, [dispatch]);

  const handleDuplicate = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE' });
    onDuplicate(id);
  }, [onDuplicate, dispatch]);

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE' });
    onDelete(id);
    setPropertiesSheetOpen(false);
  }, [onDelete, dispatch]);

  // Page indicator dots
  const pageDots = worksheet.pages.map((_, i) => (
    <button
      key={i}
      onClick={() => dispatch({ type: 'CHANGE_PAGE', index: i })}
      className={cn(
        'w-2 h-2 rounded-full transition-all shrink-0',
        i === currentPageIndex
          ? 'bg-accent w-5'
          : 'bg-border-medium active:bg-ink-tertiary'
      )}
      aria-label={`Go to page ${i + 1}`}
    />
  ));

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-canvas overflow-hidden">
      {/* === TOP BAR === */}
      <header className="shrink-0 h-12 bg-white border-b border-border-light flex items-center px-3 gap-2 z-40">
        {/* Back button */}
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-canvas-dark transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-ink" strokeWidth={1.5} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setTitleInput(worksheet.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-sm font-semibold text-ink bg-canvas-dark border border-accent rounded-md px-2 py-1 outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="w-full text-left min-w-0"
            >
              <h1 className="text-sm font-semibold text-ink truncate">
                {worksheet.title}
              </h1>
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onUndo}
            disabled={undoStack.length === 0}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
              undoStack.length > 0 ? 'active:bg-canvas-dark' : 'opacity-30'
            )}
            aria-label="Undo"
          >
            <Undo2 className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
          </button>
          <button
            onClick={onRedo}
            disabled={redoStack.length === 0}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
              redoStack.length > 0 ? 'active:bg-canvas-dark' : 'opacity-30'
            )}
            aria-label="Redo"
          >
            <Redo2 className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
          </button>
          <button
            onClick={handleSave}
            className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-canvas-dark transition-colors relative"
            aria-label="Save"
          >
            <Save className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
            {showSavedFeedback && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-in fade-in">
                Saved
              </span>
            )}
          </button>
          <button
            onClick={onShare}
            className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-canvas-dark transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-ink-secondary" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* === CANVAS AREA === */}
      <MobileCanvas
        elements={currentElements}
        selectedId={selectedElementId}
        onSelect={(id) => dispatch({ type: 'SELECT_ELEMENT', id })}
        onUpdate={onUpdateElement}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        paperWidth={paperWidth}
        paperHeight={paperHeight}
        showGrid={showGrid}
        gridSize={gridSize}
        snapToGrid={snapToGrid}
        zoom={zoom}
        onZoomIn={() => dispatch({ type: 'ZOOM_IN' })}
        onZoomOut={() => dispatch({ type: 'ZOOM_OUT' })}
        onZoomFit={() => dispatch({ type: 'ZOOM_FIT' })}
        onCanvasTap={handleCanvasTap}
        worksheet={worksheet}
        activeTool={activeTool}
      />

      {/* === PAGE INDICATOR === */}
      {worksheet.pages.length > 1 && (
        <div className="shrink-0 bg-white border-t border-border-light py-2 px-4 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPageManagerOpen(true)}
            className="flex items-center gap-2 px-2"
          >
            <div className="flex items-center gap-1">
              {pageDots}
            </div>
            <span className="text-[11px] text-ink-tertiary ml-1">
              {currentPageIndex + 1} / {worksheet.pages.length}
            </span>
          </button>
        </div>
      )}

      {/* === BOTTOM ACTION BAR === */}
      <nav className="shrink-0 h-14 bg-white border-t border-border-light flex items-center justify-around px-2 z-40">
        {/* Tool Grid */}
        <button
          onClick={() => setToolSheetOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-lg transition-colors',
            activeTool !== 'select' ? 'text-accent' : 'text-ink-secondary',
            'active:bg-canvas-dark'
          )}
          aria-label="Tools"
        >
          <Grid3X3 className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium">Tools</span>
        </button>

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          className="flex flex-col items-center justify-center w-14 h-14 -mt-4 bg-accent rounded-full shadow-lg shadow-accent/30 active:scale-95 active:opacity-90 transition-all"
          aria-label="Quick add"
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2} />
        </button>

        {/* Properties */}
        <button
          onClick={() => selectedElementId && setPropertiesSheetOpen(true)}
          disabled={!selectedElementId}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-lg transition-colors',
            selectedElementId ? 'text-ink-secondary active:bg-canvas-dark' : 'text-ink-tertiary opacity-40'
          )}
          aria-label="Properties"
        >
          <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium">Props</span>
        </button>

        {/* More Menu */}
        <button
          onClick={() => setMoreMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-lg text-ink-secondary active:bg-canvas-dark transition-colors"
          aria-label="More"
        >
          <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[9px] font-medium">More</span>
        </button>
      </nav>

      {/* === BOTTOM SHEETS === */}

      {/* Tool Sheet */}
      <MobileToolSheet
        open={toolSheetOpen}
        onOpenChange={setToolSheetOpen}
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
      />

      {/* Properties Sheet */}
      <MobilePropertiesSheet
        open={propertiesSheetOpen}
        onOpenChange={setPropertiesSheetOpen}
        element={selectedElement}
        onUpdate={onUpdateElement}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      {/* Page Manager */}
      <MobilePageManager
        open={pageManagerOpen}
        onOpenChange={setPageManagerOpen}
        pages={worksheet.pages}
        currentPageIndex={currentPageIndex}
        onChangePage={(i) => dispatch({ type: 'CHANGE_PAGE', index: i })}
        onAddPage={() => {
          dispatch({ type: 'SAVE_STATE' });
          dispatch({ type: 'ADD_PAGE' });
        }}
        onRemovePage={(i) => {
          if (worksheet.pages.length > 1) {
            dispatch({ type: 'SAVE_STATE' });
            dispatch({ type: 'REMOVE_PAGE', index: i });
          }
        }}
      />

      {/* More Menu */}
      <MoreMenuSheet
        open={moreMenuOpen}
        onOpenChange={setMoreMenuOpen}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        onToggleGrid={() => dispatch({ type: 'TOGGLE_GRID' })}
        onToggleSnap={() => dispatch({ type: 'TOGGLE_SNAP' })}
        onOpenPageManager={() => {
          setMoreMenuOpen(false);
          setPageManagerOpen(true);
        }}
        onExport={onExport}
      />
    </div>
  );
}

/* More Menu Sheet */
function MoreMenuSheet({
  open,
  onOpenChange,
  showGrid,
  snapToGrid,
  onToggleGrid,
  onToggleSnap,
  onOpenPageManager,
  onExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onOpenPageManager: () => void;
  onExport: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-auto pb-safe">
        <div className="py-2">
          <div className="mx-auto w-10 h-1 rounded-full bg-border-medium mb-4" />

          <div className="space-y-1 px-4">
            <MoreMenuItem
              icon={<Layers className="w-5 h-5" strokeWidth={1.5} />}
              label="Page Manager"
              onClick={() => {
                onOpenChange(false);
                setTimeout(onOpenPageManager, 200);
              }}
            />
            <MoreMenuItem
              icon={showGrid
                ? <Eye className="w-5 h-5" strokeWidth={1.5} />
                : <EyeOff className="w-5 h-5" strokeWidth={1.5} />
              }
              label={showGrid ? 'Hide Grid' : 'Show Grid'}
              onClick={onToggleGrid}
            />
            <MoreMenuItem
              icon={<Grid3X3 className="w-5 h-5" strokeWidth={1.5} />}
              label={snapToGrid ? 'Disable Snap' : 'Enable Snap'}
              onClick={onToggleSnap}
            />
            <MoreMenuItem
              icon={<Maximize2 className="w-5 h-5" strokeWidth={1.5} />}
              label="Export PDF"
              onClick={() => {
                onExport();
                onOpenChange(false);
              }}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MoreMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 h-12 rounded-lg text-ink active:bg-canvas-dark transition-colors text-sm"
    >
      <span className="text-ink-secondary">{icon}</span>
      {label}
    </button>
  );
}
