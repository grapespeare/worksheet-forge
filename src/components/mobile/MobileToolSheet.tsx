import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import type { ToolType } from '@/components/editor/Toolbar';
import type { ElementType } from '@/types/worksheet';
import {
  MousePointer2,
  Type,
  Heading1,
  HelpCircle,
  ListChecks,
  TextCursorInput,
  Minus,
  Table,
  Image,
  Shapes,
  Axis3D,
  Grid3X3,
  AlignJustify,
  SquareFunction,
  BookOpen,
  BookMarked,
  Map,
  UserCircle,
  GitCompare,
  Eye,
  Pencil,
  Grid2x2,
  Palette,
  ScrollText,
  LayoutGrid,
  Search,
  PenLine,
  GridIcon,
  Layers,
  Puzzle,
  GraduationCap,
  Paintbrush,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileToolSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
}

interface ToolDef {
  type: ToolType;
  icon: React.ElementType;
  label: string;
}

interface ToolCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  tools: ToolDef[];
}

const CATEGORIES: ToolCategory[] = [
  {
    id: 'basic',
    name: 'Basic',
    icon: Layers,
    tools: [
      { type: 'select', icon: MousePointer2, label: 'Select' },
      { type: 'text', icon: Type, label: 'Text' },
      { type: 'heading', icon: Heading1, label: 'Heading' },
      { type: 'divider', icon: Minus, label: 'Divider' },
      { type: 'imagePlaceholder', icon: Image, label: 'Image' },
    ],
  },
  {
    id: 'questions',
    name: 'Questions',
    icon: HelpCircle,
    tools: [
      { type: 'questionBox', icon: HelpCircle, label: 'Question Box' },
      { type: 'multipleChoice', icon: ListChecks, label: 'Multiple Choice' },
      { type: 'fillInBlank', icon: TextCursorInput, label: 'Fill-in-Blank' },
    ],
  },
  {
    id: 'ela',
    name: 'ELA',
    icon: BookOpen,
    tools: [
      { type: 'readingPassage', icon: BookOpen, label: 'Reading Passage' },
      { type: 'vocabularyBox', icon: BookMarked, label: 'Vocabulary' },
      { type: 'storyMap', icon: Map, label: 'Story Map' },
      { type: 'characterAnalysis', icon: UserCircle, label: 'Character Analysis' },
      { type: 'compareContrast', icon: GitCompare, label: 'Compare/Contrast' },
    ],
  },
  {
    id: 'art',
    name: 'Art',
    icon: Palette,
    tools: [
      { type: 'artCritique', icon: Eye, label: 'Art Critique' },
      { type: 'drawingPrompt', icon: Pencil, label: 'Drawing Prompt' },
      { type: 'techniqueGrid', icon: Grid2x2, label: 'Technique Grid' },
      { type: 'colorStudy', icon: Palette, label: 'Color Study' },
    ],
  },
  {
    id: 'games',
    name: 'Games',
    icon: Puzzle,
    tools: [
      { type: 'blackoutPoetry', icon: PenLine, label: 'Blackout Poetry' },
      { type: 'wordSearch', icon: Search, label: 'Word Search' },
      { type: 'crossword', icon: GridIcon, label: 'Crossword' },
      { type: 'flashcards', icon: Layers, label: 'Flashcards' },
      { type: 'bingo', icon: Grid3X3, label: 'Bingo' },
      { type: 'madLibs', icon: ScrollText, label: 'Mad Libs' },
      { type: 'matching', icon: LayoutGrid, label: 'Matching' },
    ],
  },
  {
    id: 'math',
    name: 'Math & Layout',
    icon: GraduationCap,
    tools: [
      { type: 'table', icon: Table, label: 'Table' },
      { type: 'diagram', icon: Shapes, label: 'Shape' },
      { type: 'numberLine', icon: Axis3D, label: 'Number Line' },
      { type: 'graphPaper', icon: Grid3X3, label: 'Graph Paper' },
      { type: 'handwritingLines', icon: AlignJustify, label: 'Handwriting' },
      { type: 'equation', icon: SquareFunction, label: 'Equation' },
    ],
  },
];

export default function MobileToolSheet({ open, onOpenChange, activeTool, onToolSelect }: MobileToolSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('basic');

  const filteredCategories = searchQuery.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        tools: cat.tools.filter((t) =>
          t.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.tools.length > 0)
    : CATEGORIES;

  const currentCategory = filteredCategories.find((c) => c.id === activeCategory) || filteredCategories[0];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[70vh] flex flex-col">
        <DrawerHeader className="pb-2 shrink-0">
          <DrawerTitle className="text-lg font-semibold">Tools</DrawerTitle>
        </DrawerHeader>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" strokeWidth={1.5} />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-ink-tertiary" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs - horizontal scroll */}
        {!searchQuery && (
          <div className="px-4 pb-3 shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-1.5">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                      isActive
                        ? 'bg-accent text-white'
                        : 'bg-canvas-dark text-ink-secondary active:bg-border-medium'
                    )}
                  >
                    <CatIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tool grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: 'thin' }}>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-ink-tertiary text-sm">
              No tools match your search
            </div>
          ) : (
            <div className="space-y-5">
              {filteredCategories.map((cat) => {
                // When not searching, only show the active category
                if (!searchQuery && cat.id !== activeCategory) return null;

                return (
                  <div key={cat.id}>
                    <h3 className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                      {cat.name}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {cat.tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activeTool === tool.type;
                        return (
                          <button
                            key={tool.type}
                            onClick={() => {
                              onToolSelect(tool.type);
                              onOpenChange(false);
                            }}
                            className={cn(
                              'flex flex-col items-center justify-center gap-1 rounded-xl py-3 px-1 transition-all active:scale-95',
                              isActive
                                ? 'bg-accent-light border-2 border-accent'
                                : 'bg-canvas-dark border-2 border-transparent active:bg-border-medium'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-6 h-6',
                                isActive ? 'text-accent' : 'text-ink-secondary'
                              )}
                              strokeWidth={1.5}
                            />
                            <span
                              className={cn(
                                'text-[10px] font-medium leading-tight text-center',
                                isActive ? 'text-accent' : 'text-ink-secondary'
                              )}
                            >
                              {tool.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
