import type { HandwritingLinesElement as HandwritingLinesElementType } from '@/types/worksheet';

interface Props {
  element: HandwritingLinesElementType;
  isSelected: boolean;
}

export default function HandwritingLinesElement({ element }: Props) {
  const lineSets = element.lineSets || 4;
  const spacing = element.lineSpacing || 30;
  const color = element.lineColor || '#A8A29E';
  const w = element.width || 400;
  const lineHeight = 3 * spacing;
  const totalHeight = lineSets * lineHeight;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${totalHeight}`} preserveAspectRatio="none">
      {Array.from({ length: lineSets }, (_, set) => {
        const yBase = set * lineHeight;
        return (
          <g key={set}>
            <line x1={0} y1={yBase + spacing * 0} x2={w} y2={yBase + spacing * 0} stroke={color} strokeWidth={1} />
            <line x1={0} y1={yBase + spacing * 1} x2={w} y2={yBase + spacing * 1} stroke={color} strokeWidth={1} strokeDasharray="2 4" />
            <line x1={0} y1={yBase + spacing * 2} x2={w} y2={yBase + spacing * 2} stroke={color} strokeWidth={1} />
          </g>
        );
      })}
    </svg>
  );
}
