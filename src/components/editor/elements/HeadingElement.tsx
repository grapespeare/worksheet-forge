import type { HeadingElement as HeadingElementType } from '@/types/worksheet';

interface Props {
  element: HeadingElementType;
  isSelected: boolean;
}

export default function HeadingElement({ element, isSelected }: Props) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className="w-full h-full outline-none font-serif break-words"
      style={{
        fontSize: `${element.fontSize || 24}px`,
        color: element.color || '#292524',
        backgroundColor: element.backgroundColor || 'transparent',
        border: element.border ? `1px solid ${'#D6D3CC'}` : 'none',
        padding: `${element.padding || 8}px`,
        cursor: isSelected ? 'text' : 'grab',
        fontWeight: 400,
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
      }}
      onMouseDown={(e) => { if (!isSelected) e.preventDefault(); }}
    >
      {element.content}
    </div>
  );
}
