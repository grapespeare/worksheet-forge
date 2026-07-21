import type { TechniqueGridElement as TechniqueGridElementType } from '@/types/worksheet';

interface Props {
  element: TechniqueGridElementType;
  isSelected: boolean;
}

export default function TechniqueGridElement({ element, isSelected }: Props) {
  const rows = Math.max(1, element.rows || 2);
  const cols = Math.max(1, element.cols || 3);
  const labels = element.techniqueLabels || [];

  return (
    <div className="w-full h-full flex flex-col p-3 overflow-hidden"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <label className="text-[10px] text-ink-secondary uppercase tracking-wider block mb-2">Technique Practice Grid</label>
      <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={i} className="border border-border-medium rounded bg-white flex flex-col overflow-hidden">
            <div className="px-1.5 py-0.5 bg-canvas-dark border-b border-border-light">
              <div contentEditable suppressContentEditableWarning className="text-[10px] font-semibold text-ink outline-none text-center">{labels[i] || `Technique ${i + 1}`}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[9px] text-ink-tertiary italic">Practice area</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
