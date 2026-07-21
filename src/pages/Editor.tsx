import { useReducer, useCallback, useEffect, useState } from 'react';
import { useView } from '@/context/ViewContext';
import type { Worksheet, WorksheetElement, ElementType } from '@/types/worksheet';
import type { ViewMode } from '@/components/editor/ViewToggle';
import {
  createBlankWorksheet,
  createDefaultElement,
  duplicateElement,
  getPageDimensions,
} from '@/lib/worksheet';
import { saveWorksheet, saveWorksheetAs, loadWorksheet } from '@/lib/worksheet-db';
import type { ToolType } from '@/components/editor/Toolbar';
import type { SaveState } from '@/components/share/SaveButton';
import EditorTopBar from '@/components/editor/EditorTopBar';
import Toolbar from '@/components/editor/Toolbar';
import Canvas from '@/components/editor/Canvas';
import LessonView from '@/components/editor/LessonView';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import AIPanel from '@/components/ai/AIPanel';
import ShareDialog from '@/components/share/ShareDialog';

/* -- State -- */
interface EditorState {
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
}

type EditorAction =
  | { type: 'SET_WORKSHEET'; payload: Worksheet }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
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

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

function getInitialState(): EditorState {
  return {
    worksheet: createBlankWorksheet(),
    currentPageIndex: 0,
    selectedElementId: null,
    activeTool: 'select',
    viewMode: 'page',
    zoom: 1,
    showGrid: true,
    gridSize: 8,
    snapToGrid: true,
    undoStack: [],
    redoStack: [],
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_WORKSHEET':
      return { ...state, worksheet: action.payload };

    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.id };

    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selectedElementId: null };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode, selectedElementId: null };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(2, action.zoom)) };

    case 'ZOOM_IN': {
      const idx = ZOOM_LEVELS.findIndex((z) => z > state.zoom);
      return { ...state, zoom: idx >= 0 ? ZOOM_LEVELS[idx] : 2 };
    }

    case 'ZOOM_OUT': {
      const idx = ZOOM_LEVELS.slice().reverse().findIndex((z) => z < state.zoom);
      return { ...state, zoom: idx >= 0 ? ZOOM_LEVELS[ZOOM_LEVELS.length - 1 - idx] : 0.25 };
    }

    case 'ZOOM_FIT':
      return { ...state, zoom: 1 };

    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };

    case 'SET_GRID_SIZE':
      return { ...state, gridSize: action.size };

    case 'TOGGLE_SNAP':
      return { ...state, snapToGrid: !state.snapToGrid };

    case 'ADD_ELEMENT': {
      const pages = [...state.worksheet.pages];
      const page = { ...pages[state.currentPageIndex], elements: [...(pages[state.currentPageIndex].elements || [])] };
      const maxZ = page.elements.reduce((m, el) => Math.max(m, el.zIndex), 0);
      const elWithZ = { ...action.element, zIndex: maxZ + 1 };
      page.elements.push(elWithZ);
      pages[state.currentPageIndex] = page;
      return {
        ...state,
        worksheet: { ...state.worksheet, pages },
        selectedElementId: action.element.id,
        activeTool: 'select',
      };
    }

    case 'UPDATE_ELEMENT': {
      const pages = [...state.worksheet.pages];
      const page = pages[state.currentPageIndex];

      // Try sections first (new format)
      if (page.sections && page.sections.length > 0) {
        const newSections = page.sections.map((section) => ({
          ...section,
          elements: section.elements.map((el) =>
            el.id === action.id ? { ...el, ...action.updates } as WorksheetElement : el
          ),
        }));
        pages[state.currentPageIndex] = { ...page, sections: newSections };
      } else {
        // Legacy format
        const elements = [...(page.elements || [])];
        const idx = elements.findIndex((e) => e.id === action.id);
        if (idx === -1) return state;
        elements[idx] = { ...elements[idx], ...action.updates } as WorksheetElement;
        pages[state.currentPageIndex] = { ...page, elements };
      }

      return { ...state, worksheet: { ...state.worksheet, pages } };
    }

    case 'DELETE_ELEMENT': {
      const pages = [...state.worksheet.pages];
      const page = pages[state.currentPageIndex];

      if (page.sections && page.sections.length > 0) {
        const newSections = page.sections.map((section) => ({
          ...section,
          elements: section.elements.filter((el) => el.id !== action.id),
        }));
        pages[state.currentPageIndex] = { ...page, sections: newSections };
      } else {
        const elements = (page.elements || []).filter((e) => e.id !== action.id);
        pages[state.currentPageIndex] = { ...page, elements };
      }

      return {
        ...state,
        worksheet: { ...state.worksheet, pages },
        selectedElementId: state.selectedElementId === action.id ? null : state.selectedElementId,
      };
    }

    case 'DUPLICATE_ELEMENT': {
      const pages = [...state.worksheet.pages];
      const page = pages[state.currentPageIndex];
      let foundEl: WorksheetElement | undefined;

      if (page.sections && page.sections.length > 0) {
        for (const section of page.sections) {
          foundEl = section.elements.find((e) => e.id === action.id);
          if (foundEl) break;
        }
      } else {
        foundEl = (page.elements || []).find((e) => e.id === action.id);
      }

      if (!foundEl) return state;

      const copy = duplicateElement(foundEl);

      if (page.sections && page.sections.length > 0) {
        // Add to the first section that contains the original
        const newSections = page.sections.map((section) => {
          if (section.elements.some((e) => e.id === action.id)) {
            const maxZ = section.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
            copy.zIndex = maxZ + 1;
            return { ...section, elements: [...section.elements, copy] };
          }
          return section;
        });
        pages[state.currentPageIndex] = { ...page, sections: newSections };
      } else {
        const elements = [...(page.elements || [])];
        const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
        copy.zIndex = maxZ + 1;
        elements.push(copy);
        pages[state.currentPageIndex] = { ...page, elements };
      }

      return {
        ...state,
        worksheet: { ...state.worksheet, pages },
        selectedElementId: copy.id,
      };
    }

    case 'BRING_TO_FRONT': {
      const pages = [...state.worksheet.pages];
      const page = pages[state.currentPageIndex];

      if (page.sections && page.sections.length > 0) {
        let found = false;
        const newSections = page.sections.map((section) => {
          if (section.elements.some((e) => e.id === action.id)) {
            const maxZ = section.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
            found = true;
            return {
              ...section,
              elements: section.elements.map((el) =>
                el.id === action.id ? { ...el, zIndex: maxZ + 1 } : el
              ),
            };
          }
          return section;
        });
        if (found) pages[state.currentPageIndex] = { ...page, sections: newSections };
      } else {
        const elements = [...(page.elements || [])];
        const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
        const idx = elements.findIndex((e) => e.id === action.id);
        if (idx === -1) return state;
        elements[idx] = { ...elements[idx], zIndex: maxZ + 1 };
        pages[state.currentPageIndex] = { ...page, elements };
      }

      return { ...state, worksheet: { ...state.worksheet, pages } };
    }

    case 'SEND_TO_BACK': {
      const pages = [...state.worksheet.pages];
      const page = pages[state.currentPageIndex];

      if (page.sections && page.sections.length > 0) {
        let found = false;
        const newSections = page.sections.map((section) => {
          if (section.elements.some((e) => e.id === action.id)) {
            const minZ = section.elements.reduce((m, e) => Math.min(m, e.zIndex), 0);
            found = true;
            return {
              ...section,
              elements: section.elements.map((el) =>
                el.id === action.id ? { ...el, zIndex: minZ - 1 } : el
              ),
            };
          }
          return section;
        });
        if (found) pages[state.currentPageIndex] = { ...page, sections: newSections };
      } else {
        const elements = [...(page.elements || [])];
        const minZ = elements.reduce((m, e) => Math.min(m, e.zIndex), 0);
        const idx = elements.findIndex((e) => e.id === action.id);
        if (idx === -1) return state;
        elements[idx] = { ...elements[idx], zIndex: minZ - 1 };
        pages[state.currentPageIndex] = { ...page, elements };
      }

      return { ...state, worksheet: { ...state.worksheet, pages } };
    }

    case 'CHANGE_PAGE':
      return { ...state, currentPageIndex: action.index, selectedElementId: null };

    case 'ADD_PAGE': {
      const pages = [...state.worksheet.pages, { elements: [] }];
      return { ...state, worksheet: { ...state.worksheet, pages }, currentPageIndex: pages.length - 1, selectedElementId: null };
    }

    case 'REMOVE_PAGE': {
      if (state.worksheet.pages.length <= 1) return state;
      const pages = state.worksheet.pages.filter((_, i) => i !== action.index);
      return {
        ...state,
        worksheet: { ...state.worksheet, pages },
        currentPageIndex: Math.min(state.currentPageIndex, pages.length - 1),
        selectedElementId: null,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        worksheet: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.worksheet],
        selectedElementId: null,
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        worksheet: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.worksheet],
        selectedElementId: null,
      };
    }

    case 'UPDATE_WORKSHEET':
      return { ...state, worksheet: { ...state.worksheet, ...action.updates } };

    case 'SAVE_STATE':
      return {
        ...state,
        undoStack: [...state.undoStack, state.worksheet].slice(-50),
        redoStack: [],
      };

    default:
      return state;
  }
}

/* -- Supabase config check -- */
const HAS_SUPABASE = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

/* -- Component -- */
export default function Editor() {
  const { navigateTo, navigateToAnalytics, user } = useView();
  const [state, dispatch] = useReducer(editorReducer, undefined, getInitialState);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>(HAS_SUPABASE ? 'unsaved' : 'offline');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [dbWorksheetId, setDbWorksheetId] = useState<string | null>(null);

  const {
    worksheet,
    currentPageIndex,
    selectedElementId,
    activeTool,
    viewMode,
    zoom,
    showGrid,
    gridSize,
    snapToGrid,
    undoStack,
    redoStack,
  } = state;

  // Get current elements depending on format
  const currentPage = worksheet.pages[currentPageIndex];
  const currentElements = currentPage
    ? (currentPage.elements || currentPage.sections?.flatMap((s) => s.elements) || [])
    : [];

  const selectedElement = currentElements.find((e) => e.id === selectedElementId) || null;

  const dims = getPageDimensions(worksheet);

  /* -- Load from query param on mount -- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadId = params.get('load');
    if (loadId && HAS_SUPABASE) {
      setSaveState('saving');
      loadWorksheet(loadId)
        .then(({ data, error }) => {
          if (data && !error) {
            dispatch({ type: 'SET_WORKSHEET', payload: data });
            setDbWorksheetId(loadId);
            setSaveState('saved');
          } else {
            setSaveState('unsaved');
          }
        })
        .catch(() => setSaveState('unsaved'));
    }
  }, []);

  /* -- Auto-save to localStorage -- */
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem('worksheet-forge-state', JSON.stringify(worksheet));
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [worksheet]);

  /* -- Keyboard shortcuts -- */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) {
          dispatch({ type: 'SAVE_STATE' });
          dispatch({ type: 'DUPLICATE_ELEMENT', id: selectedElementId });
        }
        return;
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_ELEMENT', id: null });
        dispatch({ type: 'SET_TOOL', tool: 'select' });
        return;
      }

      // Tool shortcuts
      const toolMap: Record<string, ToolType> = {
        v: 'select',
        t: 'text',
        h: 'heading',
        q: 'questionBox',
        m: 'multipleChoice',
        f: 'fillInBlank',
        d: 'divider',
        l: 'table',
        i: 'imagePlaceholder',
        s: 'diagram',
        n: 'numberLine',
        e: 'graphPaper',
        w: 'handwritingLines',
        x: 'equation',
        r: 'readingPassage',
        k: 'vocabularyBox',
        y: 'storyMap',
        c: 'characterAnalysis',
        o: 'compareContrast',
        a: 'artCritique',
        p: 'drawingPrompt',
        g: 'techniqueGrid',
        u: 'colorStudy',
      };
      if (!e.ctrlKey && !e.altKey && toolMap[e.key.toLowerCase()]) {
        dispatch({ type: 'SET_TOOL', tool: toolMap[e.key.toLowerCase()] });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedElementId]);

  /* -- Save handlers -- */
  const handleSave = useCallback(async () => {
    if (!HAS_SUPABASE) return;
    setSaveState('saving');
    try {
      const { data, error } = await saveWorksheet(worksheet, user?.id);
      if (!error && data) {
        setDbWorksheetId(data.id as string);
        setSaveState('saved');
        const url = new URL(window.location.href);
        url.searchParams.set('load', data.id as string);
        window.history.replaceState({}, '', url.toString());
        setTimeout(() => setSaveState('unsaved'), 3000);
      } else {
        setSaveState('unsaved');
      }
    } catch {
      setSaveState('unsaved');
    }
  }, [worksheet, user]);

  const handleSaveAs = useCallback(async () => {
    if (!HAS_SUPABASE) return;
    setSaveState('saving');
    try {
      const { data, error } = await saveWorksheetAs(worksheet, user?.id);
      if (!error && data) {
        setDbWorksheetId(data.id as string);
        setSaveState('saved');
        const url = new URL(window.location.href);
        url.searchParams.set('load', data.id as string);
        window.history.replaceState({}, '', url.toString());
        setTimeout(() => setSaveState('unsaved'), 3000);
      } else {
        setSaveState('unsaved');
      }
    } catch {
      setSaveState('unsaved');
    }
  }, [worksheet, user]);

  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'select') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const paperX = (e.clientX - rect.left) / zoom;
      const paperY = (e.clientY - rect.top) / zoom;
      dispatch({ type: 'SAVE_STATE' });
      const newEl = createDefaultElement(activeTool as ElementType, paperX, paperY);
      dispatch({ type: 'ADD_ELEMENT', element: newEl });
    }
  }, [activeTool, zoom]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<WorksheetElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, updates });
  }, []);

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'DELETE_ELEMENT', id });
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'DUPLICATE_ELEMENT', id });
  }, []);

  const handleExport = useCallback(() => {
    window.dispatchEvent(new CustomEvent('worksheet:export-pdf', { detail: { worksheet } }));
  }, [worksheet]);

  const handleTitleChange = useCallback((title: string) => {
    dispatch({ type: 'UPDATE_WORKSHEET', updates: { title } });
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', mode });
  }, []);

  // Determine effective worksheet ID for sharing
  const effectiveWorksheetId = dbWorksheetId || worksheet.id;

  return (
    <div className="h-[100dvh] w-screen overflow-hidden">
      {/* Top Bar */}
      <EditorTopBar
        worksheet={worksheet}
        currentPageIndex={currentPageIndex}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        saveState={saveState}
        hasSupabase={HAS_SUPABASE}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        onTitleChange={handleTitleChange}
        onPageChange={(i) => dispatch({ type: 'CHANGE_PAGE', index: i })}
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
        onExport={handleExport}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onShare={handleShare}
        onBack={() => navigateTo('home')}
        onToggleAIPanel={() => setShowAIPanel((s) => !s)}
        showAIPanel={showAIPanel}
        onAnalytics={() => navigateToAnalytics(worksheet.id)}
      />

      {/* Left Toolbar - only show in Page view */}
      {viewMode === 'page' && (
        <Toolbar
          activeTool={activeTool}
          onToolSelect={(tool) => dispatch({ type: 'SET_TOOL', tool })}
        />
      )}

      {/* Center - Canvas (Page view) or LessonView (Lesson view) */}
      {viewMode === 'page' ? (
        <Canvas
          elements={currentElements}
          selectedId={selectedElementId}
          onSelect={(id) => dispatch({ type: 'SELECT_ELEMENT', id })}
          onUpdate={handleUpdateElement}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          paperWidth={dims.width}
          paperHeight={dims.height}
          showGrid={showGrid}
          gridSize={gridSize}
          snapToGrid={snapToGrid}
          zoom={zoom}
          onZoomIn={() => dispatch({ type: 'ZOOM_IN' })}
          onZoomOut={() => dispatch({ type: 'ZOOM_OUT' })}
          onZoomFit={() => dispatch({ type: 'ZOOM_FIT' })}
          onCanvasClick={handleCanvasClick}
          worksheet={worksheet}
        />
      ) : (
        <LessonView
          worksheet={worksheet}
          currentPageIndex={currentPageIndex}
          selectedId={selectedElementId}
          onSelect={(id) => dispatch({ type: 'SELECT_ELEMENT', id })}
          onUpdate={handleUpdateElement}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onUpdateWorksheet={(updates) => dispatch({ type: 'UPDATE_WORKSHEET', updates })}
          zoom={zoom}
          onZoomIn={() => dispatch({ type: 'ZOOM_IN' })}
          onZoomOut={() => dispatch({ type: 'ZOOM_OUT' })}
          onZoomFit={() => dispatch({ type: 'ZOOM_FIT' })}
        />
      )}

      {/* Right Properties Panel */}
      <PropertiesPanel
        worksheet={worksheet}
        selectedElement={selectedElement}
        showGrid={showGrid}
        gridSize={gridSize}
        snapToGrid={snapToGrid}
        aiPanelOpen={showAIPanel}
        onUpdateWorksheet={(updates) => dispatch({ type: 'UPDATE_WORKSHEET', updates })}
        onUpdateElement={handleUpdateElement}
        onBringToFront={(id) => {
          dispatch({ type: 'SAVE_STATE' });
          dispatch({ type: 'BRING_TO_FRONT', id });
        }}
        onSendToBack={(id) => {
          dispatch({ type: 'SAVE_STATE' });
          dispatch({ type: 'SEND_TO_BACK', id });
        }}
        onDuplicate={handleDuplicate}
        onDelete={(id) => {
          dispatch({ type: 'SAVE_STATE' });
          dispatch({ type: 'DELETE_ELEMENT', id });
        }}
        onToggleGrid={() => dispatch({ type: 'TOGGLE_GRID' })}
        onSetGridSize={(size) => dispatch({ type: 'SET_GRID_SIZE', size })}
        onToggleSnap={() => dispatch({ type: 'TOGGLE_SNAP' })}
      />

      {/* AI Generation Panel */}
      <AIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        worksheet={worksheet}
        onReplaceWorksheet={(newWorksheet) => {
          dispatch({ type: 'SAVE_STATE' });
          dispatch({ type: 'SET_WORKSHEET', payload: newWorksheet });
          setShowAIPanel(false);
        }}
        onAppendElements={(elements) => {
          dispatch({ type: 'SAVE_STATE' });
          elements.forEach((el) => {
            dispatch({ type: 'ADD_ELEMENT', element: el });
          });
          setShowAIPanel(false);
        }}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        worksheetId={effectiveWorksheetId}
      />
    </div>
  );
}
