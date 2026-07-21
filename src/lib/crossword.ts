import type { Clue } from '@/types/worksheet';

export interface CrosswordResult {
  grid: (string | null)[][];
  numbers: Record<string, number>;
  acrossClues: Clue[];
  downClues: Clue[];
}

interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

function createEmptyGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function cloneGrid(grid: (string | null)[][]): (string | null)[][] {
  return grid.map((row) => [...row]);
}

function canPlaceAt(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  _size: number
): boolean {
  let hasIntersection = false;

  for (let i = 0; i < word.length; i++) {
    const r = row + dRow * i;
    const c = col + dCol * i;

    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;

    const cell = grid[r][c];
    if (cell !== null) {
      if (cell === word[i]) {
        hasIntersection = true;
      } else {
        return false;
      }
    }
  }

  // For the first word, allow no intersection
  // For subsequent words, require at least one intersection
  const isFirstWord = grid.every((row) => row.every((cell) => cell === null));
  if (!isFirstWord && !hasIntersection) return false;

  return true;
}

function placeWordOnGrid(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dRow: number,
  dCol: number
): void {
  for (let i = 0; i < word.length; i++) {
    const r = row + dRow * i;
    const c = col + dCol * i;
    grid[r][c] = word[i];
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateCrossword(
  words: { word: string; clue: string }[],
  gridSize: number
): CrosswordResult {
  const sorted = [...words]
    .filter((w) => w.word.length > 0)
    .sort((a, b) => b.word.length - a.word.length);

  if (sorted.length === 0) {
    return {
      grid: createEmptyGrid(gridSize),
      numbers: {},
      acrossClues: [],
      downClues: [],
    };
  }

  let bestGrid = createEmptyGrid(gridSize);
  let bestPlaced: PlacedWord[] = [];

  const firstWord = sorted[0];
  const startCol = Math.floor((gridSize - firstWord.word.length) / 2);
  const startRow = Math.floor(gridSize / 2);

  placeWordOnGrid(bestGrid, firstWord.word.toUpperCase(), startRow, startCol, 0, 1);
  bestPlaced.push({
    word: firstWord.word.toUpperCase(),
    clue: firstWord.clue,
    row: startRow,
    col: startCol,
    direction: 'across',
  });

  const remaining = sorted.slice(1);

  for (const { word, clue } of remaining) {
    const upperWord = word.toUpperCase();
    let placed = false;

    const directions: Array<'across' | 'down'> = ['across', 'down'];
    const shuffledDirs = shuffleArray(directions);

    for (const dir of shuffledDirs) {
      if (placed) break;
      const dRow = dir === 'across' ? 0 : 1;
      const dCol = dir === 'across' ? 1 : 0;

      const candidates: Array<[number, number]> = [];
      for (let r = 0; r < gridSize && candidates.length < 50; r++) {
        for (let c = 0; c < gridSize && candidates.length < 50; c++) {
          if (canPlaceAt(bestGrid, upperWord, r, c, dRow, dCol, gridSize)) {
            candidates.push([r, c]);
          }
        }
      }

      const shuffled = shuffleArray(candidates);
      for (const [r, c] of shuffled.slice(0, 30)) {
        const testGrid = cloneGrid(bestGrid);
        placeWordOnGrid(testGrid, upperWord, r, c, dRow, dCol);
        bestGrid = testGrid;
        bestPlaced.push({ word: upperWord, clue, row: r, col: c, direction: dir });
        placed = true;
        break;
      }
    }
  }

  // Auto-number cells
  const numbers: Record<string, number> = {};
  let nextNum = 1;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (bestGrid[r][c] === null) continue;

      const isStartOfAcross =
        c === 0 || bestGrid[r][c - 1] === null;
      const canExtendAcross =
        c + 1 < gridSize && bestGrid[r][c + 1] !== null;

      const isStartOfDown =
        r === 0 || bestGrid[r - 1]?.[c] === null;
      const canExtendDown =
        r + 1 < gridSize && bestGrid[r + 1]?.[c] !== null;

      const key = `${r},${c}`;
      if (
        (isStartOfAcross && canExtendAcross) ||
        (isStartOfDown && canExtendDown)
      ) {
        numbers[key] = nextNum++;
      }
    }
  }

  // Build clue lists
  const acrossClues: Clue[] = [];
  const downClues: Clue[] = [];

  for (const pw of bestPlaced) {
    const key = `${pw.row},${pw.col}`;
    const num = numbers[key];
    if (num === undefined) continue;

    const clueEntry: Clue = { number: num, clue: pw.clue, answer: pw.word };
    if (pw.direction === 'across') {
      acrossClues.push(clueEntry);
    } else {
      downClues.push(clueEntry);
    }
  }

  // Sort by clue number
  acrossClues.sort((a, b) => a.number - b.number);
  downClues.sort((a, b) => a.number - b.number);

  // Remove duplicates (same number appearing in both lists means one is the "start")
  const seenAcross = new Set<number>();
  const uniqueAcross = acrossClues.filter((c) => {
    if (seenAcross.has(c.number)) return false;
    seenAcross.add(c.number);
    return true;
  });

  const seenDown = new Set<number>();
  const uniqueDown = downClues.filter((c) => {
    if (seenDown.has(c.number)) return false;
    seenDown.add(c.number);
    return true;
  });

  return {
    grid: bestGrid,
    numbers,
    acrossClues: uniqueAcross,
    downClues: uniqueDown,
  };
}
