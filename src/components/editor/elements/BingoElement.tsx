import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { BingoElement as BingoElementType, BingoCard } from '@/types/worksheet';
import confetti from 'canvas-confetti';
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Dices,
  RotateCcw,
  Volume2,
  Check,
  Trophy,
} from 'lucide-react';

interface Props {
  element: BingoElementType;
  isEditing: boolean;
  isSelected: boolean;
  onUpdate: (updates: Partial<BingoElementType>) => void;
}

/* ------------------------------------------------------------------ */
/*  Fisher-Yates Shuffle                                              */
/* ------------------------------------------------------------------ */

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/*  Card Generation                                                   */
/* ------------------------------------------------------------------ */

function generateBingoCards(
  items: string[],
  count: number,
  freeSpaceText: string
): BingoCard[] {
  const baseItems = items.filter((i) => i.trim());
  const cards: BingoCard[] = [];
  for (let i = 0; i < count; i++) {
    const shuffled = fisherYatesShuffle([...baseItems]);
    const grid = shuffled.slice(0, 24);
    grid.splice(12, 0, freeSpaceText);
    cards.push({ id: `card-${i}`, grid });
  }
  return cards;
}

/* ------------------------------------------------------------------ */
/*  Win Detection                                                      */
/* ------------------------------------------------------------------ */

const WINNING_LINES: number[][] = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function checkWin(markedIndices: string[]): boolean {
  const markedSet = new Set(markedIndices);
  return WINNING_LINES.some((line) => line.every((idx) => markedSet.has(String(idx))));
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function BingoElement({ element, isEditing, isSelected, onUpdate }: Props) {
  const items = element.items || [];
  const title = element.title || '';
  const freeSpaceText = element.freeSpaceText || 'FREE SPACE';
  const cardCount = Math.max(1, Math.min(30, element.cardCount || 1));
  const generatedCards = element.generatedCards || [];
  const currentCardIndex = Math.min(
    element.currentCardIndex || 0,
    Math.max(0, generatedCards.length - 1)
  );
  const calledItems = element.calledItems || [];
  const markedCards = element.markedCards || {};
  const [callerOpen, setCallerOpen] = useState(false);
  const hasWonRef = useRef(false);

  const currentCard = generatedCards[currentCardIndex];
  const currentCardId = currentCard?.id || '';
  const currentMarks = markedCards[currentCardId] || [];

  /* -- win detection with confetti -- */
  useEffect(() => {
    if (currentMarks.length >= 4) {
      const won = checkWin(currentMarks);
      if (won && !hasWonRef.current) {
        hasWonRef.current = true;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else if (!won) {
        hasWonRef.current = false;
      }
    } else {
      hasWonRef.current = false;
    }
  }, [currentMarks]);

  /* -- editor: generate cards -- */
  const handleGenerate = useCallback(() => {
    const trimmedItems = items.filter((i) => i.trim());
    if (trimmedItems.length < 24) return;
    const newCards = generateBingoCards(trimmedItems, cardCount, freeSpaceText);
    onUpdate({ generatedCards: newCards, currentCardIndex: 0, markedCards: {} });
  }, [items, cardCount, freeSpaceText, onUpdate]);

  /* -- editor: textarea items -- */
  const handleItemsChange = useCallback(
    (val: string) => {
      const lines = val.split('\n');
      onUpdate({ items: lines });
    },
    [onUpdate]
  );

  /* -- play: toggle cell mark -- */
  const toggleMark = useCallback(
    (cellIndex: number) => {
      if (!currentCardId) return;
      const marks = markedCards[currentCardId] || [];
      const idxStr = String(cellIndex);
      // Free space (center) is always marked
      if (cellIndex === 12) return;
      const newMarks = marks.includes(idxStr)
        ? marks.filter((m) => m !== idxStr)
        : [...marks, idxStr];
      onUpdate({
        markedCards: { ...markedCards, [currentCardId]: newMarks },
      });
    },
    [currentCardId, markedCards, onUpdate]
  );

  /* -- play: call an item -- */
  const callItem = useCallback(
    (item: string) => {
      if (calledItems.includes(item)) return;
      const newCalled = [...calledItems, item];
      onUpdate({ calledItems: newCalled });
    },
    [calledItems, onUpdate]
  );

  /* -- play: uncall an item -- */
  const uncallItem = useCallback(
    (item: string) => {
      const newCalled = calledItems.filter((c) => c !== item);
      onUpdate({ calledItems: newCalled });
    },
    [calledItems, onUpdate]
  );

  /* -- reset current card -- */
  const resetCard = useCallback(() => {
    if (!currentCardId) return;
    onUpdate({
      markedCards: { ...markedCards, [currentCardId]: ['12'] },
    });
    hasWonRef.current = false;
  }, [currentCardId, markedCards, onUpdate]);

  /* -- reset all -- */
  const resetAll = useCallback(() => {
    const reset: Record<string, string[]> = {};
    generatedCards.forEach((c) => {
      reset[c.id] = ['12'];
    });
    onUpdate({ markedCards: reset, calledItems: [] });
    hasWonRef.current = false;
  }, [generatedCards, onUpdate]);

  /* -- auto-mark called items -- */
  useEffect(() => {
    if (!currentCard || calledItems.length === 0) return;
    let changed = false;
    const newMarks = [...currentMarks];
    calledItems.forEach((called) => {
      currentCard.grid.forEach((cell, idx) => {
        if (cell === called && !newMarks.includes(String(idx))) {
          newMarks.push(String(idx));
          changed = true;
        }
      });
    });
    if (changed) {
      onUpdate({
        markedCards: { ...markedCards, [currentCardId]: newMarks },
      });
    }
  }, [calledItems, currentCard, currentCardId]);

  /* -- free space always marked -- */
  useEffect(() => {
    if (!currentCardId) return;
    const marks = markedCards[currentCardId] || [];
    if (!marks.includes('12')) {
      onUpdate({
        markedCards: { ...markedCards, [currentCardId]: [...marks, '12'] },
      });
    }
  }, [currentCardId]);

  /* -- win state memo -- */
  const hasWin = useMemo(() => checkWin(currentMarks), [currentMarks]);

  /* ---------------------------------------------------------------- */
  /*  EDITOR MODE                                                     */
  /* ---------------------------------------------------------------- */
  if (isEditing) {
    const itemText = items.join('\n');
    const validItemCount = items.filter((i) => i.trim()).length;

    return (
      <div
        className="w-full h-full flex flex-col p-3 gap-2 overflow-hidden"
        style={{
          cursor: isSelected ? 'text' : 'grab',
          backgroundColor: '#FDFCFA',
          borderRadius: '8px',
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="BINGO Title"
            className="flex-1 text-[12px] font-semibold text-ink bg-transparent outline-none placeholder:text-ink-tertiary"
          />
        </div>

        {/* Items textarea */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-[9px] uppercase tracking-wider text-ink-secondary font-medium mb-1">
            BINGO Items \u2014 one per line ({validItemCount}/24 needed)
          </label>
          <textarea
            value={itemText}
            onChange={(e) => handleItemsChange(e.target.value)}
            placeholder={`Enter at least 24 items, one per line...\nExample:\nApple\nBanana\nCherry`}
            className="flex-1 w-full text-[12px] text-ink bg-white border border-border-medium rounded-md p-2 outline-none resize-none focus:border-accent"
          />
        </div>

        {/* Free space + Card count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-ink-secondary font-medium">Free Space:</label>
            <input
              type="text"
              value={freeSpaceText}
              onChange={(e) => onUpdate({ freeSpaceText: e.target.value })}
              className="w-[100px] text-[11px] text-ink bg-white border border-border-medium rounded px-1.5 py-0.5 outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            <label className="text-[10px] text-ink-secondary font-medium">Cards:</label>
            <input
              type="range"
              min={1}
              max={30}
              value={cardCount}
              onChange={(e) => onUpdate({ cardCount: Number(e.target.value) })}
              className="flex-1 h-1 accent-accent"
            />
            <span className="text-[11px] text-ink font-medium w-6 text-right">{cardCount}</span>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={validItemCount < 24}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-[11px] font-medium hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Dices className="w-3.5 h-3.5" />
          Generate Cards
        </button>

        {/* Card preview + nav */}
        {generatedCards.length > 0 && currentCard && (
          <div className="flex flex-col gap-1 min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ink-secondary font-medium">
                Preview Card {currentCardIndex + 1} of {generatedCards.length}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() =>
                    onUpdate({ currentCardIndex: Math.max(0, currentCardIndex - 1) })
                  }
                  disabled={currentCardIndex <= 0}
                  className="p-0.5 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-ink-secondary" />
                </button>
                <button
                  onClick={() =>
                    onUpdate({
                      currentCardIndex: Math.min(generatedCards.length - 1, currentCardIndex + 1),
                    })
                  }
                  disabled={currentCardIndex >= generatedCards.length - 1}
                  className="p-0.5 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-ink-secondary" />
                </button>
              </div>
            </div>
            {/* Mini preview grid */}
            <div className="grid grid-cols-5 gap-0.5 mx-auto" style={{ maxWidth: '200px' }}>
              {currentCard.grid.map((cell, idx) => (
                <div
                  key={idx}
                  className={`aspect-square flex items-center justify-center rounded-[3px] border text-[7px] leading-tight text-center p-0.5 overflow-hidden ${
                    idx === 12
                      ? 'bg-accent-light border-accent text-accent font-bold'
                      : 'bg-white border-border-medium text-ink'
                  }`}
                >
                  {cell}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  PLAY MODE                                                       */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className="w-full h-full flex flex-col bg-[#FDFCFA] rounded-lg overflow-hidden"
      style={{ cursor: isSelected ? 'text' : 'grab' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-light">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-ink-tertiary" />
          <span className="text-[12px] font-semibold text-ink">
            {title || 'BINGO'}
          </span>
          {hasWin && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-green-100 px-2 py-0.5 rounded-full">
              <Trophy className="w-3 h-3" />
              BINGO!
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCallerOpen((o) => !o)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-discipline-ela-light text-discipline-ela text-[10px] font-medium hover:bg-discipline-ela/20 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            Caller
          </button>
          <button
            onClick={resetCard}
            className="p-1 rounded-md hover:bg-border-light transition-colors"
            title="Reset Card"
          >
            <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
          </button>
        </div>
      </div>

      {/* Caller's Panel */}
      {callerOpen && (
        <div className="border-b border-border-light bg-[#F8F7F4] max-h-[120px] overflow-y-auto">
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-ink-secondary font-medium">
              Called: {calledItems.length}
            </span>
            <button
              onClick={resetAll}
              className="text-[9px] text-error hover:underline"
            >
              Reset All
            </button>
          </div>
          <div className="flex flex-wrap gap-1 px-3 pb-2">
            {items
              .filter((i) => i.trim())
              .map((item, i) => {
                const isCalled = calledItems.includes(item);
                return (
                  <button
                    key={i}
                    onClick={() => (isCalled ? uncallItem(item) : callItem(item))}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${
                      isCalled
                        ? 'bg-success/15 text-success line-through'
                        : 'bg-white border border-border-medium text-ink hover:border-accent'
                    }`}
                  >
                    {isCalled && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                    {item}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Card navigation */}
      {generatedCards.length > 1 && (
        <div className="flex items-center justify-between px-3 py-1 border-b border-border-light">
          <button
            onClick={() => onUpdate({ currentCardIndex: Math.max(0, currentCardIndex - 1) })}
            disabled={currentCardIndex <= 0}
            className="p-0.5 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-ink-secondary" />
          </button>
          <span className="text-[10px] text-ink-secondary font-medium">
            Card {currentCardIndex + 1} of {generatedCards.length}
          </span>
          <button
            onClick={() =>
              onUpdate({
                currentCardIndex: Math.min(generatedCards.length - 1, currentCardIndex + 1),
              })
            }
            disabled={currentCardIndex >= generatedCards.length - 1}
            className="p-0.5 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-ink-secondary" />
          </button>
        </div>
      )}

      {/* BINGO Grid */}
      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        {currentCard ? (
          <div className="w-full max-w-[300px] aspect-square">
            <div className="grid grid-cols-5 gap-1 w-full h-full">
              {currentCard.grid.map((cell, idx) => {
                const isMarked = currentMarks.includes(String(idx));
                const isFreeSpace = idx === 12;
                const isCalled = calledItems.includes(cell) && !isFreeSpace;
                return (
                  <button
                    key={idx}
                    onClick={() => toggleMark(idx)}
                    className={`relative flex items-center justify-center rounded-lg border-2 text-center font-medium transition-all select-none ${
                      isMarked || isFreeSpace
                        ? 'border-success bg-success/15 text-success'
                        : isCalled
                        ? 'border-discipline-ela bg-discipline-ela-light text-discipline-ela'
                        : 'border-border-medium bg-white text-ink hover:border-accent'
                    }`}
                    style={{ fontSize: 'clamp(8px, 2vw, 12px)', padding: '2px' }}
                  >
                    <span className="leading-tight">{cell}</span>
                    {(isMarked || isFreeSpace) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Check className="w-5 h-5 text-success opacity-40" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-[12px] text-ink-secondary">
            No cards generated yet.
            <br />
            Switch to edit mode to create cards.
          </div>
        )}
      </div>
    </div>
  );
}
