import type { CharacterAnalysisElement as CharacterAnalysisElementType } from '@/types/worksheet';

interface Props {
  element: CharacterAnalysisElementType;
  isSelected: boolean;
}

export default function CharacterAnalysisElement({ element, isSelected }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-3 overflow-hidden"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="mb-2">
        <label className="text-[10px] text-ink-secondary uppercase tracking-wider">Character</label>
        <div contentEditable suppressContentEditableWarning className="text-[16px] font-bold text-ink outline-none">{element.characterName}</div>
      </div>
      <div className="mb-2">
        <label className="text-[10px] text-ink-secondary uppercase tracking-wider mb-1 block">Traits & Evidence</label>
        <div className="border border-border-medium rounded overflow-hidden">
          <div className="flex bg-canvas-dark border-b border-border-medium">
            <div className="flex-1 px-2 py-1 text-[10px] font-semibold text-ink-secondary border-r border-border-medium">Trait</div>
            <div className="flex-1 px-2 py-1 text-[10px] font-semibold text-ink-secondary">Evidence</div>
          </div>
          {element.traits.map((t, i) => (
            <div key={i} className="flex border-b border-border-light last:border-b-0">
              <div className="flex-1 px-2 py-1 text-[11px] text-ink border-r border-border-medium outline-none" contentEditable suppressContentEditableWarning>{t.trait}</div>
              <div className="flex-1 px-2 py-1 text-[11px] text-ink outline-none" contentEditable suppressContentEditableWarning>{t.evidence}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-auto flex-wrap">
        {element.appearance !== undefined && (
          <div className="flex-1 min-w-[80px] border border-border-medium rounded p-1.5 bg-white/60">
            <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Appearance</label>
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none min-h-[20px]">{element.appearance}</div>
          </div>
        )}
        {element.personality !== undefined && (
          <div className="flex-1 min-w-[80px] border border-border-medium rounded p-1.5 bg-white/60">
            <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Personality</label>
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none min-h-[20px]">{element.personality}</div>
          </div>
        )}
        {element.motivation !== undefined && (
          <div className="flex-1 min-w-[80px] border border-border-medium rounded p-1.5 bg-white/60">
            <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Motivation</label>
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none min-h-[20px]">{element.motivation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
