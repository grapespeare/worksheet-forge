import type { DiagramElement as DiagramElementType } from '@/types/worksheet';

interface Props {
  element: DiagramElementType;
  isSelected: boolean;
}

export default function DiagramElement({ element }: Props) {
  const { shapeType = 'rectangle', strokeColor = '#292524', strokeWidth = 1, fill = false, fillColor = '#F0EBE0', lineStyle = 'solid' } = element;
  const dashArray = lineStyle === 'dashed' ? '6,4' : lineStyle === 'dotted' ? '2,3' : 'none';

  if (shapeType === 'circle') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="50" rx="49" ry="49" fill={fill ? fillColor : 'transparent'} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray === 'none' ? undefined : dashArray} />
      </svg>
    );
  }
  if (shapeType === 'triangle') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,2 2,98 98,98" fill={fill ? fillColor : 'transparent'} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray === 'none' ? undefined : dashArray} />
      </svg>
    );
  }
  if (shapeType === 'arrow') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} /></marker></defs>
        <line x1="5" y1="50" x2="90" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray === 'none' ? undefined : dashArray} markerEnd="url(#arrowhead)" />
      </svg>
    );
  }
  if (shapeType === 'line') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="50" x2="100" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray === 'none' ? undefined : dashArray} />
      </svg>
    );
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="1" y="1" width="98" height="98" fill={fill ? fillColor : 'transparent'} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray === 'none' ? undefined : dashArray} />
    </svg>
  );
}
