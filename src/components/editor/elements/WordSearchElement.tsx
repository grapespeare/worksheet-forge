import { useState, useCallback, useRef, useMemo } from 'react';
import type { WordSearchElement as WordSearchElementType, WordPlacement } from '@/types/worksheet';
import { generateWordSearch } from '@/lib/wordsearch';

interface Props {
  element: WordSearchElementType;
  isSelected: boolean;
  onUpdate?: (updates: Partial<WordSearchElementType>) => void;
}

const DIRECTION_VECTORS: Record<string, [number, number]> = {
  E: [0, 1], W: [0, -1], S: [1, 0], N: [-1, 0],
  SE: [1, 1], SW: [1, -1], NE: [-1, 1], NW: [-1, -1],
};

const FOUND_COLORS = [
  '#D97757', '#5B8DB8', '#6BAA68', '#9B7EDE', '#D977A0',
  '#4A9B9B', '#D9A757', '#7EB8DA', '#8FBC8F', '#B8A9C9',
];

function getCellKey(row: number, col: number): string {
  return `${row},${col}`;
}

function getLineCells(startRow: number, startCol: number, endRow: number, endCol: number): Array<[number, number]> | null {
  const dRow = endRow - startRow;
  const dCol = endCol - startCol;
  if (dRow === 0 && dCol === 0) return null;
  let dir: [number, number] | null = null;
  for (const [, [dr, dc]] of Object.entries(DIRECTION_VECTORS)) {
    if ((dRow === 0 && dr === 0 && dCol !== 0 && dc !== 0) ||
      (dCol === 0 && dc === 0 && dRow !== 0 && dr !== 0) ||
      (Math.abs(dRow) === Math.abs(dCol) && Math.abs(dr) === 1 && Math.abs(dc) === 1)) {
      if ((dRow > 0 && dr > 0) || (dRow < 0 && dr < 0) || (dRow === 0 && dr === 0)) {
        if ((dCol > 0 && dc > 0) || (dCol < 0 && dc < 0) || (dCol === 0 && dc === 0)) {
          const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
          if (dRow === dr * steps && dCol === dc * steps) {
            dir = [dr, dc];
            break;
          }
        }
      }
    }
  }
  if (!dir) return null;
  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
  const cells: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([startRow + dir[0] * i, startCol + dir[1] * i]);
  }
  return cells;
}

function isWordMatch(cells: Array<[number, number]>, placements: WordPlacement[]): WordPlacement | null {
  for (const p of placements) {
    const vec = DIRECTION_VECTORS[p.direction];
    if (!vec) continue;
    const pCells: Array<[number, number]> = [];
    for (let i = 0; i < p.word.length; i++) {
      pCells.push([p.row + vec[0] * i, p.col + vec[1] * i]);
    }
    const match = cells.length === pCells.length && cells.every((c, i) => c[0] === pCells[i][0] && c[1] === pCells[i][1]);
    const reverseMatch = cells.length === pCells.length && cells.every((c, i) => c[0] === pCells[pCells.length - 1 - i][0] && c[1] === pCells[pCells.length - 1 - i][1]);
    if (match || reverseMatch) return p;
  }
  return null;
}

export default function WordSearchElement(props: Props) {
  const { element, isSelected } = props;
  const words = element.words || [];
  const gridSize = element.gridSize || 10;
  const difficulty = element.difficulty || 'medium';
  const grid = element.grid;
  const placements = element.placements || [];
  const foundWords = element.foundWords || [];
  const title = element.title || '';

  const update = useCallback((updates: Partial<WordSearchElementType>) => { props.onUpdate?.(updates); }, [props]);
  const [wordInput, setWordInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragEnd, setDragEnd] = useState<[number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isEditing = !!props.onUpdate;

  const foundCellMap = useMemo(() => {
    const map: Record<string, string> = {};
    foundWords.forEach((fw, idx) => {
      const placement = placements.find((p) => p.word === fw);
      if (!placement) return;
      const vec = DIRECTION_VECTORS[placement.direction];
      if (!vec) return;
      const color = FOUND_COLORS[idx % FOUND_COLORS.length];
      for (let i = 0; i < placement.word.length; i++) {
        const key = getCellKey(placement.row + vec[0] * i, placement.col + vec[1] * i);
        map[key] = color;
      }
    });
    return map;
  }, [foundWords, placements]);

  const dragCells = useMemo(() => {
    if (!dragStart || !dragEnd || !isDragging) return [] as string[];
    const cells = getLineCells(dragStart[0], dragStart[1], dragEnd[0], dragEnd[1]);
    if (!cells) return [] as string[];
    return cells.map(([r, c]) => getCellKey(r, c));
  }, [dragStart, dragEnd, isDragging]);

  const handleAddWords = useCallback(() => {
    const newWords = wordInput.split('\n').map((w) => w.trim().toUpperCase()).filter((w) => w.length > 0 && !words.includes(w));
    if (newWords.length > 0) update({ words: [...words, ...newWords] });
    setWordInput('');
  }, [wordInput, words, update]);

  const handleRemoveWord = useCallback((word: string) => { update({ words: words.filter((w) => w !== word) }); }, [words, update]);

  const handleGenerate = useCallback(() => {
    if (words.length === 0) return;
    const result = generateWordSearch(words, gridSize, difficulty);
    update({ grid: result.grid, placements: result.placements, foundWords: [] });
  }, [words, gridSize, difficulty, update]);

  const handleCellMouseDown = useCallback((row: number, col: number) => {
    if (!grid) return;
    setIsDragging(true);
    setDragStart([row, col]);
    setDragEnd([row, col]);
  }, [grid]);

  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    if (!isDragging) return;
    setDragEnd([row, col]);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false); setDragStart(null); setDragEnd(null); return;
    }
    const cells = getLineCells(dragStart[0], dragStart[1], dragEnd[0], dragEnd[1]);
    if (cells && cells.length > 0) {
      const match = isWordMatch(cells, placements);
      if (match && !foundWords.includes(match.word)) update({ foundWords: [...foundWords, match.word] });
    }
    setIsDragging(false); setDragStart(null); setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, placements, foundWords, update]);

  const touchStartRef = useRef<[number, number] | null>(null);
  const handleTouchStart = useCallback((row: number, col: number) => {
    if (!grid) return;
    touchStartRef.current = [row, col];
    setIsDragging(true); setDragStart([row, col]); setDragEnd([row, col]);
  }, [grid]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const cellW = rect.width / gridSize;
    const cellH = rect.height / gridSize;
    const col = Math.floor((touch.clientX - rect.left) / cellW);
    const row = Math.floor((touch.clientY - rect.top) / cellH);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) setDragEnd([row, col]);
  }, [isDragging, gridSize]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false); setDragStart(null); setDragEnd(null); touchStartRef.current = null; return;
    }
    const cells = getLineCells(dragStart[0], dragStart[1], dragEnd[0], dragEnd[1]);
    if (cells && cells.length > 0) {
      const match = isWordMatch(cells, placements);
      if (match && !foundWords.includes(match.word)) update({ foundWords: [...foundWords, match.word] });
    }
    setIsDragging(false); setDragStart(null); setDragEnd(null); touchStartRef.current = null;
  }, [isDragging, dragStart, dragEnd, placements, foundWords, update]);

  return (
    <div className="w-full h-full flex flex-col p-3 gap-2 overflow-auto" style={{ cursor: isSelected ? 'text' : 'grab' }}
      onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {isEditing ? (
        <input type="text" value={title} onChange={(e) => update({ title: e.target.value })}
          placeholder="Puzzle Title" className="text-base font-semibold text-ink outline-none bg-transparent border-b border-border-medium focus:border-accent" />
      ) : title ? <h3 className="text-base font-semibold text-ink">{title}</h3> : null}

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea value={wordInput} onChange={(e) => setWordInput(e.target.value)}
            placeholder="Enter words (one per line)" className="text-sm border border-border-medium rounded p-2 outline-none focus:border-accent resize-none" rows={3} />
          <div className="flex gap-2">
            <button onClick={handleAddWords} className="px-3 py-1 text-sm bg-accent text-white rounded hover:opacity-90">Add Words</button>
            <button onClick={handleGenerate} className="px-3 py-1 text-sm bg-stone-700 text-white rounded hover:opacity-90">Generate Puzzle</button>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-ink-secondary">Grid:</label>
            <select value={gridSize} onChange={(e) => update({ gridSize: parseInt(e.target.value) })}
              className="text-xs border border-border-medium rounded p-1 outline-none">
              <option value={8}>8x8</option><option value={10}>10x10</option><option value={12}>12x12</option><option value={15}>15x15</option>
            </select>
            <label className="text-xs text-ink-secondary ml-2">Difficulty:</label>
            <div className="flex gap-1">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => update({ difficulty: d })}
                  className={'px-2 py-0.5 text-xs rounded capitalize ' + (difficulty === d ? 'bg-accent text-white' : 'bg-stone-200 text-ink hover:bg-stone-300')}>
                  {d}</button>
              ))}
            </div>
          </div>
          {words.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {words.map((w) => (
                <span key={w} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-ela-light text-ela-accent rounded">
                  {w}<button onClick={() => handleRemoveWord(w)} className="text-ink-secondary hover:text-red-500">x</button>
                </span>
              ))}
            </div>
          )}
          {grid ? (
            <div className="grid gap-px bg-border-medium rounded overflow-hidden" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {grid.flatMap((row, r) => row.map((letter, c) => (
                <div key={`${r}-${c}`} className="flex items-center justify-center text-sm font-medium bg-paper" style={{ aspectRatio: '1/1', minWidth: '24px' }}>{letter}</div>
              )))}
            </div>
          ) : <div className="text-sm text-ink-secondary italic">Add words and click Generate Puzzle to create the grid.</div>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {grid ? (
            <>
              <div ref={containerRef} className="grid gap-px bg-border-medium rounded overflow-hidden select-none" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {grid.flatMap((row, r) => row.map((letter, c) => {
                  const key = getCellKey(r, c);
                  const foundColor = foundCellMap[key];
                  const isDragSelected = dragCells.includes(key);
                  return (
                    <div key={`${r}-${c}`} className="flex items-center justify-center text-sm font-semibold cursor-pointer select-none"
                      style={{ aspectRatio: '1/1', minWidth: '32px', backgroundColor: foundColor ? foundColor + '40' : isDragSelected ? '#E8F1F8' : '#FDFCFA', color: foundColor ? foundColor : '#292524', borderRadius: '2px' }}
                      onMouseDown={() => handleCellMouseDown(r, c)} onMouseEnter={() => handleCellMouseEnter(r, c)} onTouchStart={() => handleTouchStart(r, c)}>
                      {letter}
                    </div>
                  );
                }))}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {words.map((w) => {
                  const isFound = foundWords.includes(w);
                  return <span key={w} className={'text-sm font-medium px-2 py-0.5 rounded ' + (isFound ? 'line-through text-ink-secondary bg-stone-200' : 'text-ink bg-ela-light')}>{w}</span>;
                })}
              </div>
              <div className="text-xs text-ink-secondary">
                Found {foundWords.length} of {words.length} words
                {foundWords.length === words.length && words.length > 0 && <span className="text-green-600 font-semibold ml-1">- All found!</span>}
              </div>
              <button onClick={() => {
                if (!placements.length) return;
                const nextFound = [...foundWords];
                for (const p of placements) { if (!nextFound.includes(p.word)) nextFound.push(p.word); }
                update({ foundWords: nextFound });
              }} className="px-3 py-1 text-xs bg-stone-700 text-white rounded hover:opacity-90 self-start">Reveal All</button>
            </>
          ) : <div className="text-sm text-ink-secondary italic">No puzzle generated yet.</div>}
        </div>
      )}
    </div>
  );
}
