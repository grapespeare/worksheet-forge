import { useRef, useEffect } from 'react';
import type { VocabularyBoxElement as VocabularyBoxElementType } from '@/types/worksheet';

interface Props {
  element: VocabularyBoxElementType;
  isSelected: boolean;
}

export default function VocabularyBoxElement({ element, isSelected }: Props) {
  const wordRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wordRef.current && wordRef.current.textContent !== element.word) {
      wordRef.current.textContent = element.word || '';
    }
  }, [element.word]);

  useEffect(() => {
    if (frameRef.current && frameRef.current.textContent !== element.sentenceFrame) {
      frameRef.current.textContent = element.sentenceFrame || '';
    }
  }, [element.sentenceFrame]);

  const defLines = Math.max(1, element.definitionLines || 2);

  return (
    <div className="w-full h-full flex flex-col p-3"
      style={{ border: '2px solid #D6D3CC', borderRadius: '8px', backgroundColor: '#FDFCFA', cursor: isSelected ? 'text' : 'grab' }}>
      <div className="flex items-center gap-2 mb-2">
        <div ref={wordRef} contentEditable suppressContentEditableWarning className="text-[16px] font-bold text-ink outline-none" />
        {element.partOfSpeech && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-light text-accent font-medium">{element.partOfSpeech}</span>
        )}
      </div>
      <div className="mb-2">
        <label className="text-[10px] text-ink-secondary uppercase tracking-wider">Definition</label>
        <div className="mt-1 space-y-1">
          {Array.from({ length: defLines }).map((_, i) => (
            <div key={i} className="w-full border-b border-dashed border-border-medium" style={{ height: '20px' }} />
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <label className="text-[10px] text-ink-secondary uppercase tracking-wider">Sentence</label>
        <div ref={frameRef} contentEditable suppressContentEditableWarning className="mt-1 text-[12px] text-ink outline-none break-words" style={{ minHeight: '24px' }} />
      </div>
    </div>
  );
}
