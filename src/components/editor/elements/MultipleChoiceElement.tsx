import type { MultipleChoiceElement as MultipleChoiceElementType } from '@/types/worksheet';

interface Props {
  element: MultipleChoiceElementType;
  isSelected: boolean;
}

export default function MultipleChoiceElement({ element, isSelected }: Props) {
  return (
    <div className="w-full h-full flex flex-col gap-2" style={{ cursor: isSelected ? 'text' : 'grab' }}>
      <div contentEditable suppressContentEditableWarning className="text-[14px] text-ink outline-none font-semibold">{element.question}</div>
      <div className="flex flex-col gap-2">
        {element.options.map((option, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-[1.5px] border-border-medium flex-shrink-0"
              style={{ background: element.correctAnswer === i ? 'var(--accent, #D97757)' : 'transparent', borderColor: element.correctAnswer === i ? 'var(--accent, #D97757)' : '#D6D3CC' }} />
            <span contentEditable suppressContentEditableWarning className="text-[13px] text-ink outline-none">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
