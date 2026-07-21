import { Undo2, Redo2, Download, PenTool, Plus, X, Sparkles, BarChart3, Share2 } from 'lucide-react';
import type { Worksheet } from '@/types/worksheet';
import type { SaveState } from '@/components/share/SaveButton';
import SaveButton from '@/components/share/SaveButton';
import ViewToggle from './ViewToggle';
import type { ViewMode } from './ViewToggle';

interface EditorTopBarProps {
  worksheet: Worksheet;
  currentPageIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  saveState: SaveState;
  hasSupabase: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onTitleChange: (title: string) => void;
  onPageChange: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (index: number) => void;
  onExport: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onShare: () => void;
  onBack: () => void;
  onToggleAIPanel: () => void;
  showAIPanel: boolean;
  onAnalytics?: () => void;
}

export default function EditorTopBar({
  worksheet,
  currentPageIndex,
  canUndo,
  canRedo,
  saveState,
  hasSupabase,
  viewMode,
  onViewModeChange,
  onUndo,
  onRedo,
  onTitleChange,
  onPageChange,
  onAddPage,
  onRemovePage,
  onExport,
  onSave,
  onSaveAs,
  onShare,
  onBack,
  onToggleAIPanel,
  showAIPanel,
  onAnalytics,
}: EditorTopBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-border-light flex items-center justify-between px-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Left -- Brand + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-sm bg-accent flex items-center justify-center">
            <PenTool className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-serif text-[20px] text-ink tracking-[-0.01em] hidden sm:block">
            Worksheet Forge
          </span>
        </button>
        <div className="w-px h-5 bg-border-light mx-1" />
        <input
          type="text"
          value={worksheet.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-[14px] font-medium text-ink bg-transparent border-none outline-none focus:ring-0 w-48"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* Center -- View Toggle + Page Tabs */}
      <div className="flex items-center gap-3">
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />

        <div className="w-px h-5 bg-border-light" />

        <div className="flex items-center gap-1">
          {worksheet.pages.map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`
                relative flex items-center gap-1 px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-150
                ${currentPageIndex === i
                  ? 'bg-accent-light text-accent'
                  : 'bg-transparent text-ink-secondary hover:bg-canvas-dark'
                }
              `}
            >
              Page {i + 1}
              {worksheet.pages.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePage(i);
                  }}
                  className="ml-1 hover:text-error transition-colors"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </span>
              )}
              {currentPageIndex === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={onAddPage}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-canvas-dark text-ink-secondary transition-colors duration-150"
            aria-label="Add page"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Right -- Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          onClick={onToggleAIPanel}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150
            ${showAIPanel
              ? 'bg-accent text-white'
              : 'text-ink-secondary hover:bg-canvas-dark'
            }
          `}
          title="AI Worksheet Generator"
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">AI</span>
        </button>
        <div className="w-px h-5 bg-border-light" />
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            flex items-center gap-1 px-2 py-1.5 rounded-md text-[13px] transition-all duration-150
            ${canUndo
              ? 'text-ink-secondary hover:bg-canvas-dark'
              : 'text-ink-tertiary opacity-40 cursor-not-allowed'
            }
          `}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`
            flex items-center gap-1 px-2 py-1.5 rounded-md text-[13px] transition-all duration-150
            ${canRedo
              ? 'text-ink-secondary hover:bg-canvas-dark'
              : 'text-ink-tertiary opacity-40 cursor-not-allowed'
            }
          `}
          title="Redo (Ctrl+Shift+Y)"
        >
          <Redo2 className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="w-px h-5 bg-border-light mx-1" />
        {onAnalytics && (
          <button
            onClick={onAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-ink-secondary hover:text-accent hover:bg-accent-lightest rounded-md transition-colors duration-150"
            title="View Analytics"
          >
            <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Analytics</span>
          </button>
        )}

        {/* Save button (only if Supabase configured) */}
        {hasSupabase && (
          <>
            <SaveButton
              state={saveState}
              onSave={onSave}
              onSaveAs={onSaveAs}
              disabled={!hasSupabase}
            />

            {/* Share button */}
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-ink-secondary border border-border-light hover:bg-canvas-dark hover:text-ink transition-all duration-150"
              title="Share worksheet"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <div className="w-px h-5 bg-border-light mx-1" />
          </>
        )}

        {/* Export PDF */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-1.5 bg-accent text-white rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors duration-150 active:scale-[0.98]"
        >
          <Download className="w-4 h-4" strokeWidth={1.5} />
          Export PDF
        </button>
      </div>
    </div>
  );
}
