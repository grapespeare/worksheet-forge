import type { CompareContrastElement as CompareContrastElementType } from '@/types/worksheet';

interface Props {
  element: CompareContrastElementType;
  isSelected: boolean;
}

export default function CompareContrastElement({ element, isSelected }: Props) {
  if (element.style === 'tchart') {
    return (
      <div className="w-full h-full flex flex-col p-3"
        style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
        <div className="flex border-b-2 border-border-medium mb-2">
          <div className="flex-1 px-2 py-1 border-r border-border-medium">
            <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-ink outline-none text-center">{element.topicA}</div>
          </div>
          <div className="flex-1 px-2 py-1">
            <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-ink outline-none text-center">{element.topicB}</div>
          </div>
        </div>
        <div className="mb-2 border border-border-medium rounded p-2 bg-canvas-dark/30">
          <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1 text-center">Both</label>
          <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none">{element.both.join('\n')}</div>
        </div>
        <div className="flex flex-1 gap-2">
          <div className="flex-1 border border-border-medium rounded p-2 bg-white/60">
            <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Only {element.topicA}</label>
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none">{element.aOnly.join('\n')}</div>
          </div>
          <div className="flex-1 border border-border-medium rounded p-2 bg-white/60">
            <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Only {element.topicB}</label>
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none">{element.bOnly.join('\n')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-3"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="flex-1 relative">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240">
          <circle cx="140" cy="120" r="100" fill="rgba(217, 119, 87, 0.08)" stroke="#D97757" strokeWidth="2" />
          <circle cx="260" cy="120" r="100" fill="rgba(59, 130, 246, 0.08)" stroke="#3B82F6" strokeWidth="2" />
          <text x="90" y="55" fontSize="12" fill="#D97757" textAnchor="middle" fontWeight="600">{element.topicA}</text>
          <text x="310" y="55" fontSize="12" fill="#3B82F6" textAnchor="middle" fontWeight="600">{element.topicB}</text>
          <text x="200" y="200" fontSize="10" fill="#78716C" textAnchor="middle">Both</text>
        </svg>
        <div className="absolute inset-0 flex">
          <div className="w-[35%] flex items-center justify-center p-4">
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none text-center">{element.aOnly.join('\n') || 'A only...'}</div>
          </div>
          <div className="w-[30%] flex items-center justify-center p-2 pt-8">
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none text-center">{element.both.join('\n') || 'Both...'}</div>
          </div>
          <div className="w-[35%] flex items-center justify-center p-4">
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none text-center">{element.bOnly.join('\n') || 'B only...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
