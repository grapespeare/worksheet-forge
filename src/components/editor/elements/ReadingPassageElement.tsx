import { useRef, useEffect } from 'react';
import type { ReadingPassageElement as ReadingPassageElementType } from '@/types/worksheet';

interface Props {
  element: ReadingPassageElementType;
  isSelected: boolean;
}

export default function ReadingPassageElement({ element, isSelected }: Props) {
  const titleRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== element.title) {
      titleRef.current.textContent = element.title || '';
    }
  }, [element.title]);

  useEffect(() => {
    if (authorRef.current && authorRef.current.textContent !== (element.author || '')) {
      authorRef.current.textContent = element.author || '';
    }
  }, [element.author]);

  useEffect(() => {
    if (bodyRef.current && bodyRef.current.textContent !== element.content) {
      bodyRef.current.textContent = element.content || '';
    }
  }, [element.content]);

  const lines = element.content?.split('\n') || [];

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-hidden" style={{ cursor: isSelected ? 'text' : 'grab' }}>
      <div ref={titleRef} contentEditable suppressContentEditableWarning className="text-[16px] font-bold text-ink outline-none mb-1" />
      <div ref={authorRef} contentEditable suppressContentEditableWarning className="text-[12px] italic text-ink-secondary outline-none mb-3" />
      <div className="flex-1 overflow-hidden"
        style={{
          fontFamily: element.fontFamily || 'Inter, sans-serif',
          fontSize: `${element.fontSize || 12}px`,
          lineHeight: element.lineHeight || 1.6,
          columns: element.columns && element.columns > 1 ? element.columns : undefined,
          columnGap: element.columns && element.columns > 1 ? '24px' : undefined,
        }}>
        {element.showLineNumbers ? (
          <div className="flex">
            <div className="flex-shrink-0 mr-3 text-right select-none">
              {lines.map((_, i) => (
                <div key={i} className="text-[11px] text-ink-tertiary leading-[1.6]" style={{ lineHeight: element.lineHeight || 1.6 }}>{i + 1}</div>
              ))}
            </div>
            <div ref={bodyRef} contentEditable suppressContentEditableWarning className="flex-1 outline-none break-words" />
          </div>
        ) : (
          <div ref={bodyRef} contentEditable suppressContentEditableWarning className="outline-none break-words" />
        )}
      </div>
    </div>
  );
}
