import { useRef, useEffect } from 'react';
import type { TextElement as TextElementType } from '@/types/worksheet';

interface Props {
  element: TextElementType;
  isSelected: boolean;
}

export default function TextElement({ element, isSelected }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== element.content) {
      ref.current.textContent = element.content || '';
    }
  }, [element.content]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className="w-full h-full outline-none break-words"
      style={{
        fontFamily: element.fontFamily || 'Inter, sans-serif',
        fontSize: `${element.fontSize || 14}px`,
        fontWeight: element.fontWeight || 400,
        color: element.color || '#292524',
        backgroundColor: element.backgroundColor || 'transparent',
        border: element.border ? `1px solid ${element.borderColor || '#D6D3CC'}` : 'none',
        padding: `${element.padding || 8}px`,
        cursor: isSelected ? 'text' : 'grab',
      }}
      onMouseDown={(e) => { if (!isSelected) e.preventDefault(); }}
    />
  );
}
