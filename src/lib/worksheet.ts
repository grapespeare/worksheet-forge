import type { Worksheet, WorksheetElement, ElementType, WorksheetSection, WorksheetPage, SectionBlueprint, SectionBlueprintConfig } from '@/types/worksheet';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function createBlankWorksheet(): Worksheet {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: 'Untitled Worksheet',
    pages: [{ elements: [] }],
    orientation: 'portrait',
    pageSize: 'letter',
    margins: { top: 72, right: 72, bottom: 72, left: 72 },
    pageBackground: 'blank',
    columns: 1,
    columnGap: 24,
    createdAt: now,
    updatedAt: now,
  };
}

export const SECTION_BLUEPRINTS: Record<SectionBlueprint, SectionBlueprintConfig> = {
  hook: {
    type: 'hook',
    defaultTitle: 'Do Now / Warm-up',
    defaultTime: 5,
    suggestedElementTypes: ['heading', 'questionBox', 'fillInBlank', 'multipleChoice', 'text'],
  },
  directInstruction: {
    type: 'directInstruction',
    defaultTitle: 'I Do / Mini-lesson',
    defaultTime: 10,
    suggestedElementTypes: ['heading', 'text', 'equation', 'diagram', 'readingPassage'],
  },
  guidedPractice: {
    type: 'guidedPractice',
    defaultTitle: 'We Do / Partner Work',
    defaultTime: 10,
    suggestedElementTypes: ['heading', 'questionBox', 'multipleChoice', 'table', 'compareContrast'],
  },
  independentPractice: {
    type: 'independentPractice',
    defaultTitle: 'You Do / Independent Practice',
    defaultTime: 15,
    suggestedElementTypes: ['heading', 'questionBox', 'multipleChoice', 'fillInBlank', 'vocabularyBox', 'storyMap'],
  },
  exitTicket: {
    type: 'exitTicket',
    defaultTitle: 'Exit Ticket / Closure',
    defaultTime: 5,
    suggestedElementTypes: ['heading', 'questionBox', 'fillInBlank', 'text'],
  },
  custom: {
    type: 'custom',
    defaultTitle: 'New Section',
    defaultTime: 10,
    suggestedElementTypes: ['heading', 'text', 'questionBox', 'multipleChoice', 'divider'],
  },
};

export function createSectionFromBlueprint(blueprint: SectionBlueprint): WorksheetSection {
  const config = SECTION_BLUEPRINTS[blueprint];
  return {
    id: generateId(),
    title: config.defaultTitle,
    timeEstimate: config.defaultTime,
    elements: [],
    isCollapsed: false,
  };
}

export function createEmptySection(title = 'New Section'): WorksheetSection {
  return {
    id: generateId(),
    title,
    timeEstimate: 10,
    elements: [],
    isCollapsed: false,
  };
}

/**
 * Ensure a page has sections. For backward compatibility:
 * - If page has `sections`, return as-is.
 * - If page only has legacy `elements`, wrap them in a single "Main Content" section.
 */
export function ensureSections(page: WorksheetPage): WorksheetSection[] {
  if (page.sections && page.sections.length > 0) {
    return page.sections;
  }
  // Backward compatibility: wrap legacy flat elements into one section
  return [
    {
      id: generateId(),
      title: 'Main Content',
      elements: page.elements || [],
      isCollapsed: false,
    },
  ];
}

/**
 * Convert a page from legacy elements-only to sections format.
 */
export function migratePageToSections(page: WorksheetPage): WorksheetPage {
  if (page.sections && page.sections.length > 0) {
    return page;
  }
  return {
    ...page,
    sections: ensureSections(page),
    elements: undefined,
  };
}

/**
 * Get all elements from a page (flattened across sections).
 * Used for Page/Canvas view when rendering a section-based worksheet.
 */
export function getAllElementsFromPage(page: WorksheetPage): WorksheetElement[] {
  if (page.sections && page.sections.length > 0) {
    return page.sections.flatMap((s) => s.elements);
  }
  return page.elements || [];
}

export function createDefaultElement(type: ElementType, x: number, y: number): WorksheetElement {
  const id = generateId();
  const zIndex = 0;

  switch (type) {
    case 'text':
      return {
        id, type: 'text', x, y, width: 200, height: 80, zIndex,
        content: 'Enter text here',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 400,
        color: '#292524',
        lineHeight: 1.5,
        textAlign: 'left',
      };

    case 'heading':
      return {
        id, type: 'heading', x, y, width: 300, height: 48, zIndex,
        content: 'Heading',
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#292524',
        lineHeight: 1.3,
        textAlign: 'left',
      };

    case 'questionBox':
      return {
        id, type: 'questionBox', x, y, width: 400, height: 120, zIndex,
        question: 'Question text',
        answerLines: 3,
        autoNumber: true,
        lineSpacing: 'single',
        fontFamily: 'Inter',
      };

    case 'multipleChoice':
      return {
        id, type: 'multipleChoice', x, y, width: 400, height: 160, zIndex,
        question: 'Multiple choice question',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
      };

    case 'fillInBlank':
      return {
        id, type: 'fillInBlank', x, y, width: 400, height: 60, zIndex,
        sentence: 'The [blank] walked to the [blank].',
        blanks: ['cat', 'store'],
      };

    case 'divider':
      return {
        id, type: 'divider', x, y, width: 400, height: 2, zIndex,
        style: 'solid',
        color: '#D6D3CC',
        thickness: 1,
      };

    case 'table':
      return {
        id, type: 'table', x, y, width: 400, height: 200, zIndex,
        rows: 4,
        cols: 3,
        cellData: Array(4).fill(null).map(() => Array(3).fill('')),
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#D6D3CC',
        cellPadding: 8,
      };

    case 'imagePlaceholder':
      return {
        id, type: 'imagePlaceholder', x, y, width: 200, height: 200, zIndex,
        maintainAspectRatio: true,
      };

    case 'diagram':
      return {
        id, type: 'diagram', x, y, width: 200, height: 200, zIndex,
        shapeType: 'rectangle',
        strokeColor: '#292524',
        strokeWidth: 1,
        fill: false,
        fillColor: '#F0EBE0',
        lineStyle: 'solid',
      };

    case 'numberLine':
      return {
        id, type: 'numberLine', x, y, width: 400, height: 100, zIndex,
        min: 0,
        max: 10,
        step: 1,
        showLabels: true,
        labelInterval: 1,
      };

    case 'graphPaper':
      return {
        id, type: 'graphPaper', x, y, width: 300, height: 300, zIndex,
        gridDensity: 20,
        showAxes: true,
        showAxisLabels: false,
      };

    case 'handwritingLines':
      return {
        id, type: 'handwritingLines', x, y, width: 400, height: 120, zIndex,
        lineSets: 4,
        lineSpacing: 30,
        lineColor: '#A8A29E',
      };

    case 'equation':
      return {
        id, type: 'equation', x, y, width: 300, height: 60, zIndex,
        latex: 'x^2 + y^2 = r^2',
        fontSize: 18,
      };

    /* -- ELA Elements -- */

    case 'readingPassage':
      return {
        id, type: 'readingPassage', x, y, width: 500, height: 300, zIndex,
        title: 'Reading Passage',
        author: '',
        content: 'Enter the reading passage text here...',
        showLineNumbers: false,
        fontFamily: 'Inter',
        fontSize: 12,
        lineHeight: 1.6,
        columns: 1,
      };

    case 'vocabularyBox':
      return {
        id, type: 'vocabularyBox', x, y, width: 350, height: 140, zIndex,
        word: 'Vocabulary Word',
        partOfSpeech: 'noun',
        definitionLines: 2,
        sentenceFrame: 'The _______ helped me understand...',
      };

    case 'storyMap':
      return {
        id, type: 'storyMap', x, y, width: 500, height: 350, zIndex,
        title: 'Story Map',
        showExposition: true,
        showRisingAction: true,
        showClimax: true,
        showFallingAction: true,
        showResolution: true,
        showCharacters: true,
        showSetting: true,
        showTheme: false,
        showConflict: true,
      };

    case 'characterAnalysis':
      return {
        id, type: 'characterAnalysis', x, y, width: 450, height: 300, zIndex,
        characterName: 'Character Name',
        traits: [
          { trait: 'Trait 1', evidence: 'Evidence from text...' },
          { trait: 'Trait 2', evidence: 'Evidence from text...' },
        ],
        appearance: '',
        personality: '',
        motivation: '',
      };

    case 'compareContrast':
      return {
        id, type: 'compareContrast', x, y, width: 450, height: 280, zIndex,
        topicA: 'Topic A',
        topicB: 'Topic B',
        aOnly: ['', ''],
        bOnly: ['', ''],
        both: ['', ''],
        style: 'venn',
      };

    /* -- Art Elements -- */

    case 'artCritique':
      return {
        id, type: 'artCritique', x, y, width: 500, height: 400, zIndex,
        artworkTitle: 'Artwork Title',
        artistName: 'Artist Name',
        describePrompts: ['What do you see? List the objects, people, and details.'],
        analyzePrompts: ['How did the artist create this? What techniques were used?'],
        interpretPrompts: ['What is the artist trying to communicate?'],
        judgePrompts: ['Is this a successful work of art? Why or why not?'],
      };

    case 'drawingPrompt':
      return {
        id, type: 'drawingPrompt', x, y, width: 400, height: 350, zIndex,
        prompt: 'Draw a picture of your favorite place.',
        drawingAreaHeight: 200,
        guidelines: ['Include details', 'Use shading', 'Add texture'],
      };

    case 'techniqueGrid':
      return {
        id, type: 'techniqueGrid', x, y, width: 400, height: 300, zIndex,
        rows: 2,
        cols: 3,
        techniqueLabels: ['Hatching', 'Cross-Hatching', 'Stippling', 'Blending', 'Scumbling', 'Layering'],
        practiceAreas: ['', '', '', '', '', ''],
      };

    case 'colorStudy':
      return {
        id, type: 'colorStudy', x, y, width: 400, height: 300, zIndex,
        title: 'Color Study',
        colorBoxes: [
          { color: '#EF4444', label: 'Primary Red', mixingNotes: '' },
          { color: '#3B82F6', label: 'Primary Blue', mixingNotes: '' },
          { color: '#EAB308', label: 'Primary Yellow', mixingNotes: '' },
          { color: '#22C55E', label: 'Green Mix', mixingNotes: 'Blue + Yellow' },
          { color: '#A855F7', label: 'Purple Mix', mixingNotes: 'Red + Blue' },
          { color: '#F97316', label: 'Orange Mix', mixingNotes: 'Red + Yellow' },
        ],
        showColorWheel: true,
        showMixingArea: true,
      };

    case 'wordSearch':
      return {
        id, type: 'wordSearch', x, y, width: 400, height: 400, zIndex,
        words: ['REACT', 'PUZZLE', 'WORD', 'FIND'],
        gridSize: 10,
        difficulty: 'medium' as const,
        title: 'Word Search',
      };

    case 'crossword':
      return {
        id, type: 'crossword', x, y, width: 500, height: 500, zIndex,
        words: [
          { word: 'REACT', clue: 'A JavaScript library for building UIs' },
          { word: 'CODE', clue: 'What programmers write' },
          { word: 'WEB', clue: 'A spider makes this' },
          { word: 'APP', clue: 'Short for application' },
        ],
        gridSize: 10,
        title: 'Crossword Puzzle',
      };

    /* -- Game / Interactive Elements -- */

    case 'madLibs':
      return {
        id, type: 'madLibs', x, y, width: 500, height: 400, zIndex,
        title: 'My Silly Story',
        instruction: 'Fill in the blanks below, then read your silly story!',
        storyTemplate: 'Once upon a time, a {{adjective:1}} {{noun:1}} decided to {{verb:1}} all the way to {{place:1}}. Along the way, they met a {{adjective:2}} {{noun:2}} who was {{verb:2}} {{adverb:1}}.',
        prompts: [
          { placeholder: '{{adjective:1}}', label: 'Adjective (describing word)', hint: 'fuzzy, enormous, sparkly' },
          { placeholder: '{{noun:1}}', label: 'Noun (animal or creature)', hint: 'dragon, penguin, unicorn' },
          { placeholder: '{{verb:1}}', label: 'Verb (action word)', hint: 'dance, zoom, wiggle' },
          { placeholder: '{{place:1}}', label: 'Place', hint: 'the moon, a pizza shop, jungle' },
          { placeholder: '{{adjective:2}}', label: 'Another Adjective', hint: 'grumpy, shiny, bouncy' },
          { placeholder: '{{noun:2}}', label: 'Another Noun (person or animal)', hint: 'wizard, kitten, robot' },
          { placeholder: '{{verb:2}}', label: 'Another Verb (past tense)', hint: 'juggling, tap-dancing, napping' },
          { placeholder: '{{adverb:1}}', label: 'Adverb (how something is done)', hint: 'wildly, backwards, gracefully' },
        ],
        isRevealed: false,
      };

    case 'matching':
      return {
        id, type: 'matching', x, y, width: 500, height: 400, zIndex,
        title: 'Match the Pairs!',
        instruction: 'Match each item on the left with its pair on the right!',
        pairs: [
          { id: 'pair-1', left: 'The cat', right: 'meowed' },
          { id: 'pair-2', left: 'The dog', right: 'barked' },
          { id: 'pair-3', left: 'The bird', right: 'chirped' },
          { id: 'pair-4', left: 'The cow', right: 'mooed' },
        ],
        shuffle: true,
        matchedPairs: [],
        selectedLeft: null,
        selectedRight: null,
        mismatchedPair: null,
      };

    default:
      return {
        id, type: 'text', x, y, width: 200, height: 80, zIndex,
        content: '',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 400,
        color: '#292524',
      };
  }
}

export function duplicateElement(element: WorksheetElement): WorksheetElement {
  return {
    ...element,
    id: generateId(),
    x: element.x + 20,
    y: element.y + 20,
  };
}

export function getPageDimensions(worksheet: Worksheet): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    letter: { width: 612, height: 792 },
    a4: { width: 595, height: 842 },
    legal: { width: 612, height: 1008 },
    tabloid: { width: 792, height: 1224 },
  };
  const size = sizes[worksheet.pageSize] || sizes.letter;
  if (worksheet.orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }
  return size;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
