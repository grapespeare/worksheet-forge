import type { GraphPaperElement as GraphPaperElementType } from '@/types/worksheet';

interface Props {
  element: GraphPaperElementType;
  isSelected: boolean;
}

export default function GraphPaperElement({ element }: Props) {
  const { gridDensity = 20, showAxes = true, showAxisLabels = false } = element;
  const w = element.width || 300;
  const h = element.height || 300;
  const cols = Math.floor(w / gridDensity);
  const rows = Math.floor(h / gridDensity);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * gridDensity} y1={0} x2={i * gridDensity} y2={h} stroke="#E7E5E0" strokeWidth={1} />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * gridDensity} x2={w} y2={i * gridDensity} stroke="#E7E5E0" strokeWidth={1} />
      ))}
      {showAxes && (
        <>
          <line x1={0} y1={Math.floor(rows / 2) * gridDensity} x2={w} y2={Math.floor(rows / 2) * gridDensity} stroke="#78716C" strokeWidth={1.5} />
          <line x1={Math.floor(cols / 2) * gridDensity} y1={0} x2={Math.floor(cols / 2) * gridDensity} y2={h} stroke="#78716C" strokeWidth={1.5} />
        </>
      )}
      {showAxes && showAxisLabels && (
        <>
          <text x={w - 14} y={Math.floor(rows / 2) * gridDensity - 6} fill="#78716C" fontSize="11" fontFamily="Inter, sans-serif" fontStyle="italic">x</text>
          <text x={Math.floor(cols / 2) * gridDensity + 6} y={14} fill="#78716C" fontSize="11" fontFamily="Inter, sans-serif" fontStyle="italic">y</text>
        </>
      )}
    </svg>
  );
}
