import { useState, useCallback, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  Circle,
  CircleDot,
  PenLine,
  BookOpen,
} from 'lucide-react';
import type { Worksheet, WorksheetElement } from '@/types/worksheet';

interface Props {
  worksheet: Worksheet;
  onClose: () => void;
}

export default function MobileWorksheetViewer({ worksheet, onClose }: Props) {
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-save indicator
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [answers]);

  const handleAnswer = useCallback(
    (elementId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [elementId]: value }));
    },
    []
  );

  const totalAnswerable = worksheet.pages.reduce(
    (count, page) =>
      count +
      page.elements.filter((e) =>
        ['questionBox', 'multipleChoice', 'fillInBlank', 'vocabularyBox'].includes(
          e.type
        )
      ).length,
    0
  );

  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;
  const progress =
    totalAnswerable > 0
      ? Math.round((answeredCount / totalAnswerable) * 100)
      : 0;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">
            Thank you, {studentName}!
          </h2>
          <p className="text-ink-secondary text-sm mb-4">
            Your worksheet has been submitted.
          </p>
          <div className="bg-white rounded-xl p-4 text-left mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-secondary">Questions answered</span>
              <span className="font-semibold text-ink">
                {answeredCount}/{totalAnswerable}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Completion</span>
              <span className="font-semibold text-accent">{progress}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full h-12 bg-accent text-white rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-canvas-bg flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-ink text-center mb-2 font-serif">
              {worksheet.title}
            </h1>
            <p className="text-ink-secondary text-sm text-center mb-8">
              {worksheet.pages.length} page{worksheet.pages.length > 1 ? 's' : ''}
            </p>

            <label className="block text-sm font-medium text-ink mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Type your name..."
              className="w-full h-14 px-4 bg-white border border-border-medium rounded-xl text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mb-4"
            />
            <button
              onClick={() => studentName.trim() && setStarted(true)}
              disabled={!studentName.trim()}
              className="w-full h-14 bg-accent text-white rounded-xl font-semibold text-base active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
            >
              Start Worksheet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const page = worksheet.pages[currentPage];
  const hasNext = currentPage < worksheet.pages.length - 1;
  const hasPrev = currentPage > 0;

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border-light px-4 h-12 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center -ml-2 active:scale-90"
        >
          <X className="w-5 h-5 text-ink" />
        </button>
        <h1 className="text-sm font-semibold text-ink truncate flex-1 text-center px-2">
          {worksheet.title}
        </h1>
        <div className="w-10 flex items-center justify-center">
          {saved && (
            <span className="text-[10px] text-success font-medium flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-border-light">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Worksheet content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          {page?.elements.map((el) => (
            <MobileElement
              key={el.id}
              element={el}
              answer={answers[el.id] || ''}
              onAnswer={(v) => handleAnswer(el.id, v)}
            />
          ))}
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 py-3 z-40 flex items-center gap-3">
        {worksheet.pages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrev}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-canvas-dark disabled:opacity-30 active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-ink-secondary">
              {currentPage + 1}/{worksheet.pages.length}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(worksheet.pages.length - 1, p + 1)
                )
              }
              disabled={!hasNext}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-canvas-dark disabled:opacity-30 active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="flex-1" />
        <span className="text-xs text-ink-secondary">{progress}% done</span>
        <button
          onClick={handleSubmit}
          className="h-10 px-5 bg-accent text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Send className="w-4 h-4" />
          Submit
        </button>
      </footer>
    </div>
  );
}

// ─── Mobile Element Renderer ───

function MobileElement({
  element,
  answer,
  onAnswer,
}: {
  element: WorksheetElement;
  answer: string;
  onAnswer: (v: string) => void;
}) {
  switch (element.type) {
    case 'heading':
      return (
        <h2 className="text-lg font-bold text-ink font-serif pt-2">
          {(element as any).content || 'Heading'}
        </h2>
      );

    case 'text':
      return (
        <p className="text-sm text-ink leading-relaxed">{(element as any).content || ''}</p>
      );

    case 'questionBox': {
      const q = element as any;
      return (
        <div className="bg-white rounded-xl p-4 border border-border-light">
          <p className="text-sm font-semibold text-ink mb-3">
            {q.number ? `${q.number}. ` : ''}
            {q.question || 'Question'}
          </p>
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full min-h-[80px] p-3 bg-canvas-bg rounded-lg border border-dashed border-border-medium text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-accent resize-none"
          />
        </div>
      );
    }

    case 'multipleChoice': {
      const mc = element as any;
      const selected = answer;
      return (
        <div className="bg-white rounded-xl p-4 border border-border-light">
          <p className="text-sm font-semibold text-ink mb-3">
            {mc.question || 'Multiple Choice'}
          </p>
          <div className="space-y-2">
            {(mc.options || []).map((opt: string, i: number) => {
              const isSelected = selected === opt;
              return (
                <button
                  key={i}
                  onClick={() => onAnswer(opt)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'border-accent bg-accent-lightest text-ink'
                      : 'border-border-light bg-canvas-bg text-ink'
                  }`}
                >
                  {isSelected ? (
                    <CircleDot className="w-5 h-5 text-accent flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-ink-tertiary flex-shrink-0" />
                  )}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case 'fillInBlank': {
      const fb = element as any;
      const parts = (fb.sentence || '').split(/\[___+\]/);
      const blankCount = ((fb.sentence || '').match(/\[___+\]/g) || []).length;
      const blankAnswers = answer.split('|');

      return (
        <div className="bg-white rounded-xl p-4 border border-border-light">
          <p className="text-xs text-ink-secondary mb-2 flex items-center gap-1">
            <PenLine className="w-3 h-3" /> Fill in the blanks
          </p>
          <div className="text-sm text-ink leading-loose flex flex-wrap items-baseline gap-1">
            {parts.map((part: string, i: number) => (
              <span key={i} className="flex items-baseline gap-1">
                <span>{part}</span>
                {i < blankCount && (
                  <input
                    type="text"
                    value={blankAnswers[i] || ''}
                    onChange={(e) => {
                      const newAnswers = [...blankAnswers];
                      newAnswers[i] = e.target.value;
                      onAnswer(newAnswers.join('|'));
                    }}
                    className="w-20 h-8 px-1 bg-transparent border-b-2 border-ink text-center text-sm font-medium focus:outline-none focus:border-accent"
                  />
                )}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case 'divider':
      return <hr className="border-border-light my-2" />;

    case 'table': {
      const t = element as any;
      const data = t.cellData || Array.from({ length: t.rows || 3 }, () =>
        Array(t.cols || 3).fill('')
      );
      return (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm border-collapse min-w-[300px]">
            <tbody>
              {data.map((row: string[], ri: number) => (
                <tr key={ri}>
                  {row.map((cell: string, ci: number) => (
                    <td
                      key={ci}
                      className={`border border-border-medium p-2 ${
                        ri === 0 ? 'bg-canvas-dark font-medium' : 'bg-white'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'imagePlaceholder': {
      const img = element as any;
      return img.imageUrl ? (
        <img
          src={img.imageUrl}
          alt=""
          className="w-full rounded-xl object-contain"
        />
      ) : (
        <div className="w-full h-40 bg-canvas-dark rounded-xl border-2 border-dashed border-border-medium flex items-center justify-center">
          <span className="text-ink-tertiary text-sm">Image</span>
        </div>
      );
    }

    case 'readingPassage': {
      const rp = element as any;
      const [expanded, setExpanded] = useState(false);
      return (
        <div className="bg-white rounded-xl p-4 border border-border-light">
          <h3 className="font-semibold text-ink mb-1">{rp.title || 'Reading'}</h3>
          {rp.author && (
            <p className="text-xs text-ink-secondary mb-2">by {rp.author}</p>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent font-medium mb-2"
          >
            {expanded ? 'Hide Passage ▲' : 'Read Passage ▼'}
          </button>
          {expanded && (
            <p className="text-sm text-ink leading-relaxed">{rp.content || ''}</p>
          )}
        </div>
      );
    }

    case 'vocabularyBox': {
      const vb = element as any;
      return (
        <div className="bg-white rounded-xl p-4 border border-border-light">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-accent">{vb.word || 'Word'}</span>
            {vb.partOfSpeech && (
              <span className="text-xs bg-canvas-dark px-2 py-0.5 rounded-full text-ink-secondary">
                {vb.partOfSpeech}
              </span>
            )}
          </div>
          <label className="text-xs text-ink-secondary block mb-1">Definition:</label>
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Write the definition..."
            className="w-full h-16 p-2 bg-canvas-bg rounded-lg border border-dashed border-border-medium text-sm focus:outline-none focus:border-accent resize-none"
          />
          {vb.sentenceFrame && (
            <p className="text-xs text-ink-secondary mt-2">{vb.sentenceFrame}</p>
          )}
        </div>
      );
    }

    default:
      return (
        <div className="bg-canvas-dark rounded-xl p-4 text-center">
          <span className="text-xs text-ink-tertiary capitalize">{element.type} element</span>
        </div>
      );
  }
}
