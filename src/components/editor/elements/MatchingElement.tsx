import { useState, useCallback, useMemo, useEffect } from 'react';
import type { MatchingElement as MatchingElementType, MatchingPair, MatchingItem } from '@/types/worksheet';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Plus, Trash2, Trophy, RotateCcw, Eye, EyeOff, Link2, GraduationCap } from 'lucide-react';

interface Props {
  element: MatchingElementType;
  isEditing: boolean;
  isSelected: boolean;
  onUpdate: (updates: Partial<MatchingElementType>) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildItems(pairs: MatchingPair[], shuffleEnabled: boolean): { left: MatchingItem[]; right: MatchingItem[] } {
  const left: MatchingItem[] = pairs.map((p) => ({ id: `left-${p.id}`, text: p.left, pairId: p.id }));
  const right: MatchingItem[] = pairs.map((p) => ({ id: `right-${p.id}`, text: p.right, pairId: p.id }));
  if (shuffleEnabled) return { left: shuffleArray(left), right: shuffleArray(right) };
  return { left, right };
}

type ItemStatus = 'idle' | 'selected' | 'matched' | 'mismatched';

function getItemStatus(item: MatchingItem, selectedId: string | null, matchedPairs: string[], mismatchedPair: string | null): ItemStatus {
  if (matchedPairs.includes(item.pairId)) return 'matched';
  if (mismatchedPair === item.pairId) return 'mismatched';
  if (selectedId === item.id) return 'selected';
  return 'idle';
}

function getStatusClasses(status: ItemStatus, isLeft: boolean): string {
  const base = 'relative flex items-center justify-center gap-2 w-full min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 select-none cursor-pointer';
  switch (status) {
    case 'matched': return `${base} bg-emerald-50 border-emerald-400 text-emerald-700 cursor-default shadow-sm`;
    case 'mismatched': return `${base} bg-red-50 border-red-400 text-red-700 animate-shake`;
    case 'selected': return `${base} ${isLeft ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-md scale-[1.02]' : 'bg-violet-50 border-violet-400 text-violet-700 shadow-md scale-[1.02]'}`;
    default: return `${base} bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50 hover:shadow-sm`;
  }
}

function MatchingEditor({ element, onUpdate }: { element: MatchingElementType; onUpdate: (u: Partial<MatchingElementType>) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const pairs = element.pairs || [];

  const handlePairUpdate = useCallback((index: number, updates: Partial<MatchingPair>) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], ...updates };
    onUpdate({ pairs: newPairs });
  }, [pairs, onUpdate]);

  const handleAddPair = useCallback(() => {
    if (pairs.length >= 12) return;
    const newPair: MatchingPair = { id: `pair-${Date.now()}`, left: '', right: '' };
    onUpdate({ pairs: [...pairs, newPair] });
  }, [pairs, onUpdate]);

  const handleRemovePair = useCallback((index: number) => {
    if (pairs.length <= 3) return;
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    onUpdate({ pairs: newPairs });
  }, [pairs, onUpdate]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 overflow-auto">
      <input type="text" value={element.title || ''} onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Game Title" className="w-full text-sm font-bold text-stone-800 outline-none border-b border-dashed border-stone-300 pb-1 bg-transparent placeholder:text-stone-400" />
      <input type="text" value={element.instruction || ''} onChange={(e) => onUpdate({ instruction: e.target.value })}
        placeholder="Instruction text" className="w-full text-xs text-stone-600 outline-none border-b border-dashed border-stone-200 pb-1 bg-transparent placeholder:text-stone-400" />
      <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
        <input type="checkbox" checked={element.shuffle !== false} onChange={(e) => onUpdate({ shuffle: e.target.checked })} className="w-3.5 h-3.5 accent-[#D97757] rounded" />
        <Shuffle className="w-3.5 h-3.5" />Shuffle items for students
      </label>
      {!showPreview ? (
        <>
          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Pairs ({pairs.length}/12)</span><span className={pairs.length < 3 ? 'text-red-500' : ''}>{pairs.length < 3 ? 'Min 3 pairs required' : ''}</span>
          </div>
          <div className="flex flex-col gap-2">
            {pairs.map((pair, i) => (
              <div key={pair.id} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white border border-stone-200 rounded-md px-2 py-1.5">
                  <span className="text-[10px] text-stone-400 font-mono w-4">{i + 1}</span>
                  <input type="text" value={pair.left} onChange={(e) => handlePairUpdate(i, { left: e.target.value })}
                    placeholder="Left item" className="flex-1 text-xs text-stone-700 outline-none bg-transparent placeholder:text-stone-400" />
                  <Link2 className="w-3 h-3 text-stone-300 flex-shrink-0" />
                  <input type="text" value={pair.right} onChange={(e) => handlePairUpdate(i, { right: e.target.value })}
                    placeholder="Right item" className="flex-1 text-xs text-stone-700 outline-none bg-transparent placeholder:text-stone-400" />
                </div>
                <button onClick={() => handleRemovePair(i)} disabled={pairs.length <= 3}
                  className={`p-1.5 rounded-md transition-colors ${pairs.length <= 3 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-400 hover:text-red-500 hover:bg-red-50'}`} title="Remove pair">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleAddPair} disabled={pairs.length >= 12}
            className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-md text-xs font-medium transition-colors border border-dashed ${pairs.length >= 12 ? 'text-stone-400 border-stone-200 cursor-not-allowed' : 'text-[#D97757] border-[#D97757]/30 hover:bg-[#FDF5F0] hover:border-[#D97757]/60'}`}>
            <Plus className="w-3.5 h-3.5" />Add Pair
          </button>
        </>
      ) : <MatchingPreview element={element} />}
      <button onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-1.5 self-start text-[10px] text-stone-500 hover:text-[#D97757] transition-colors mt-auto">
        {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{showPreview ? 'Back to Editor' : 'Preview Student View'}
      </button>
    </div>
  );
}

function MatchingPreview({ element }: { element: MatchingElementType }) {
  const pairs = element.pairs || [];
  const built = useMemo(() => buildItems(pairs, element.shuffle !== false), [pairs, element.shuffle]);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-stone-600 italic">{element.instruction || 'Match each item on the left with its pair on the right!'}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {built.left.map((item) => <div key={item.id} className="w-full min-h-[48px] px-3 py-2.5 rounded-xl text-xs font-medium bg-white border-2 border-stone-200 text-stone-700 flex items-center justify-center text-center">{item.text || '(empty)'}</div>)}
        </div>
        <div className="flex flex-col gap-2">
          {built.right.map((item) => <div key={item.id} className="w-full min-h-[48px] px-3 py-2.5 rounded-xl text-xs font-medium bg-white border-2 border-stone-200 text-stone-700 flex items-center justify-center text-center">{item.text || '(empty)'}</div>)}
        </div>
      </div>
    </div>
  );
}

function MatchingStudent({ element, onUpdate }: { element: MatchingElementType; onUpdate: (u: Partial<MatchingElementType>) => void }) {
  const pairs = element.pairs || [];
  const matchedPairs = element.matchedPairs || [];
  const selectedLeft = element.selectedLeft ?? null;
  const selectedRight = element.selectedRight ?? null;

  useEffect(() => {
    if ((!element.leftItems || !element.rightItems) && pairs.length > 0) {
      const built = buildItems(pairs, element.shuffle !== false);
      onUpdate({ leftItems: built.left, rightItems: built.right, matchedPairs: [], selectedLeft: null, selectedRight: null });
    }
  }, [pairs.length]);

  const leftItems = element.leftItems || [];
  const rightItems = element.rightItems || [];
  const totalPairs = pairs.length;
  const matchedCount = matchedPairs.length;
  const isComplete = matchedCount === totalPairs && totalPairs > 0;
  const progressPercent = totalPairs > 0 ? (matchedCount / totalPairs) * 100 : 0;

  const handleLeftClick = useCallback((item: MatchingItem) => {
    if (matchedPairs.includes(item.pairId)) return;
    if (selectedLeft === item.id) { onUpdate({ selectedLeft: null }); return; }
    if (selectedRight !== null) {
      const rightItem = rightItems.find((r) => r.id === selectedRight);
      if (rightItem) {
        if (rightItem.pairId === item.pairId) { onUpdate({ matchedPairs: [...matchedPairs, item.pairId], selectedLeft: null, selectedRight: null }); }
        else { onUpdate({ mismatchedPair: item.pairId, selectedLeft: null, selectedRight: null }); setTimeout(() => onUpdate({ mismatchedPair: null }), 800); }
      }
      return;
    }
    onUpdate({ selectedLeft: item.id });
  }, [matchedPairs, selectedLeft, selectedRight, rightItems, onUpdate]);

  const handleRightClick = useCallback((item: MatchingItem) => {
    if (matchedPairs.includes(item.pairId)) return;
    if (selectedRight === item.id) { onUpdate({ selectedRight: null }); return; }
    if (selectedLeft !== null) {
      const leftItem = leftItems.find((l) => l.id === selectedLeft);
      if (leftItem) {
        if (leftItem.pairId === item.pairId) { onUpdate({ matchedPairs: [...matchedPairs, item.pairId], selectedLeft: null, selectedRight: null }); }
        else { onUpdate({ mismatchedPair: item.pairId, selectedLeft: null, selectedRight: null }); setTimeout(() => onUpdate({ mismatchedPair: null }), 800); }
      }
      return;
    }
    onUpdate({ selectedRight: item.id });
  }, [matchedPairs, selectedRight, selectedLeft, leftItems, onUpdate]);

  const handleReset = useCallback(() => {
    const built = buildItems(pairs, element.shuffle !== false);
    onUpdate({ leftItems: built.left, rightItems: built.right, matchedPairs: [], selectedLeft: null, selectedRight: null, mismatchedPair: null });
  }, [pairs, element.shuffle, onUpdate]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 overflow-auto">
      {element.title && <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#D97757]" />{element.title}</h3>}
      <p className="text-xs text-stone-600 italic">{element.instruction || 'Match each item on the left with its pair on the right!'}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#D97757] to-amber-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
        </div>
        <span className="text-[10px] font-semibold text-stone-500 tabular-nums">{matchedCount}/{totalPairs}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold text-center">Left</span>
          {leftItems.map((item) => {
            const status = getItemStatus(item, selectedLeft, matchedPairs, element.mismatchedPair || null);
            return (
              <motion.button key={item.id} onClick={() => handleLeftClick(item)} disabled={status === 'matched'} whileTap={status !== 'matched' ? { scale: 0.96 } : {}} className={getStatusClasses(status, true)}>
                <span className="text-center break-words">{item.text || '(empty)'}</span>
                {status === 'matched' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></motion.span>}
              </motion.button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold text-center">Right</span>
          {rightItems.map((item) => {
            const status = getItemStatus(item, selectedRight, matchedPairs, element.mismatchedPair || null);
            return (
              <motion.button key={item.id} onClick={() => handleRightClick(item)} disabled={status === 'matched'} whileTap={status !== 'matched' ? { scale: 0.96 } : {}} className={getStatusClasses(status, false)}>
                <span className="text-center break-words">{item.text || '(empty)'}</span>
                {status === 'matched' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></motion.span>}
              </motion.button>
            );
          })}
        </div>
      </div>
      <button onClick={handleReset} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
        <RotateCcw className="w-3.5 h-3.5" />Reset Game
      </button>
      <AnimatePresence>
        {isComplete && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mt-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-lg text-center">
            <motion.div initial={{ rotate: -10 }} animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ delay: 0.2, duration: 0.6 }} className="flex justify-center mb-2">
              <Trophy className="w-8 h-8 text-amber-500" />
            </motion.div>
            <p className="text-sm font-bold text-stone-800">You matched them all!</p>
            <p className="text-xs text-stone-500 mt-1">Great job \u2014 you found every pair!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MatchingElement({ element, isEditing, isSelected, onUpdate }: Props) {
  return (
    <div className="w-full h-full" style={{ cursor: isEditing ? 'default' : isSelected ? 'text' : 'grab', borderRadius: 'inherit' }}>
      {isEditing ? <MatchingEditor element={element} onUpdate={onUpdate} /> : <MatchingStudent element={element} onUpdate={onUpdate} />}
    </div>
  );
}
