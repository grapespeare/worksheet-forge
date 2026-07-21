import type { FillInBlankElement as FillInBlankElementType } from '@/types/worksheet';

interface Props {
  element: FillInBlankElementType;
  isSelected: boolean;
}

export default function FillInBlankElement({ element, isSelected }: Props) {
  const parts = element.sentence.split(/\[blank\]/g);
  return (
    <div className="w-full h-full flex items-center" style={{ cursor: isSelected ? 'text' : 'grab' }}>
      <div className="text-[14px] text-ink leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            <span contentEditable suppressContentEditableWarning className="outline-none">{part}</span>
            {i < parts.length - 1 && <span className="inline-block border-b border-ink mx-1" style={{ width: '60px', paddingBottom: '2px' }} />}
          </span>
        ))}
      </div>
    </div>
  );
}
