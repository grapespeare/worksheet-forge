import { useCallback } from 'react';
import type { WorksheetElement } from '@/types/worksheet';
import TextElement from './elements/TextElement';
import HeadingElement from './elements/HeadingElement';
import QuestionBoxElement from './elements/QuestionBoxElement';
import MultipleChoiceElement from './elements/MultipleChoiceElement';
import FillInBlankElement from './elements/FillInBlankElement';
import DividerElement from './elements/DividerElement';
import TableElement from './elements/TableElement';
import ImagePlaceholderElement from './elements/ImagePlaceholderElement';
import DiagramElement from './elements/DiagramElement';
import NumberLineElement from './elements/NumberLineElement';
import GraphPaperElement from './elements/GraphPaperElement';
import HandwritingLinesElement from './elements/HandwritingLinesElement';
import EquationElement from './elements/EquationElement';
import ReadingPassageElement from './elements/ReadingPassageElement';
import VocabularyBoxElement from './elements/VocabularyBoxElement';
import StoryMapElement from './elements/StoryMapElement';
import CharacterAnalysisElement from './elements/CharacterAnalysisElement';
import CompareContrastElement from './elements/CompareContrastElement';
import ArtCritiqueElement from './elements/ArtCritiqueElement';
import DrawingPromptElement from './elements/DrawingPromptElement';
import TechniqueGridElement from './elements/TechniqueGridElement';
import ColorStudyElement from './elements/ColorStudyElement';
import BlackoutPoetryElement from './elements/BlackoutPoetryElement';
import WordSearchElement from './elements/WordSearchElement';
import CrosswordElement from './elements/CrosswordElement';
import FlashcardsElement from './elements/FlashcardsElement';
import BingoElement from './elements/BingoElement';

import MadLibsElement from './elements/MadLibsElement';
import MatchingElement from './elements/MatchingElement';

interface CanvasElementProps {
  element: WorksheetElement;
  isSelected: boolean;
  isEditing?: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onResizeStart: (id: string, handle: string, e: React.MouseEvent) => void;
}

const RESIZE_HANDLES = [
  { pos: 'nw', cursor: 'nwse-resize', style: { top: -4, left: -4 } },
  { pos: 'n', cursor: 'ns-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
  { pos: 'ne', cursor: 'nesw-resize', style: { top: -4, right: -4 } },
  { pos: 'w', cursor: 'ew-resize', style: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
  { pos: 'e', cursor: 'ew-resize', style: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
  { pos: 'sw', cursor: 'nesw-resize', style: { bottom: -4, left: -4 } },
  { pos: 's', cursor: 'ns-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
  { pos: 'se', cursor: 'nwse-resize', style: { bottom: -4, right: -4 } },
];

export default function CanvasElement({
  element,
  isSelected,
  isEditing = true,
  onSelect,
  onUpdate,
  onDragStart,
  onResizeStart,
}: CanvasElementProps) {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    onDragStart(element.id, e);
  }, [element.id, onSelect, onDragStart]);

  const renderContent = () => {
    switch (element.type) {
      case 'text': return <TextElement element={element} isSelected={isSelected} />;
      case 'heading': return <HeadingElement element={element} isSelected={isSelected} />;
      case 'questionBox': return <QuestionBoxElement element={element} isSelected={isSelected} />;
      case 'multipleChoice': return <MultipleChoiceElement element={element} isSelected={isSelected} />;
      case 'fillInBlank': return <FillInBlankElement element={element} isSelected={isSelected} />;
      case 'divider': return <DividerElement element={element} isSelected={isSelected} />;
      case 'table': return <TableElement element={element} isSelected={isSelected} />;
      case 'imagePlaceholder': return <ImagePlaceholderElement element={element} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      case 'diagram': return <DiagramElement element={element} isSelected={isSelected} />;
      case 'numberLine': return <NumberLineElement element={element} isSelected={isSelected} />;
      case 'graphPaper': return <GraphPaperElement element={element} isSelected={isSelected} />;
      case 'handwritingLines': return <HandwritingLinesElement element={element} isSelected={isSelected} />;
      case 'equation': return <EquationElement element={element} isSelected={isSelected} />;
      case 'readingPassage': return <ReadingPassageElement element={element} isSelected={isSelected} />;
      case 'vocabularyBox': return <VocabularyBoxElement element={element} isSelected={isSelected} />;
      case 'storyMap': return <StoryMapElement element={element} isSelected={isSelected} />;
      case 'characterAnalysis': return <CharacterAnalysisElement element={element} isSelected={isSelected} />;
      case 'compareContrast': return <CompareContrastElement element={element} isSelected={isSelected} />;
      case 'artCritique': return <ArtCritiqueElement element={element} isSelected={isSelected} />;
      case 'drawingPrompt': return <DrawingPromptElement element={element} isSelected={isSelected} />;
      case 'techniqueGrid': return <TechniqueGridElement element={element} isSelected={isSelected} />;
      case 'colorStudy': return <ColorStudyElement element={element} isSelected={isSelected} />;
      case 'blackoutPoetry': return <BlackoutPoetryElement element={element} isEditing={false} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      case 'wordSearch': return <WordSearchElement element={element} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      case 'crossword': return <CrosswordElement element={element} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      case 'flashcards': return <FlashcardsElement element={element} isEditing={false} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      case 'bingo': return <BingoElement element={element} isEditing={false} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;

      case 'madLibs': return <MadLibsElement element={element} isEditing={isEditing} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      case 'matching': return <MatchingElement element={element} isEditing={isEditing} isSelected={isSelected} onUpdate={(u) => onUpdate(element.id, u)} />;
      default: return null;
    }
  };

  // Build element style with new customization properties
  const rotation = element.rotation || 0;
  const opacity = element.opacity !== undefined ? element.opacity : 1;
  const borderRadius = (element as { borderRadius?: number }).borderRadius || 0;
  const borderStyle = (element as { borderStyle?: string }).borderStyle;
  const borderWidth = (element as { borderWidth?: number }).borderWidth;
  const border = (element as { border?: boolean }).border;
  const borderColor = (element as { borderColor?: string }).borderColor;

  const elementStyle: React.CSSProperties = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    cursor: 'grab',
    transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
    opacity,
    borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
    border: border || borderStyle
      ? `${borderWidth || 1}px ${borderStyle || 'solid'} ${borderColor || '#D6D3CC'}`
      : undefined,
  };

  return (
    <div
      className="absolute group"
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {/* Selection border */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '2px solid #D97757',
            backgroundColor: 'rgba(250, 243, 239, 0.3)',
            margin: '-2px',
            borderRadius: borderRadius > 0 ? `${borderRadius + 2}px` : undefined,
          }}
        />
      )}

      {/* Hover border (only when not selected) */}
      {!isSelected && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            border: '1px dashed #D6D3CC',
            margin: '-1px',
            borderRadius: borderRadius > 0 ? `${borderRadius + 1}px` : undefined,
          }}
        />
      )}

      {/* Element content */}
      <div className="w-full h-full overflow-hidden" style={{
        borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
      }}>
        {renderContent()}
      </div>

      {/* Resize handles */}
      {isSelected && RESIZE_HANDLES.map((h) => (
        <div
          key={h.pos}
          className="absolute w-2 h-2 bg-accent rounded-sm"
          style={{
            ...h.style,
            cursor: h.cursor as React.CSSProperties['cursor'],
            zIndex: 10,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(element.id, h.pos, e);
          }}
        />
      ))}
    </div>
  );
}
