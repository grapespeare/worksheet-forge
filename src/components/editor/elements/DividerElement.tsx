import type { DividerElement as DividerElementType } from '@/types/worksheet';

interface Props {
  element: DividerElementType;
  isSelected: boolean;
}

export default function DividerElement({ element }: Props) {
  return (
    <div className="w-full h-full flex items-center" style={{ cursor: 'grab', minHeight: '2px' }}>
      <div className="w-full" style={{ height: '1px', borderTop: `1px ${element.style || 'solid'} ${element.color || '#D6D3CC'}` }} />
    </div>
  );
}
