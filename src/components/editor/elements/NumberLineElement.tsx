import type { NumberLineElement as NumberLineElementType } from '@/types/worksheet';

interface Props {
  element: NumberLineElementType;
  isSelected: boolean;
}

export default function NumberLineElement({ element }: Props) {
  const { min = 0, max = 10, step = 1, showLabels = true, labelInterval = 1 } = element;
  const range = max - min;
  const steps = Math.floor(range / step);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="xMidYMid meet">
        <line x1="30" y1="40" x2="370" y2="40" stroke="#292524" strokeWidth={1} />
        <polygon points="25,40 30,37 30,43" fill="#292524" />
        <polygon points="375,40 370,37 370,43" fill="#292524" />
        {Array.from({ length: steps + 1 }, (_, i) => {
          const value = min + i * step;
          const x = 30 + (i / steps) * 340;
          return (
            <g key={i}>
              <line x1={x} y1="36" x2={x} y2="44" stroke="#292524" strokeWidth={1} />
              {showLabels && i % labelInterval === 0 && (
                <text x={x} y="58" textAnchor="middle" fill="#78716C" fontSize="11" fontFamily="Inter, sans-serif">{value}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
