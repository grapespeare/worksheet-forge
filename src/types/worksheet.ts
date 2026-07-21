export type ElementType =
  | 'text'
  | 'heading'
  | 'questionBox'
  | 'multipleChoice'
  | 'fillInBlank'
  | 'divider'
  | 'table'
  | 'imagePlaceholder'
  | 'diagram'
  | 'numberLine'
  | 'graphPaper'
  | 'handwritingLines'
  | 'equation'
  | 'readingPassage'
  | 'vocabularyBox'
  | 'storyMap'
  | 'characterAnalysis'
  | 'compareContrast'
  | 'artCritique'
  | 'drawingPrompt'
  | 'techniqueGrid'
  | 'colorStudy'
  | 'blackoutPoetry'
  | 'wordSearch'
  | 'crossword'
  | 'flashcards'
  | 'bingo'
  | 'madLibs'
  | 'matching';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  opacity?: number;
  groupId?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 400 | 700;
  color?: string;
  backgroundColor?: string;
  border?: boolean;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface HeadingElement extends BaseElement {
  type: 'heading';
  content: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  border?: boolean;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface QuestionBoxElement extends BaseElement {
  type: 'questionBox';
  question: string;
  answerLines?: number;
  autoNumber?: boolean;
  number?: number;
  lineSpacing?: 'single' | '1.5' | 'double';
  fontFamily?: string;
}

export interface MultipleChoiceElement extends BaseElement {
  type: 'multipleChoice';
  question: string;
  options: string[];
  correctAnswer?: number;
}

export interface FillInBlankElement extends BaseElement {
  type: 'fillInBlank';
  sentence: string;
  blanks: string[];
}

export interface DividerElement extends BaseElement {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  thickness?: number;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  cellData?: string[][];
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderColor?: string;
  headerBg?: string;
  cellPadding?: number;
}

export interface ImagePlaceholderElement extends BaseElement {
  type: 'imagePlaceholder';
  imageUrl?: string;
  maintainAspectRatio?: boolean;
}

export interface DiagramElement extends BaseElement {
  type: 'diagram';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line';
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  fill?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface NumberLineElement extends BaseElement {
  type: 'numberLine';
  min: number;
  max: number;
  step: number;
  showLabels: boolean;
  labelInterval: number;
}

export interface GraphPaperElement extends BaseElement {
  type: 'graphPaper';
  gridDensity: number;
  showAxes: boolean;
  showAxisLabels: boolean;
}

export interface HandwritingLinesElement extends BaseElement {
  type: 'handwritingLines';
  lineSets: number;
  lineSpacing: number;
  lineColor?: string;
}

export interface EquationElement extends BaseElement {
  type: 'equation';
  latex: string;
  fontSize?: number;
}

/* -- New ELA Element Types -- */

export interface ReadingPassageElement extends BaseElement {
  type: 'readingPassage';
  title: string;
  author?: string;
  content: string;
  showLineNumbers: boolean;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  columns?: number;
}

export interface VocabularyBoxElement extends BaseElement {
  type: 'vocabularyBox';
  word: string;
  definitionLines: number;
  sentenceFrame: string;
  partOfSpeech?: string;
}

export interface StoryMapElement extends BaseElement {
  type: 'storyMap';
  title: string;
  showExposition: boolean;
  showRisingAction: boolean;
  showClimax: boolean;
  showFallingAction: boolean;
  showResolution: boolean;
  showCharacters: boolean;
  showSetting: boolean;
  showTheme: boolean;
  showConflict: boolean;
}

export interface CharacterAnalysisElement extends BaseElement {
  type: 'characterAnalysis';
  characterName: string;
  traits: { trait: string; evidence: string }[];
  appearance?: string;
  personality?: string;
  motivation?: string;
}

export interface CompareContrastElement extends BaseElement {
  type: 'compareContrast';
  topicA: string;
  topicB: string;
  aOnly: string[];
  bOnly: string[];
  both: string[];
  style: 'venn' | 'tchart';
}

/* -- New Art Element Types -- */

export interface ArtCritiqueElement extends BaseElement {
  type: 'artCritique';
  artworkTitle: string;
  artistName: string;
  describePrompts: string[];
  analyzePrompts: string[];
  interpretPrompts: string[];
  judgePrompts: string[];
}

export interface DrawingPromptElement extends BaseElement {
  type: 'drawingPrompt';
  prompt: string;
  drawingAreaHeight: number;
  guidelines: string[];
}

export interface TechniqueGridElement extends BaseElement {
  type: 'techniqueGrid';
  rows: number;
  cols: number;
  techniqueLabels: string[];
  practiceAreas: string[];
}

export interface ColorStudyElement extends BaseElement {
  type: 'colorStudy';
  title: string;
  colorBoxes: { color: string; label: string; mixingNotes: string }[];
  showColorWheel: boolean;
  showMixingArea: boolean;
}

export interface BlackoutPoetryElement extends BaseElement {
  type: 'blackoutPoetry';
  sourceText: string;
  keptWords: number[];
  blackoutStyle: 'solid' | 'scribble' | 'highlight' | 'pattern' | 'fade';
  suggestions?: string[];
  title?: string;
  authorName?: string;
}

export interface WordPlacement {
  word: string;
  row: number;
  col: number;
  direction: string;
}

export interface WordSearchElement extends BaseElement {
  type: 'wordSearch';
  words: string[];
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'hard';
  grid?: string[][];
  placements?: WordPlacement[];
  foundWords?: string[];
  title?: string;
}

export interface Clue {
  number: number;
  clue: string;
  answer: string;
}

export interface CrosswordElement extends BaseElement {
  type: 'crossword';
  words: { word: string; clue: string }[];
  gridSize: number;
  grid?: (string | null)[][];
  numbers?: Record<string, number>;
  acrossClues?: Clue[];
  downClues?: Clue[];
  userAnswers?: Record<string, string>;
  title?: string;
}

export interface FlashcardsElement extends BaseElement {
  type: 'flashcards';
  cards: { front: string; back: string; id: string }[];
  title?: string;
  studyMode?: boolean;
  currentIndex?: number;
  knownCards?: string[];
  shuffle?: boolean;
}

export interface BingoCard {
  id: string;
  grid: string[];
}

export interface BingoElement extends BaseElement {
  type: 'bingo';
  items: string[];
  title?: string;
  freeSpaceText?: string;
  cardCount?: number;
  calledItems?: string[];
  markedCards?: Record<string, string[]>;
  currentCardIndex?: number;
  generatedCards?: BingoCard[];
}

export interface MadLibsPrompt {
  placeholder: string;
  label: string;
  hint?: string;
  value?: string;
}

export interface MadLibsElement extends BaseElement {
  type: 'madLibs';
  title?: string;
  instruction?: string;
  storyTemplate: string;
  prompts: MadLibsPrompt[];
  completedStory?: string;
  isRevealed?: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingItem {
  id: string;
  text: string;
  pairId: string;
}

export interface MatchingElement extends BaseElement {
  type: 'matching';
  title?: string;
  instruction?: string;
  pairs: MatchingPair[];
  leftItems?: MatchingItem[];
  rightItems?: MatchingItem[];
  selectedLeft?: string | null;
  selectedRight?: string | null;
  matchedPairs?: string[];
  mismatchedPair?: string | null;
  shuffle?: boolean;
}

export type WorksheetElement =
  | TextElement
  | HeadingElement
  | QuestionBoxElement
  | MultipleChoiceElement
  | FillInBlankElement
  | DividerElement
  | TableElement
  | ImagePlaceholderElement
  | DiagramElement
  | NumberLineElement
  | GraphPaperElement
  | HandwritingLinesElement
  | EquationElement
  | ReadingPassageElement
  | VocabularyBoxElement
  | StoryMapElement
  | CharacterAnalysisElement
  | CompareContrastElement
  | ArtCritiqueElement
  | DrawingPromptElement
  | TechniqueGridElement
  | ColorStudyElement
  | BlackoutPoetryElement
  | WordSearchElement
  | CrosswordElement
  | FlashcardsElement
  | BingoElement
  | MadLibsElement
  | MatchingElement;

/* -- Section Types (Lesson View) -- */

export type SectionBlueprint =
  | 'hook'
  | 'directInstruction'
  | 'guidedPractice'
  | 'independentPractice'
  | 'exitTicket'
  | 'custom';

export interface SectionBlueprintConfig {
  type: SectionBlueprint;
  defaultTitle: string;
  defaultTime: number;
  suggestedElementTypes: ElementType[];
}

export interface WorksheetSection {
  id: string;
  title: string;
  timeEstimate?: number; // minutes
  elements: WorksheetElement[];
  isCollapsed?: boolean;
}

export interface WorksheetPage {
  // New: sections-based layout (Lesson View)
  sections?: WorksheetSection[];
  // Legacy: flat elements array (Page View) -- kept for backward compatibility
  elements?: WorksheetElement[];
}

export interface Worksheet {
  id: string;
  title: string;
  pages: WorksheetPage[];
  orientation: 'portrait' | 'landscape';
  pageSize: 'letter' | 'a4' | 'legal' | 'tabloid';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageBackground?: 'blank' | 'lined' | 'graph' | 'dot' | 'story' | 'manuscript';
  columns?: number;
  columnGap?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'Blank' | 'Math' | 'ELA' | 'Science' | 'Social Studies' | 'Art' | 'Music' | 'PE' | 'Library' | 'SEL' | 'CKH' | 'Organization' | 'Back to School' | 'General';
  description: string;
  elementCount: number;
  preview: string;
}
