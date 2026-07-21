import type { ColorStudyElement as ColorStudyElementType } from '@/types/worksheet';

interface Props {
  element: ColorStudyElementType;
  isSelected: boolean;
}

export default function ColorStudyElement({ element, isSelected }: Props) {
  const boxes = element.colorBoxes || [];

  return (
    <div className="w-full h-full flex flex-col p-3 overflow-hidden"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="mb-2">
        <div contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-ink outline-none">{element.title}</div>
      </div>
      {element.showColorWheel && (
        <div className="flex justify-center mb-2">
          <svg width="80" height="80" viewBox="0 0 80 80">
            {[
              { color: '#EF4444', start: 0 }, { color: '#F97316', start: 60 },
              { color: '#EAB308', start: 120 }, { color: '#22C55E', start: 180 },
              { color: '#3B82F6', start: 240 }, { color: '#A855F7', start: 300 },
            ].map((slice) => (
              <path key={slice.start} d={describeArc(40, 40, 35, slice.start, slice.start + 60)} fill={slice.color} stroke="white" strokeWidth="1" />
            ))}
            <circle cx="40" cy="40" r="12" fill="white" stroke="#E7E5E0" strokeWidth="1" />
            <text x="40" y="43" fontSize="7" fill="#78716C" textAnchor="middle">Mix</text>
          </svg>
        </div>
      )}
      <div className="flex-1 grid grid-cols-3 gap-2 mb-2">
        {boxes.map((box, i) => (
          <div key={i} className="border border-border-medium rounded overflow-hidden bg-white">
            <div className="h-6 w-full" style={{ backgroundColor: box.color }} />
            <div className="p-1">
              <div contentEditable suppressContentEditableWarning className="text-[9px] font-semibold text-ink outline-none">{box.label}</div>
              {box.mixingNotes && <div contentEditable suppressContentEditableWarning className="text-[8px] text-ink-secondary outline-none">{box.mixingNotes}</div>}
            </div>
          </div>
        ))}
      </div>
      {element.showMixingArea && (
        <div className="border border-dashed border-border-medium rounded p-2 bg-white/60">
          <label className="text-[9px] text-ink-secondary uppercase tracking-wider block mb-1">Mixing Notes</label>
          <div contentEditable suppressContentEditableWarning className="text-[11px] text-ink outline-none min-h-[20px]" />
        </div>
      )}
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', cx, cy, 'L', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}
