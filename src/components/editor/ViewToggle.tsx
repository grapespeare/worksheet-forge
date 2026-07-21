import { Layout, BookOpen } from 'lucide-react';

export type ViewMode = 'page' | 'lesson';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div
      className="flex items-center bg-canvas-dark rounded-lg p-0.5 gap-0.5"
      style={{ height: '32px' }}
    >
      <button
        onClick={() => onChange('page')}
        className={`
          flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-150 h-full
          ${mode === 'page'
            ? 'bg-white text-ink shadow-sm'
            : 'text-ink-secondary hover:text-ink'
          }
        `}
        title="Page View - freeform canvas layout"
      >
        <Layout className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">Page</span>
      </button>
      <button
        onClick={() => onChange('lesson')}
        className={`
          flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-150 h-full
          ${mode === 'lesson'
            ? 'bg-white text-ink shadow-sm'
            : 'text-ink-secondary hover:text-ink'
          }
        `}
        title="Lesson View - structured sections with time estimates"
      >
        <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">Lesson</span>
      </button>
    </div>
  );
}
