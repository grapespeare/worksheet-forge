import type { WordPlacement } from '@/types/worksheet';

export interface WordSearchResult {
  grid: string[][];
  placements: WordPlacement[];
}

const COMMON_LETTERS = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function weightedRandomLetter(): string {
  const r = Math.random() * 100;
  if (r < 45) return COMMON_LETTERS[Math.floor(Math.random() * 12)];
  if (r < 75) return COMMON_LETTERS[12 + Math.floor(Math.random() * 8)];
  return ALL_LETTERS[Math.floor(Math.random() * 26)];
}

function getDirections(difficulty: string): Array<[number, number, string]> {
  switch (difficulty) {
    case 'easy':
      return [
        [0, 1, 'E'],
        [1, 0, 'S'],
      ];
    case 'medium':
      return [
        [0, 1, 'E'],
        [0, -1, 'W'],
        [1, 0, 'S'],
        [-1, 0, 'N'],
        [1, 1, 'SE'],
        [-1, 1, 'NE'],
      ];
    case 'hard':
    default:
      return [
        [0, 1, 'E'],
        [0, -1, 'W'],
        [1, 0, 'S'],
        [-1, 0, 'N'],
        [1, 1, 'SE'],
        [1, -1, 'SW'],
        [-1, 1, 'NE'],
        [-1, -1, 'NW'],
      ];
  }
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  gridSize: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dRow * i;
    const c = col + dCol * i;
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
    const cell = grid[r][c];
    if (cell !== '' && cell !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
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

export function generateWordSearch(
  words: string[],
  gridSize: number,
  difficulty: string
): WordSearchResult {
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill('')
  );
  const placements: WordPlacement[] = [];

  const sortedWords = [...words]
    .map((w) => w.toUpperCase().trim())
    .filter((w) => w.length > 0)
    .sort((a, b) => b.length - a.length);

  const directions = getDirections(difficulty);

  for (const word of sortedWords) {
    if (word.length > gridSize) continue;
    let placed = false;
    const shuffledDirections = shuffleArray(directions);

    for (const [dRow, dCol, dir] of shuffledDirections) {
      if (placed) break;
      const maxRow =
        dRow === 1
          ? gridSize - word.length
          : dRow === -1
            ? word.length - 1
            : gridSize - 1;
      const minRow = dRow === -1 ? word.length - 1 : 0;
      const maxCol =
        dCol === 1
          ? gridSize - word.length
          : dCol === -1
            ? word.length - 1
            : gridSize - 1;
      const minCol = dCol === -1 ? word.length - 1 : 0;

      const possiblePositions: Array<[number, number]> = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          possiblePositions.push([r, c]);
        }
      }

      const shuffledPositions = shuffleArray(possiblePositions);
      let attempts = 0;
      for (const [r, c] of shuffledPositions) {
        if (attempts >= 100) break;
        if (canPlaceWord(grid, word, r, c, dRow, dCol, gridSize)) {
          placeWord(grid, word, r, c, dRow, dCol);
          placements.push({ word, row: r, col: c, direction: dir });
          placed = true;
          break;
        }
        attempts++;
      }
    }
  }

  // Fill remaining empty cells
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = weightedRandomLetter();
      }
    }
  }

  return { grid, placements };
}
