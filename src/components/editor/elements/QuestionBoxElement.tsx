import type { QuestionBoxElement as QuestionBoxElementType } from '@/types/worksheet';

interface Props {
  element: QuestionBoxElementType;
  isSelected: boolean;
}

export default function QuestionBoxElement({ element, isSelected }: Props) {
  return (
    <div className="w-full h-full flex flex-col" style={{ cursor: isSelected ? 'text' : 'grab' }}>
      <div className="flex-shrink-0 mb-2">
        <span className="text-[14px] text-ink font-semibold">{element.autoNumber ? `${element.number ?? 1}. ` : ''}</span>
        <span contentEditable suppressContentEditableWarning className="text-[14px] text-ink outline-none">{element.question}</span>
      </div>
      <div className="flex-1 w-full rounded-sm" style={{ backgroundColor: 'rgba(250, 246, 239, 0.3)', border: '1px dashed #E7E5E0', minHeight: '60px' }} />
    </div>
  );
}
