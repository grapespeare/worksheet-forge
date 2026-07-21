import type { ArtCritiqueElement as ArtCritiqueElementType } from '@/types/worksheet';

interface Props {
  element: ArtCritiqueElementType;
  isSelected: boolean;
}

export default function ArtCritiqueElement({ element, isSelected }: Props) {
  const quadrants = [
    { label: 'Describe', key: 'describePrompts', color: '#D97757', bg: '#F3E5DD' },
    { label: 'Analyze', key: 'analyzePrompts', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Interpret', key: 'interpretPrompts', color: '#22C55E', bg: '#DCFCE7' },
    { label: 'Judge', key: 'judgePrompts', color: '#A855F7', bg: '#F3E8FF' },
  ] as const;

  return (
    <div className="w-full h-full flex flex-col p-3 overflow-hidden"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="mb-2 text-center">
        <div contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-ink outline-none inline">{element.artworkTitle}</div>
        <span className="text-ink-secondary mx-1"> — </span>
        <div contentEditable suppressContentEditableWarning className="text-[12px] italic text-ink-secondary outline-none inline">{element.artistName}</div>
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 min-h-0">
        {quadrants.map((q) => {
          const prompts = (element[q.key as keyof ArtCritiqueElementType] as string[]) || [];
          return (
            <div key={q.key} className="rounded border overflow-hidden flex flex-col" style={{ borderColor: q.color, backgroundColor: q.bg }}>
              <div className="px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: q.color }}>{q.label}</div>
              <div className="flex-1 p-2 overflow-hidden">
                {prompts.map((prompt, i) => (
                  <div key={i} className="mb-1.5">
                    <div className="text-[10px] text-ink-secondary mb-0.5">{prompt}</div>
                    <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none border-b border-dashed border-border-medium min-h-[18px]" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
