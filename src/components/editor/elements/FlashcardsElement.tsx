import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { FlashcardsElement as FlashcardsElementType } from '@/types/worksheet';
import { Shuffle, Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, RotateCcw, CheckCircle, XCircle, GripVertical } from 'lucide-react';

interface Props {
  element: FlashcardsElementType;
  isEditing: boolean;
  isSelected: boolean;
  onUpdate: (updates: Partial<FlashcardsElementType>) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function FlashcardsElement({ element, isSelected, onUpdate }: Props) {
  const cards = element.cards || [];
  const currentIndex = element.currentIndex || 0;
  const isStudyMode = element.studyMode || false;
  const shuffle = element.shuffle || false;

  /* -- editor local state -- */
  const safeIndex = cards.length > 0 ? Math.min(currentIndex, cards.length - 1) : 0;
  const currentCard = cards[safeIndex];

  /* -- study mode state -- */
  const [studyQueue, setStudyQueue] = useState<typeof cards>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyKnown, setStudyKnown] = useState<string[]>([]);
  const [studyReview, setStudyReview] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /* initialise study queue */
  const enterStudyMode = useCallback(() => {
    const queue = shuffle ? shuffleArray(cards) : [...cards];
    setStudyQueue(queue);
    setStudyIndex(0);
    setFlipped(false);
    setStudyKnown([]);
    setStudyReview([]);
    setShowSummary(false);
    onUpdate({ studyMode: true, currentIndex: 0, knownCards: [] });
  }, [cards, shuffle, onUpdate]);

  const exitStudyMode = useCallback(() => {
    setShowSummary(false);
    setFlipped(false);
    onUpdate({ studyMode: false });
  }, [onUpdate]);

  /* progress through study */
  const handleKnow = useCallback(() => {
    if (studyQueue.length === 0) return;
    const cardId = studyQueue[studyIndex].id;
    const newKnown = [...studyKnown, cardId];
    setStudyKnown(newKnown);
    setFlipped(false);
    setTimeout(() => {
      if (studyIndex + 1 >= studyQueue.length) {
        setShowSummary(true);
      } else {
        setStudyIndex((i) => i + 1);
      }
    }, 150);
  }, [studyQueue, studyIndex, studyKnown]);

  const handleReview = useCallback(() => {
    if (studyQueue.length === 0) return;
    const cardId = studyQueue[studyIndex].id;
    setStudyReview((prev) => [...prev, cardId]);
    setFlipped(false);
    setTimeout(() => {
      if (studyIndex + 1 >= studyQueue.length) {
        setShowSummary(true);
      } else {
        setStudyIndex((i) => i + 1);
      }
    }, 150);
  }, [studyQueue, studyIndex]);

  const restartWithReview = useCallback(() => {
    const reviewCards = cards.filter((c) => studyReview.includes(c.id));
    const queue = shuffle ? shuffleArray(reviewCards) : reviewCards;
    setStudyQueue(queue);
    setStudyIndex(0);
    setFlipped(false);
    setStudyKnown([]);
    setStudyReview([]);
    setShowSummary(false);
  }, [cards, studyReview, shuffle]);

  const startOver = useCallback(() => {
    const queue = shuffle ? shuffleArray(cards) : [...cards];
    setStudyQueue(queue);
    setStudyIndex(0);
    setFlipped(false);
    setStudyKnown([]);
    setStudyReview([]);
    setShowSummary(false);
  }, [cards, shuffle]);

  /* swipe handling */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].screenX - touchStartX.current;
    touchStartX.current = null;
    if (!flipped) return;
    if (diff > 60) handleKnow();
    else if (diff < -60) handleReview();
  }, [flipped, handleKnow, handleReview]);

  /* mouse drag swipe */
  const dragStartX = useRef<number | null>(null);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.screenX;
  }, []);
  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const diff = e.screenX - dragStartX.current;
    dragStartX.current = null;
    if (!flipped) return;
    if (diff > 60) handleKnow();
    else if (diff < -60) handleReview();
  }, [flipped, handleKnow, handleReview]);

  /* -- editor actions -- */
  const addCard = useCallback(() => {
    const newCard = { front: 'Front text', back: 'Back text', id: generateId() };
    const newCards = [...cards, newCard];
    onUpdate({ cards: newCards, currentIndex: newCards.length - 1 });
  }, [cards, onUpdate]);

  const deleteCard = useCallback(() => {
    if (cards.length <= 1) return;
    const newCards = cards.filter((_, i) => i !== safeIndex);
    onUpdate({
      cards: newCards,
      currentIndex: Math.min(safeIndex, newCards.length - 1),
    });
  }, [cards, safeIndex, onUpdate]);

  const updateCardFront = useCallback(
    (val: string) => {
      if (!currentCard) return;
      const newCards = cards.map((c, i) =>
        i === safeIndex ? { ...c, front: val } : c
      );
      onUpdate({ cards: newCards });
    },
    [cards, safeIndex, currentCard, onUpdate]
  );

  const updateCardBack = useCallback(
    (val: string) => {
      if (!currentCard) return;
      const newCards = cards.map((c, i) =>
        i === safeIndex ? { ...c, back: val } : c
      );
      onUpdate({ cards: newCards });
    },
    [cards, safeIndex, currentCard, onUpdate]
  );

  const goToCard = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, cards.length - 1));
      onUpdate({ currentIndex: clamped });
    },
    [cards.length, onUpdate]
  );

  /* -- derived -- */
  const progressPercent = useMemo(() => {
    if (studyQueue.length === 0) return 0;
    return ((studyIndex + (showSummary ? 1 : 0)) / studyQueue.length) * 100;
  }, [studyQueue.length, studyIndex, showSummary]);

  /* -- keyboard support in study mode -- */
  useEffect(() => {
    if (!isStudyMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight' && flipped) {
        handleKnow();
      } else if (e.key === 'ArrowLeft' && flipped) {
        handleReview();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isStudyMode, flipped, handleKnow, handleReview]);

  /* ---------------------------------------------------------------- */
  /*  STUDY MODE                                                      */
  /* ---------------------------------------------------------------- */
  if (isStudyMode) {
    return (
      <div className="w-full h-full flex flex-col bg-[#FDFCFA] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-light">
          <span className="text-xs font-medium text-ink-secondary">
            {element.title || 'Study Mode'}
          </span>
          <button
            onClick={exitStudyMode}
            className="text-xs px-2 py-1 rounded-md bg-accent-light text-accent hover:bg-accent hover:text-white transition-colors"
          >
            Exit Study
          </button>
        </div>

        {/* Summary screen */}
        {showSummary ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-bold text-ink mb-1">Study Session Complete!</h3>
              <p className="text-sm text-ink-secondary">
                {studyKnown.length} cards known &middot; {studyReview.length} cards to review
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              {studyReview.length > 0 && (
                <button
                  onClick={restartWithReview}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Study Review Cards
                </button>
              )}
              <button
                onClick={startOver}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-border-light">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="px-4 pt-2 text-[10px] text-ink-secondary text-center">
              Card {studyIndex + 1} of {studyQueue.length}
            </div>

            {/* 3D Flip Card */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div
                className="relative w-full max-w-[320px]"
                style={{ perspective: '1000px' }}
              >
                <div
                  ref={cardRef}
                  className="relative w-full cursor-pointer select-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '180px',
                  }}
                  onClick={() => setFlipped((f) => !f)}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-6 rounded-xl border-2 border-border-medium bg-white shadow-sm"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-center text-[15px] text-ink font-medium leading-relaxed">
                      {studyQueue[studyIndex]?.front || 'No cards'}
                    </p>
                  </div>
                  {/* Back face */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-6 rounded-xl border-2 border-accent bg-accent-lightest shadow-sm"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-center text-[15px] text-ink font-medium leading-relaxed">
                      {studyQueue[studyIndex]?.back || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 pb-4 px-4">
              <button
                onClick={handleReview}
                disabled={!flipped}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <XCircle className="w-4 h-4" />
                Study Again
              </button>
              <button
                onClick={() => setFlipped((f) => !f)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-border-light text-ink-secondary text-sm font-medium hover:bg-border-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                {flipped ? 'Show Front' : 'Flip Card'}
              </button>
              <button
                onClick={handleKnow}
                disabled={!flipped}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                I Know This
              </button>
            </div>

            {/* Swipe hint */}
            <div className="text-center pb-3 text-[10px] text-ink-tertiary">
              Tap card to flip &middot; Swipe right = Know &middot; Swipe left = Review &middot; Space = Flip
            </div>
          </>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  EDITOR MODE                                                     */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className="w-full h-full flex flex-col p-3 gap-2 overflow-hidden"
      style={{
        cursor: isSelected ? 'text' : 'grab',
        backgroundColor: '#FDFCFA',
        borderRadius: '8px',
      }}
    >
      {/* Title + Study button */}
      <div className="flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" />
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Flashcard Set Title"
          className="flex-1 text-[12px] font-semibold text-ink bg-transparent outline-none placeholder:text-ink-tertiary"
        />
        {cards.length > 0 && (
          <button
            onClick={enterStudyMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-white text-[11px] font-medium hover:bg-accent-hover transition-colors flex-shrink-0"
          >
            <BookOpen className="w-3 h-3" />
            Study
          </button>
        )}
      </div>

      {/* Card stack preview */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">
        {/* Stack backdrop cards */}
        {cards.length > 1 && (
          <>
            <div
              className="absolute rounded-lg border border-border-medium bg-white"
              style={{
                width: '70%',
                height: '70%',
                transform: 'rotate(3deg) translateY(-4px)',
                opacity: 0.5,
                zIndex: 1,
              }}
            />
            <div
              className="absolute rounded-lg border border-border-medium bg-white"
              style={{
                width: '75%',
                height: '75%',
                transform: 'rotate(-2deg) translateY(-2px)',
                opacity: 0.7,
                zIndex: 2,
              }}
            />
          </>
        )}

        {/* Main card */}
        <div
          className="relative z-10 w-[85%] max-w-[260px] rounded-lg border-2 border-border-medium bg-white shadow-xs flex flex-col overflow-hidden"
          style={{ minHeight: '100px' }}
        >
          {currentCard ? (
            <>
              <div className="flex-1 p-3 border-b border-dashed border-border-light">
                <label className="text-[9px] uppercase tracking-wider text-ink-secondary font-medium">
                  Front
                </label>
                <textarea
                  value={currentCard.front}
                  onChange={(e) => updateCardFront(e.target.value)}
                  className="w-full mt-1 text-[13px] text-ink bg-transparent outline-none resize-none"
                  rows={2}
                  placeholder="Front of card..."
                />
              </div>
              <div className="flex-1 p-3">
                <label className="text-[9px] uppercase tracking-wider text-ink-secondary font-medium">
                  Back
                </label>
                <textarea
                  value={currentCard.back}
                  onChange={(e) => updateCardBack(e.target.value)}
                  className="w-full mt-1 text-[13px] text-ink bg-transparent outline-none resize-none"
                  rows={2}
                  placeholder="Back of card..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-[12px] text-ink-secondary text-center">
              No cards yet. Click &quot;Add Card&quot; to get started.
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-2 pt-1">
        {/* Navigation */}
        <button
          onClick={() => goToCard(safeIndex - 1)}
          disabled={safeIndex <= 0}
          className="p-1 rounded-md hover:bg-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-ink-secondary" />
        </button>

        <span className="text-[11px] text-ink-secondary font-medium min-w-[60px] text-center">
          {cards.length > 0 ? `Card ${safeIndex + 1} of ${cards.length}` : '0 cards'}
        </span>

        <button
          onClick={() => goToCard(safeIndex + 1)}
          disabled={safeIndex >= cards.length - 1}
          className="p-1 rounded-md hover:bg-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-ink-secondary" />
        </button>

        <div className="flex-1" />

        {/* Shuffle toggle */}
        <button
          onClick={() => onUpdate({ shuffle: !shuffle })}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
            shuffle
              ? 'bg-accent-light text-accent'
              : 'bg-border-light text-ink-secondary hover:bg-border-medium'
          }`}
        >
          <Shuffle className="w-3 h-3" />
          Shuffle
        </button>

        {/* Add / Delete */}
        <button
          onClick={addCard}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-medium hover:bg-success/20 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>

        <button
          onClick={deleteCard}
          disabled={cards.length <= 1}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-error-bg text-error text-[10px] font-medium hover:bg-error/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
}
