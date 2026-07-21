import type { StoryMapElement as StoryMapElementType } from '@/types/worksheet';

interface Props {
  element: StoryMapElementType;
  isSelected: boolean;
}

export default function StoryMapElement({ element, isSelected }: Props) {
  const sideBoxes = [
    { key: 'showCharacters', label: 'Characters' },
    { key: 'showSetting', label: 'Setting' },
    { key: 'showTheme', label: 'Theme' },
    { key: 'showConflict', label: 'Conflict' },
  ] as const;

  return (
    <div className="w-full h-full flex flex-col p-3"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="text-center mb-2">
        <span contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-ink outline-none">{element.title}</span>
      </div>
      <div className="flex-1 relative">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
          <path d="M 20 180 Q 80 180 125 140 Q 170 100 200 60 Q 250 10 300 60 Q 330 100 375 140 Q 420 180 480 180"
            fill="none" stroke="#D6D3CC" strokeWidth="2" strokeDasharray="6 4" />
          {element.showExposition && <text x="50" y="165" fontSize="10" fill="#78716C" textAnchor="middle">Exposition</text>}
          {element.showRisingAction && <text x="140" y="110" fontSize="10" fill="#78716C" textAnchor="middle">Rising Action</text>}
          {element.showClimax && <text x="250" y="35" fontSize="11" fill="#D97757" textAnchor="middle" fontWeight="bold">Climax</text>}
          {element.showFallingAction && <text x="360" y="110" fontSize="10" fill="#78716C" textAnchor="middle">Falling Action</text>}
          {element.showResolution && <text x="450" y="165" fontSize="10" fill="#78716C" textAnchor="middle">Resolution</text>}
        </svg>
        <div className="absolute inset-0 flex items-end justify-between px-2 pb-1">
          {element.showExposition && <div className="w-[18%] h-[30%] border border-dashed border-border-medium rounded bg-white/50" />}
          {element.showRisingAction && <div className="w-[18%] h-[40%] border border-dashed border-border-medium rounded bg-white/50" />}
          {element.showClimax && <div className="w-[18%] h-[25%] border border-dashed border-accent/40 rounded bg-accent-light/30" />}
          {element.showFallingAction && <div className="w-[18%] h-[40%] border border-dashed border-border-medium rounded bg-white/50" />}
          {element.showResolution && <div className="w-[18%] h-[30%] border border-dashed border-border-medium rounded bg-white/50" />}
        </div>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {sideBoxes.map((box) => (element as unknown as Record<string, boolean>)[box.key] && (
          <div key={box.key} className="flex-1 min-w-[60px] border border-border-medium rounded p-1.5 bg-white/60">
            <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">{box.label}</label>
            <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none min-h-[20px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
