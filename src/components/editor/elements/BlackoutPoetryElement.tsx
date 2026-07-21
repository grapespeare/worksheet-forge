import { useRef, useState, useMemo, useCallback } from 'react';
import type { BlackoutPoetryElement as BlackoutPoetryElementType } from '@/types/worksheet';
import {
  splitIntoWords,
  buildWordIndexMap,
  suggestWords,
  getBlackoutClass,
  DEFAULT_SOURCE_TEXT,
  exportPoemAsImage,
} from '@/lib/blackout-poetry';
import {
  Eraser,
  Highlighter,
  Minus,
  Sparkles,
  Download,
  RotateCcw,
  CheckSquare,
  Square,
  MousePointerClick,
  PenTool,
  Layers,
  Eye,
  Type,
} from 'lucide-react';

interface Props {
  element: BlackoutPoetryElementType;
  isEditing: boolean;
  isSelected: boolean;
  onUpdate: (updates: Partial<BlackoutPoetryElementType>) => void;
}

const STYLE_OPTIONS: {
  value: BlackoutPoetryElementType['blackoutStyle'];
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'solid', label: 'Solid', icon: <Minus className="w-4 h-4" /> },
  { value: 'scribble', label: 'Scribble', icon: <PenTool className="w-4 h-4" /> },
  { value: 'highlight', label: 'Highlight', icon: <Highlighter className="w-4 h-4" /> },
  { value: 'pattern', label: 'Pattern', icon: <Layers className="w-4 h-4" /> },
  { value: 'fade', label: 'Fade', icon: <Eye className="w-4 h-4" /> },
];

export default function BlackoutPoetryElement({
  element,
  isEditing,
  isSelected,
  onUpdate,
}: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const sourceText = element.sourceText || DEFAULT_SOURCE_TEXT;
  const keptWords = element.keptWords || [];
  const blackoutStyle = element.blackoutStyle || 'solid';
  const title = element.title || '';
  const suggestions = element.suggestions || [];

  const { tokens, wordMap, totalWordCount } = useMemo(() => {
    const toks = splitIntoWords(sourceText);
    const wMap = buildWordIndexMap(toks);
    const count = Math.max(...wMap.filter((i) => i >= 0), -1) + 1;
    return { tokens: toks, wordMap: wMap, totalWordCount: count };
  }, [sourceText]);

  const keptCount = keptWords.length;

  const isWordKept = useCallback(
    (wordIndex: number) => keptWords.includes(wordIndex),
    [keptWords]
  );

  const isWordSuggested = useCallback(
    (wordIndex: number) => suggestions.includes(String(wordIndex)),
    [suggestions]
  );

  const toggleWord = useCallback(
    (wordIndex: number) => {
      const newKept = keptWords.includes(wordIndex)
        ? keptWords.filter((i) => i !== wordIndex)
        : [...keptWords, wordIndex];
      onUpdate({ keptWords: newKept.sort((a, b) => a - b) });
    },
    [keptWords, onUpdate]
  );

  const handleWordClick = useCallback(
    (wordIndex: number, event: React.MouseEvent) => {
      if (!isSelected && !isEditing) return;
      if (event.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, wordIndex);
        const end = Math.max(lastClickedIndex, wordIndex);
        const rangeToToggle: number[] = [];
        for (let i = start; i <= end; i++) {
          if (!rangeToToggle.includes(i)) rangeToToggle.push(i);
        }
        const keptInRange = rangeToToggle.filter((i) => keptWords.includes(i));
        const shouldKeep = keptInRange.length < rangeToToggle.length / 2;
        let newKept = [...keptWords];
        if (shouldKeep) {
          rangeToToggle.forEach((i) => {
            if (!newKept.includes(i)) newKept.push(i);
          });
        } else {
          newKept = newKept.filter((i) => !rangeToToggle.includes(i));
        }
        onUpdate({ keptWords: newKept.sort((a, b) => a - b) });
      } else {
        toggleWord(wordIndex);
      }
      setLastClickedIndex(wordIndex);
    },
    [isSelected, isEditing, lastClickedIndex, keptWords, toggleWord, onUpdate]
  );

  const handleKeepAll = useCallback(() => {
    const allIndices: number[] = [];
    wordMap.forEach((wIdx) => {
      if (wIdx >= 0 && !allIndices.includes(wIdx)) allIndices.push(wIdx);
    });
    onUpdate({ keptWords: allIndices.sort((a, b) => a - b) });
  }, [wordMap, onUpdate]);

  const handleClearAll = useCallback(() => {
    onUpdate({ keptWords: [] });
  }, [onUpdate]);

  const handleSuggest = useCallback(() => {
    const suggested = suggestWords(sourceText);
    onUpdate({ keptWords: suggested, suggestions: suggested.map(String) });
  }, [sourceText, onUpdate]);

  const handleStyleChange = useCallback(
    (style: BlackoutPoetryElementType['blackoutStyle']) => {
      onUpdate({ blackoutStyle: style });
    },
    [onUpdate]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => { onUpdate({ title: newTitle }); },
    [onUpdate]
  );

  const handleSourceTextChange = useCallback(
    (newText: string) => { onUpdate({ sourceText: newText, keptWords: [], suggestions: [] }); },
    [onUpdate]
  );

  const handleExport = useCallback(async () => {
    if (!previewRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportPoemAsImage(previewRef.current, title);
      const link = document.createElement('a');
      link.download = `${title || 'blackout-poem'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [previewRef, title, isExporting]);

  const renderToken = useCallback(
    (token: string, arrayIndex: number) => {
      const wordIndex = wordMap[arrayIndex];
      if (/^\s+$/.test(token)) {
        return <span key={`ws-${arrayIndex}`} className="whitespace-pre">{token}</span>;
      }
      if (/^[.,;!?"']+$/.test(token)) {
        return <span key={`punct-${arrayIndex}`} className="inline">{token}</span>;
      }
      const kept = wordIndex >= 0 && isWordKept(wordIndex);
      const suggested = wordIndex >= 0 && isWordSuggested(wordIndex);
      const blackoutClass = getBlackoutClass(blackoutStyle);
      return (
        <span
          key={`word-${wordIndex}-${arrayIndex}`}
          data-word-index={wordIndex}
          className={`inline cursor-pointer select-none transition-all duration-150 rounded-sm px-[1px]
            ${kept ? 'opacity-100' : blackoutClass}
            ${suggested && !kept ? 'ring-1 ring-amber-400/60 shadow-[0_0_6px_rgba(251,191,36,0.3)]' : ''}
            ${isSelected || !isEditing ? 'hover:ring-1 hover:ring-sky-400/50' : ''}`}
          onClick={(e) => { handleWordClick(wordIndex, e); }}
          title={isEditing ? 'Click to toggle \u2022 Shift+click for range' : 'Click to keep/remove this word'}
        >
          {token}
        </span>
      );
    },
    [wordMap, isWordKept, isWordSuggested, blackoutStyle, isSelected, isEditing, handleWordClick]
  );

  if (isEditing) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-white rounded-sm">
        <div className="flex-shrink-0 border-b border-stone-200 bg-stone-50 px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Poem title..."
              className="flex-1 text-sm font-semibold bg-white border border-stone-200 rounded px-2 py-1 outline-none focus:border-sky-400 transition-colors" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider font-medium mr-1">Style</span>
            {STYLE_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleStyleChange(opt.value)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all
                  ${blackoutStyle === opt.value ? 'bg-stone-800 text-white shadow-sm' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-100'}`}
                title={`Blackout style: ${opt.label}`}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleSuggest}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />Suggest Poem</button>
            <button onClick={handleKeepAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
              <CheckSquare className="w-3.5 h-3.5" />Keep All</button>
            <button onClick={handleClearAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Clear All</button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">{keptCount} of {totalWordCount} words kept</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 border-b border-stone-200 px-3 py-2 bg-white">
          <label className="flex items-center gap-1.5 text-[11px] text-stone-500 uppercase tracking-wider font-medium mb-1">
            <MousePointerClick className="w-3.5 h-3.5" />Source Text
          </label>
          <textarea value={sourceText} onChange={(e) => handleSourceTextChange(e.target.value)}
            placeholder="Paste your source text here..."
            className="w-full h-24 text-xs leading-relaxed bg-stone-50 border border-stone-200 rounded p-2 outline-none resize-none focus:border-sky-400 transition-colors font-serif" />
        </div>
        <div className="flex-1 overflow-auto px-4 py-3">
          <label className="flex items-center gap-1.5 text-[11px] text-stone-500 uppercase tracking-wider font-medium mb-2">
            <Eraser className="w-3.5 h-3.5" />Live Preview
          </label>
          <div ref={previewRef} className="text-sm leading-[1.9] font-serif text-stone-800 whitespace-pre-wrap">
            {tokens.map((token, i) => renderToken(token, i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white rounded-sm">
      <div className="flex-shrink-0 border-b border-stone-100 px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {title ? (
            <h3 className="text-base font-bold text-stone-800 font-serif truncate">{title}</h3>
          ) : (
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter your poem title..."
              className="w-full text-base font-bold bg-transparent border-b border-dashed border-stone-300 outline-none focus:border-sky-400 transition-colors font-serif placeholder:font-normal placeholder:text-stone-400" />
          )}
          <p className="text-[11px] text-stone-500 mt-1">Click words to create your poem. Kept words form your poem.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">{keptCount} / {totalWordCount}</span>
          <button onClick={handleExport} disabled={isExporting || keptCount === 0}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all
              ${keptCount === 0 ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'}`}
            title="Export as high-resolution PNG">
            <Download className="w-3.5 h-3.5" />{isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="text-[15px] leading-[2] font-serif text-stone-800 whitespace-pre-wrap">
          {tokens.map((token, i) => renderToken(token, i))}
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-stone-100 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] text-stone-400">Shift+click to select a phrase of words</span>
        <div className="flex items-center gap-1 text-[10px] text-stone-400">
          <Square className="w-3 h-3" />= removed<span className="mx-1" /><CheckSquare className="w-3 h-3" />= kept
        </div>
      </div>
    </div>
  );
}
