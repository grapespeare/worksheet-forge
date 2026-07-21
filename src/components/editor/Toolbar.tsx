import { useState } from 'react';
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
} from 'lucide-react';
import type { ElementType } from '@/types/worksheet';

export type ToolType = ElementType | 'select';

const TOOL_GROUPS: { tools: { type: ToolType; icon: React.ElementType; label: string; shortcut: string }[] }[] = [
  {
    tools: [
      { type: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
      { type: 'text', icon: Type, label: 'Text', shortcut: 'T' },
      { type: 'heading', icon: Heading1, label: 'Heading', shortcut: 'H' },
    ],
  },
  {
    tools: [
      { type: 'questionBox', icon: HelpCircle, label: 'Question', shortcut: 'Q' },
      { type: 'multipleChoice', icon: ListChecks, label: 'Multiple Choice', shortcut: 'M' },
      { type: 'fillInBlank', icon: TextCursorInput, label: 'Fill-in-Blank', shortcut: 'F' },
    ],
  },
  {
    tools: [
      { type: 'readingPassage', icon: BookOpen, label: 'Reading', shortcut: 'R' },
      { type: 'vocabularyBox', icon: BookMarked, label: 'Vocabulary', shortcut: 'K' },
      { type: 'storyMap', icon: Map, label: 'Story Map', shortcut: 'Y' },
      { type: 'characterAnalysis', icon: UserCircle, label: 'Character', shortcut: 'C' },
      { type: 'compareContrast', icon: GitCompare, label: 'Compare', shortcut: 'O' },
    ],
  },
  {
    tools: [
      { type: 'artCritique', icon: Eye, label: 'Art Critique', shortcut: 'A' },
      { type: 'drawingPrompt', icon: Pencil, label: 'Drawing', shortcut: 'P' },
      { type: 'techniqueGrid', icon: Grid2x2, label: 'Techniques', shortcut: 'G' },
      { type: 'colorStudy', icon: Palette, label: 'Color Study', shortcut: 'U' },
    ],
  },
  {
    tools: [
      { type: 'madLibs', icon: ScrollText, label: 'Mad Libs', shortcut: 'B' },
      { type: 'matching', icon: LayoutGrid, label: 'Matching', shortcut: 'J' },
    ],
  },
  {
    tools: [
      { type: 'divider', icon: Minus, label: 'Divider', shortcut: 'D' },
      { type: 'table', icon: Table, label: 'Table', shortcut: 'L' },
      { type: 'imagePlaceholder', icon: Image, label: 'Image', shortcut: 'I' },
      { type: 'diagram', icon: Shapes, label: 'Shape', shortcut: 'S' },
    ],
  },
  {
    tools: [
      { type: 'numberLine', icon: Axis3D, label: 'Number Line', shortcut: 'N' },
      { type: 'graphPaper', icon: Grid3X3, label: 'Graph Paper', shortcut: 'E' },
      { type: 'handwritingLines', icon: AlignJustify, label: 'Handwriting', shortcut: 'W' },
      { type: 'equation', icon: SquareFunction, label: 'Equation', shortcut: 'X' },
    ],
  },
];

interface ToolbarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
}

export default function Toolbar({ activeTool, onToolSelect }: ToolbarProps) {
  const [hoveredTool, setHoveredTool] = useState<ToolType | null>(null);

  return (
    <div
      className="fixed left-0 top-12 z-40 w-[72px] h-[calc(100vh-48px)] bg-canvas-dark border-r border-border-light flex flex-col items-center py-4 gap-2 overflow-y-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {TOOL_GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col items-center gap-1">
          {gi > 0 && (
            <div className="w-8 h-px bg-border-light my-2" />
          )}
          {group.tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.type;
            return (
              <button
                key={tool.type}
                className={`
                  relative w-12 h-12 rounded-[10px] flex flex-col items-center justify-center gap-0.5
                  transition-all duration-150
                  ${isActive
                    ? 'bg-accent-light border-l-2 border-l-accent'
                    : 'bg-transparent hover:bg-white border-l-2 border-l-transparent'
                  }
                `}
                onClick={() => onToolSelect(tool.type)}
                onMouseEnter={() => setHoveredTool(tool.type)}
                onMouseLeave={() => setHoveredTool(null)}
                aria-label={`${tool.label} tool, press ${tool.shortcut}`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-ink-secondary'}`}
                  strokeWidth={1.5}
                />
                <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : 'text-ink-secondary'}`}>
                  {tool.label}
                </span>

                {/* Tooltip */}
                {hoveredTool === tool.type && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-ink text-white rounded-md px-2.5 py-1.5 shadow-md whitespace-nowrap z-50">
                    <span className="text-[12px]">{tool.label} ({tool.shortcut})</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-ink" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
