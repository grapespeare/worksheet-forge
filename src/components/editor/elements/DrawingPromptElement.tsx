import type { DrawingPromptElement as DrawingPromptElementType } from '@/types/worksheet';

interface Props {
  element: DrawingPromptElementType;
  isSelected: boolean;
}

export default function DrawingPromptElement({ element, isSelected }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-3 overflow-hidden"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="mb-2">
        <label className="text-[10px] text-ink-secondary uppercase tracking-wider block mb-1">Drawing Prompt</label>
        <div contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-ink outline-none">{element.prompt}</div>
      </div>
      <div className="flex-1 border-2 border-dashed border-border-medium rounded bg-white"
        style={{
          minHeight: `${Math.max(60, element.drawingAreaHeight - 40)}px`,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, #F0EBE0 19px, #F0EBE0 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #F0EBE0 19px, #F0EBE0 20px)`,
          backgroundSize: '20px 20px',
        }}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[11px] text-ink-tertiary italic">Drawing area</span>
        </div>
      </div>
      {element.guidelines && element.guidelines.length > 0 && (
        <div className="mt-2">
          <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Guidelines</label>
          <ol className="list-decimal list-inside space-y-0.5">
            {element.guidelines.map((g, i) => <li key={i} className="text-[10px] text-ink-secondary">{g}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
