import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { CrosswordElement as CrosswordElementType, Clue } from '@/types/worksheet';
import { generateCrossword } from '@/lib/crossword';

interface Props {
  element: CrosswordElementType;
  isSelected: boolean;
  onUpdate?: (updates: Partial<CrosswordElementType>) => void;
}

function getCellKey(row: number, col: number): string {
  return `${row},${col}`;
}

interface WordEntry {
  id: number;
  word: string;
  clue: string;
}

export default function CrosswordElement(props: Props) {
  const { element, isSelected } = props;
  const words = element.words || [];
  const gridSize = element.gridSize || 10;
  const grid = element.grid;
  const numbers = element.numbers || {};
  const acrossClues = element.acrossClues || [];
  const downClues = element.downClues || [];
  const userAnswers = element.userAnswers || {};
  const title = element.title || '';

  const update = useCallback((updates: Partial<CrosswordElementType>) => { props.onUpdate?.(updates); }, [props]);

  const [wordEntries, setWordEntries] = useState<WordEntry[]>(() => {
    if (words.length > 0) return words.map((w, i) => ({ id: i, word: w.word, clue: w.clue }));
    return [{ id: 0, word: '', clue: '' }];
  });
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [showErrors, setShowErrors] = useState(false);
  const [clueTab, setClueTab] = useState<'across' | 'down'>('across');

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const isEditing = !!props.onUpdate;

  useEffect(() => {
    if (words.length > 0) setWordEntries(words.map((w, i) => ({ id: i, word: w.word, clue: w.clue })));
  }, [element.words.length]);

  const activeClue = useMemo(() => {
    if (!selectedCell || !grid) return null;
    const [sr, sc] = selectedCell;
    const num = numbers[getCellKey(sr, sc)];
    const clues = activeDirection === 'across' ? acrossClues : downClues;
    if (num !== undefined) {
      const clue = clues.find((c) => c.number === num);
      if (clue) return clue;
    }
    for (const clue of clues) {
      const startNum = clue.number;
      const answer = clue.answer;
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (numbers[getCellKey(r, c)] === startNum) {
            if (activeDirection === 'across') {
              if (r === sr && sc >= c && sc < c + answer.length) return clue;
            } else {
              if (c === sc && sr >= r && sr < r + answer.length) return clue;
            }
          }
        }
      }
    }
    return null;
  }, [selectedCell, activeDirection, numbers, acrossClues, downClues, grid, gridSize]);

  const handleAddEntry = useCallback(() => { setWordEntries((prev) => [...prev, { id: prev.length, word: '', clue: '' }]); }, []);
  const handleRemoveEntry = useCallback((id: number) => { setWordEntries((prev) => prev.filter((e) => e.id !== id)); }, []);
  const handleEntryChange = useCallback((id: number, field: 'word' | 'clue', value: string) => {
    setWordEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }, []);

  const handleGenerate = useCallback(() => {
    const validWords = wordEntries.filter((e) => e.word.trim().length > 0).map((e) => ({ word: e.word.trim().toUpperCase(), clue: e.clue.trim() }));
    if (validWords.length === 0) return;
    update({ words: validWords });
    const result = generateCrossword(validWords, gridSize);
    update({ grid: result.grid, numbers: result.numbers, acrossClues: result.acrossClues, downClues: result.downClues, userAnswers: {} });
  }, [wordEntries, gridSize, update]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!grid || grid[row][col] === null) return;
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      setActiveDirection((d) => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell([row, col]);
      setActiveDirection('across');
    }
    requestAnimationFrame(() => { const key = getCellKey(row, col); inputRefs.current[key]?.focus(); });
  }, [grid, selectedCell]);

  const getNextCell = useCallback((row: number, col: number, direction: 'across' | 'down'): [number, number] | null => {
    if (direction === 'across') { if (col + 1 < gridSize && grid && grid[row][col + 1] !== null) return [row, col + 1]; }
    else { if (row + 1 < gridSize && grid && grid[row + 1]?.[col] !== null) return [row + 1, col]; }
    return null;
  }, [grid, gridSize]);

  const getPrevCell = useCallback((row: number, col: number, direction: 'across' | 'down'): [number, number] | null => {
    if (direction === 'across') { if (col - 1 >= 0 && grid && grid[row][col - 1] !== null) return [row, col - 1]; }
    else { if (row - 1 >= 0 && grid && grid[row - 1]?.[col] !== null) return [row - 1, col]; }
    return null;
  }, [grid, gridSize]);

  const moveToCell = useCallback((row: number, col: number) => {
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize && grid && grid[row][col] !== null) {
      setSelectedCell([row, col]);
      requestAnimationFrame(() => { const key = getCellKey(row, col); inputRefs.current[key]?.focus(); });
    }
  }, [grid, gridSize]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    const key = e.key;
    if (key === 'ArrowRight') { e.preventDefault(); setActiveDirection('across'); moveToCell(row, col + 1); }
    else if (key === 'ArrowLeft') { e.preventDefault(); setActiveDirection('across'); moveToCell(row, col - 1); }
    else if (key === 'ArrowDown') { e.preventDefault(); setActiveDirection('down'); moveToCell(row + 1, col); }
    else if (key === 'ArrowUp') { e.preventDefault(); setActiveDirection('down'); moveToCell(row - 1, col); }
    else if (key === 'Backspace') {
      e.preventDefault();
      const cellKey = getCellKey(row, col);
      if (userAnswers[cellKey]) { update({ userAnswers: { ...userAnswers, [cellKey]: '' } }); }
      else {
        const prev = getPrevCell(row, col, activeDirection);
        if (prev) { const prevKey = getCellKey(prev[0], prev[1]); update({ userAnswers: { ...userAnswers, [prevKey]: '' } }); moveToCell(prev[0], prev[1]); }
      }
    } else if (key === 'Tab') {
      e.preventDefault();
      const next = getNextCell(row, col, activeDirection);
      if (next) moveToCell(next[0], next[1]);
    }
  }, [activeDirection, userAnswers, update, getPrevCell, getNextCell, moveToCell]);

  const handleCellInput = useCallback((row: number, col: number, value: string) => {
    const letter = value.slice(-1).toUpperCase();
    if (!letter || !/[A-Z]/.test(letter)) return;
    const cellKey = getCellKey(row, col);
    update({ userAnswers: { ...userAnswers, [cellKey]: letter } });
    const next = getNextCell(row, col, activeDirection);
    if (next) moveToCell(next[0], next[1]);
  }, [activeDirection, userAnswers, update, getNextCell, moveToCell]);

  const handleReveal = useCallback(() => {
    if (!grid) return;
    const answers: Record<string, string> = {};
    for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) { const val = grid[r][c]; if (val !== null) answers[getCellKey(r, c)] = val; }
    update({ userAnswers: answers });
    setShowErrors(false);
  }, [grid, gridSize, update]);

  const handleCheck = useCallback(() => { setShowErrors(true); setTimeout(() => setShowErrors(false), 2000); }, []);

  const activeWordCells = useMemo(() => {
    if (!selectedCell || !grid) return new Set<string>();
    const [sr, sc] = selectedCell;
    const set = new Set<string>();
    let startR = sr, startC = sc;
    if (activeDirection === 'across') { while (startC > 0 && grid[sr][startC - 1] !== null) startC--; }
    else { while (startR > 0 && grid[startR - 1]?.[sc] !== null) startR--; }
    let r = startR, c = startC;
    if (activeDirection === 'across') { while (c < gridSize && grid[r][c] !== null) { set.add(getCellKey(r, c)); c++; } }
    else { while (r < gridSize && grid[r]?.[c] !== null) { set.add(getCellKey(r, c)); r++; } }
    return set;
  }, [selectedCell, activeDirection, grid, gridSize]);

  return (
    <div className="w-full h-full flex flex-col p-3 gap-2 overflow-auto" style={{ cursor: isSelected ? 'text' : 'grab' }} ref={containerRef}>
      {isEditing ? (
        <input type="text" value={title} onChange={(e) => update({ title: e.target.value })} placeholder="Crossword Title"
          className="text-base font-semibold text-ink outline-none bg-transparent border-b border-border-medium focus:border-accent" />
      ) : title ? <h3 className="text-base font-semibold text-ink">{title}</h3> : null}

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-ink-secondary uppercase tracking-wider">Word : Clue pairs</div>
          {wordEntries.map((entry, idx) => (
            <div key={entry.id} className="flex gap-1 items-center">
              <span className="text-xs text-ink-secondary w-5">{idx + 1}.</span>
              <input type="text" value={entry.word} onChange={(e) => handleEntryChange(entry.id, 'word', e.target.value)}
                placeholder="WORD" className="flex-1 text-xs border border-border-medium rounded p-1 outline-none focus:border-accent uppercase" />
              <input type="text" value={entry.clue} onChange={(e) => handleEntryChange(entry.id, 'clue', e.target.value)}
                placeholder="Clue..." className="flex-[2] text-xs border border-border-medium rounded p-1 outline-none focus:border-accent" />
              <button onClick={() => handleRemoveEntry(entry.id)} className="text-xs text-red-400 hover:text-red-600 px-1">x</button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleAddEntry} className="px-2 py-1 text-xs bg-stone-200 text-ink rounded hover:bg-stone-300">+ Add Word</button>
            <button onClick={handleGenerate} className="px-3 py-1 text-xs bg-accent text-white rounded hover:opacity-90">Generate Puzzle</button>
          </div>
          {grid ? (
            <div className="flex flex-col gap-2">
              <div className="grid gap-px bg-stone-700 rounded overflow-hidden self-start" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {grid.flatMap((row, r) => row.map((cell, c) => {
                  const key = getCellKey(r, c);
                  const num = numbers[key];
                  if (cell === null) return <div key={key} className="bg-stone-800" style={{ aspectRatio: '1/1', minWidth: '24px' }} />;
                  return (
                    <div key={key} className="relative flex items-center justify-center bg-paper text-xs font-medium" style={{ aspectRatio: '1/1', minWidth: '24px' }}>
                      {num !== undefined && <span className="absolute text-[8px] font-bold text-stone-500" style={{ top: '1px', left: '2px' }}>{num}</span>}
                      {cell}
                    </div>
                  );
                }))}
              </div>
              <div className="flex gap-4 text-xs">
                {acrossClues.length > 0 && (
                  <div className="flex-1">
                    <div className="font-semibold text-ink mb-1">Across</div>
                    <div className="flex flex-col gap-0.5">
                      {acrossClues.map((cl) => <div key={`a-${cl.number}`} className="text-ink-secondary"><span className="font-bold text-ink">{cl.number}.</span> {cl.clue}</div>)}
                    </div>
                  </div>
                )}
                {downClues.length > 0 && (
                  <div className="flex-1">
                    <div className="font-semibold text-ink mb-1">Down</div>
                    <div className="flex flex-col gap-0.5">
                      {downClues.map((cl) => <div key={`d-${cl.number}`} className="text-ink-secondary"><span className="font-bold text-ink">{cl.number}.</span> {cl.clue}</div>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : <div className="text-sm text-ink-secondary italic">Add word:clue pairs and click Generate Puzzle.</div>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {grid ? (
            <>
              {activeClue && (
                <div className="text-sm bg-ela-light p-2 rounded">
                  <span className="font-bold">{activeClue.number} {activeDirection}</span>: {activeClue.clue}
                </div>
              )}
              <div className="grid gap-px bg-stone-700 rounded overflow-hidden self-start" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {grid.flatMap((row, r) => row.map((cell, c) => {
                  const key = getCellKey(r, c);
                  const num = numbers[key];
                  if (cell === null) return <div key={key} className="bg-stone-800" style={{ aspectRatio: '1/1', minWidth: '32px' }} />;
                  const isSel = selectedCell?.[0] === r && selectedCell?.[1] === c;
                  const isInActiveWord = activeWordCells.has(key);
                  const userVal = userAnswers[key] || '';
                  const isCorrect = cell !== null && userVal === cell;
                  const showError = showErrors && userVal && !isCorrect;
                  return (
                    <div key={key} className="relative" style={{ aspectRatio: '1/1', minWidth: '32px', backgroundColor: isSel ? '#D97757' : isInActiveWord ? '#F0EBE0' : '#FDFCFA', transition: 'background-color 0.15s' }}
                      onClick={() => handleCellClick(r, c)}>
                      {num !== undefined && <span className="absolute text-[9px] font-bold text-stone-500 z-10 pointer-events-none" style={{ top: '1px', left: '2px' }}>{num}</span>}
                      <input ref={(el) => { inputRefs.current[key] = el; }} type="text" value={userVal} maxLength={1}
                        onChange={(e) => handleCellInput(r, c, e.target.value)} onKeyDown={(e) => handleKeyDown(e, r, c)} onClick={() => handleCellClick(r, c)}
                        className="w-full h-full text-center text-sm font-bold uppercase outline-none bg-transparent relative z-[1]"
                        style={{ color: showError ? '#DC2626' : isCorrect ? '#166534' : '#292524', caretColor: 'transparent' }} />
                    </div>
                  );
                }))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleCheck} className="px-3 py-1 text-xs bg-accent text-white rounded hover:opacity-90">Check Answers</button>
                <button onClick={handleReveal} className="px-3 py-1 text-xs bg-stone-700 text-white rounded hover:opacity-90">Reveal All</button>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <button onClick={() => setClueTab('across')} className={'px-2 py-0.5 text-xs rounded ' + (clueTab === 'across' ? 'bg-accent text-white' : 'bg-stone-200 text-ink hover:bg-stone-300')}>Across ({acrossClues.length})</button>
                  <button onClick={() => setClueTab('down')} className={'px-2 py-0.5 text-xs rounded ' + (clueTab === 'down' ? 'bg-accent text-white' : 'bg-stone-200 text-ink hover:bg-stone-300')}>Down ({downClues.length})</button>
                </div>
                <div className="max-h-32 overflow-y-auto flex flex-col gap-0.5">
                  {(clueTab === 'across' ? acrossClues : downClues).map((cl: Clue) => (
                    <button key={`${clueTab}-${cl.number}`} onClick={() => {
                      for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) if (numbers[getCellKey(r, c)] === cl.number) { setClueTab(clueTab); setActiveDirection(clueTab); moveToCell(r, c); return; }
                    }} className="text-left text-xs px-1 py-0.5 rounded hover:bg-ela-light">
                      <span className="font-bold">{cl.number}.</span> <span className="text-ink-secondary">{cl.clue}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : <div className="text-sm text-ink-secondary italic">No crossword generated yet.</div>}
        </div>
      )}
    </div>
  );
}
