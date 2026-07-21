import { useState, useCallback, useMemo } from 'react';
import type { Worksheet, WorksheetSection, WorksheetElement, ElementType } from '@/types/worksheet';
import type { SectionBlueprint } from '@/types/worksheet';
import { SECTION_BLUEPRINTS, createSectionFromBlueprint, ensureSections, createDefaultElement, generateId } from '@/lib/worksheet';
import Section from './Section';
import CanvasElement from './CanvasElement';
import {
  Plus,
  LayoutTemplate,
  Clock,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

interface LessonViewProps {
  worksheet: Worksheet;
  currentPageIndex: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdateWorksheet: (updates: Partial<Worksheet>) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
}

interface DragData {
  elementId: string;
  sourceSectionId: string;
}

export default function LessonView({
  worksheet,
  currentPageIndex,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onUpdateWorksheet,
}: LessonViewProps) {
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [showBlueprintMenu, setShowBlueprintMenu] = useState(false);

  const page = worksheet.pages[currentPageIndex];
  const sections = useMemo(() => ensureSections(page), [page]);

  const totalTime = useMemo(() => {
    return sections.reduce((sum, s) => sum + (s.timeEstimate || 0), 0);
  }, [sections]);

  // Update sections on the current page
  const updateSections = useCallback((newSections: WorksheetSection[]) => {
    const pages = [...worksheet.pages];
    pages[currentPageIndex] = {
      ...pages[currentPageIndex],
      sections: newSections,
      elements: undefined, // Clear legacy elements once migrated
    };
    onUpdateWorksheet({ pages });
  }, [worksheet.pages, currentPageIndex, onUpdateWorksheet]);

  const handleTitleChange = useCallback((sectionId: string, title: string) => {
    const newSections = sections.map((s) =>
      s.id === sectionId ? { ...s, title } : s
    );
    updateSections(newSections);
  }, [sections, updateSections]);

  const handleTimeChange = useCallback((sectionId: string, time: number) => {
    const newSections = sections.map((s) =>
      s.id === sectionId ? { ...s, timeEstimate: time } : s
    );
    updateSections(newSections);
  }, [sections, updateSections]);

  const handleToggleCollapse = useCallback((sectionId: string) => {
    const newSections = sections.map((s) =>
      s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s
    );
    updateSections(newSections);
  }, [sections, updateSections]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    const newSections = sections.filter((s) => s.id !== sectionId);
    // Don't delete the last section - create an empty one
    if (newSections.length === 0) {
      newSections.push({
        id: generateId(),
        title: 'Main Content',
        elements: [],
        isCollapsed: false,
      });
    }
    updateSections(newSections);
  }, [sections, updateSections]);

  const handleAddElement = useCallback((sectionId: string, type: ElementType) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newElement = createDefaultElement(type, 20, 20 + section.elements.length * 20);

    const newSections = sections.map((s) =>
      s.id === sectionId
        ? { ...s, elements: [...s.elements, newElement] }
        : s
    );
    updateSections(newSections);
    onSelect(newElement.id);
  }, [sections, updateSections, onSelect]);

  const handleAddEmptySection = useCallback(() => {
    const newSection: WorksheetSection = {
      id: generateId(),
      title: 'New Section',
      timeEstimate: 10,
      elements: [],
      isCollapsed: false,
    };
    updateSections([...sections, newSection]);
  }, [sections, updateSections]);

  const handleAddBlueprintSection = useCallback((blueprint: SectionBlueprint) => {
    const newSection = createSectionFromBlueprint(blueprint);
    updateSections([...sections, newSection]);
    setShowBlueprintMenu(false);
  }, [sections, updateSections]);

  /* -- Section Reordering (drag & drop) -- */
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);

  const handleSectionDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/section', sectionId);
    setDraggingSectionId(sectionId);
  }, []);

  const handleSectionDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Check if this is an element drag or section drag
    const hasElement = e.dataTransfer.types.includes('application/element');
    const hasSection = e.dataTransfer.types.includes('application/section');

    if (hasElement) {
      setDragOverSectionId(sectionId);
    }
    // Section reordering is handled separately
  }, []);

  const handleSectionDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);

    // Handle element drop (move element between sections)
    const elementData = e.dataTransfer.getData('application/element');
    if (elementData) {
      try {
        const dragData: DragData = JSON.parse(elementData);
        const { elementId, sourceSectionId } = dragData;

        if (sourceSectionId === targetSectionId) return;

        const sourceSection = sections.find((s) => s.id === sourceSectionId);
        const targetSection = sections.find((s) => s.id === targetSectionId);
        if (!sourceSection || !targetSection) return;

        const element = sourceSection.elements.find((el) => el.id === elementId);
        if (!element) return;

        // Remove from source, add to target
        const newSections = sections.map((s) => {
          if (s.id === sourceSectionId) {
            return { ...s, elements: s.elements.filter((el) => el.id !== elementId) };
          }
          if (s.id === targetSectionId) {
            return { ...s, elements: [...s.elements, element] };
          }
          return s;
        });

        updateSections(newSections);
      } catch {
        // ignore parse errors
      }
      setDraggedElementId(null);
      return;
    }

    // Handle section reorder
    const sectionId = e.dataTransfer.getData('application/section');
    if (sectionId && sectionId !== targetSectionId) {
      const fromIndex = sections.findIndex((s) => s.id === sectionId);
      const toIndex = sections.findIndex((s) => s.id === targetSectionId);
      if (fromIndex === -1 || toIndex === -1) return;

      const reordered = [...sections];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      updateSections(reordered);
      setDraggingSectionId(null);
    }
  }, [sections, updateSections]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the section container entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSectionId(null);
    }
  }, []);

  /* -- Element Drag & Drop (between sections) -- */
  const handleElementDragStart = useCallback((e: React.DragEvent, elementId: string, sourceSectionId: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    const dragData: DragData = { elementId, sourceSectionId };
    e.dataTransfer.setData('application/element', JSON.stringify(dragData));
    setDraggedElementId(elementId);
  }, []);

  // Blueprint options
  const blueprintOptions: { key: SectionBlueprint; icon: string }[] = [
    { key: 'hook', icon: 'Zap' },
    { key: 'directInstruction', icon: 'Presentation' },
    { key: 'guidedPractice', icon: 'Users' },
    { key: 'independentPractice', icon: 'User' },
    { key: 'exitTicket', icon: 'CheckCircle' },
    { key: 'custom', icon: 'Plus' },
  ];

  return (
    <div
      className="fixed top-12 left-[72px] right-[280px] h-[calc(100vh-48px)] overflow-auto lesson-view-container"
      style={{ backgroundColor: '#FAF6EF' }}
    >
      {/* Print styles for lesson sections */}
      <style>{`
        @media print {
          .lesson-view-container {
            position: static !important;
            left: 0 !important;
            right: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          .lesson-section-card {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            margin-bottom: 16px !important;
          }
          .lesson-section-header {
            background: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .lesson-section-title-print::after {
            content: attr(data-time);
            font-weight: normal;
            color: #6b7280;
            margin-left: 8px;
          }
          .lesson-add-buttons,
          .lesson-element-actions {
            display: none !important;
          }
        }
      `}</style>
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header: Title + Total Time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" strokeWidth={1.5} />
            <h2 className="text-[16px] font-semibold text-ink">
              Lesson Plan
            </h2>
            <span className="text-[12px] text-ink-tertiary">
              ({sections.length} section{sections.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-light text-[13px] text-ink-secondary"
              title="Total estimated time"
            >
              <Clock className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              <span className="font-medium">{totalTime}</span>
              <span className="text-ink-tertiary">min total</span>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="flex flex-col gap-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              onDragLeave={handleDragLeave}
            >
              <Section
                section={section}
                index={index}
                isDraggingOver={dragOverSectionId === section.id}
                draggedElementId={draggedElementId}
                onTitleChange={handleTitleChange}
                onTimeChange={handleTimeChange}
                onToggleCollapse={handleToggleCollapse}
                onDelete={handleDeleteSection}
                onAddElement={handleAddElement}
                onDragStart={handleSectionDragStart}
                onDragOver={handleSectionDragOver}
                onDrop={handleSectionDrop}
                onElementDragStart={handleElementDragStart}
              >
                {/* Render elements inside the section */}
                {section.elements.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-[12px] text-ink-tertiary italic">
                    Drag elements here or click "Add Element" below
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {section.elements.map((element) => (
                      <div
                        key={element.id}
                        draggable
                        onDragStart={(e) => handleElementDragStart(e, element.id, section.id)}
                        className={`
                          relative rounded-lg border transition-all duration-150 cursor-grab active:cursor-grabbing
                          ${selectedId === element.id
                            ? 'border-accent ring-2 ring-accent/20'
                            : 'border-border-light hover:border-border-medium'
                          }
                          ${draggedElementId === element.id ? 'opacity-50' : 'opacity-100'}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(element.id);
                        }}
                      >
                        {/* Element mini-preview */}
                        <div className="p-2">
                          <LessonElementPreview
                            element={element}
                            isSelected={selectedId === element.id}
                            onSelect={onSelect}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          ))}
        </div>

        {/* Add Section Buttons */}
        <div className="lesson-add-buttons mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddEmptySection}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border-medium text-[13px] text-ink-secondary hover:text-accent hover:border-accent hover:bg-accent-lightest transition-all duration-150"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Add Section
            </button>
            <div className="relative">
              <button
                onClick={() => setShowBlueprintMenu((v) => !v)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-medium text-[13px] text-ink-secondary hover:text-accent hover:border-accent hover:bg-accent-lightest transition-all duration-150"
              >
                <LayoutTemplate className="w-4 h-4" strokeWidth={1.5} />
                Blueprint
                <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
              </button>

              {showBlueprintMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowBlueprintMenu(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl border border-border-light shadow-lg z-50 py-1 overflow-hidden">
                    <div className="px-3 py-2 text-[11px] font-medium text-ink-tertiary uppercase tracking-wider border-b border-border-light">
                      Choose a Blueprint
                    </div>
                    {blueprintOptions.map(({ key }) => {
                      const config = SECTION_BLUEPRINTS[key];
                      return (
                        <button
                          key={key}
                          onClick={() => handleAddBlueprintSection(key)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-canvas-dark transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                            <span className="text-[12px] font-semibold text-accent">
                              {config.defaultTime}m
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-ink truncate">
                              {config.defaultTitle}
                            </div>
                            <div className="text-[11px] text-ink-tertiary">
                              {config.suggestedElementTypes.length} suggested element types
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}

/* -- Mini element preview for lesson view -- */
interface LessonElementPreviewProps {
  element: WorksheetElement;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function LessonElementPreview({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: LessonElementPreviewProps) {
  const [showActions, setShowActions] = useState(false);

  const getElementLabel = (el: WorksheetElement): string => {
    switch (el.type) {
      case 'text': return el.content?.substring(0, 40) || 'Text';
      case 'heading': return el.content || 'Heading';
      case 'questionBox': return el.question?.substring(0, 40) || 'Question';
      case 'multipleChoice': return el.question?.substring(0, 40) || 'Multiple Choice';
      case 'fillInBlank': return el.sentence?.substring(0, 40) || 'Fill in Blank';
      case 'divider': return 'Divider';
      case 'table': return `Table (${el.rows}x${el.cols})`;
      case 'imagePlaceholder': return el.imageUrl ? 'Image' : 'Image Placeholder';
      case 'diagram': return `Diagram (${el.shapeType})`;
      case 'numberLine': return `Number Line (${el.min}-${el.max})`;
      case 'graphPaper': return 'Graph Paper';
      case 'handwritingLines': return `Handwriting (${el.lineSets} lines)`;
      case 'equation': return el.latex || 'Equation';
      case 'readingPassage': return el.title || 'Reading Passage';
      case 'vocabularyBox': return el.word || 'Vocabulary';
      case 'storyMap': return el.title || 'Story Map';
      case 'characterAnalysis': return el.characterName || 'Character Analysis';
      case 'compareContrast': return `${el.topicA} vs ${el.topicB}`;
      case 'artCritique': return el.artworkTitle || 'Art Critique';
      case 'drawingPrompt': return el.prompt?.substring(0, 40) || 'Drawing Prompt';
      case 'techniqueGrid': return 'Technique Grid';
      case 'colorStudy': return el.title || 'Color Study';
      default: return 'Element';
    }
  };

  const getElementIcon = (type: string): string => {
    const icons: Record<string, string> = {
      text: 'T',
      heading: 'H',
      questionBox: '?',
      multipleChoice: 'MC',
      fillInBlank: 'FB',
      divider: '-',
      table: 'Tbl',
      imagePlaceholder: 'Img',
      diagram: 'Dgm',
      numberLine: 'NL',
      graphPaper: 'GP',
      handwritingLines: 'HW',
      equation: 'Eq',
      readingPassage: 'RP',
      vocabularyBox: 'Voc',
      storyMap: 'SM',
      characterAnalysis: 'CA',
      compareContrast: 'CC',
      artCritique: 'AC',
      drawingPrompt: 'DP',
      techniqueGrid: 'TG',
      colorStudy: 'CS',
    };
    return icons[type] || '?';
  };

  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Element type icon */}
      <div
        className={`
          w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold flex-shrink-0
          ${isSelected ? 'bg-accent text-white' : 'bg-canvas-dark text-ink-secondary'}
        `}
      >
        {getElementIcon(element.type)}
      </div>

      {/* Element label */}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-ink truncate">
          {getElementLabel(element)}
        </div>
        <div className="text-[10px] text-ink-tertiary capitalize">
          {element.type.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      </div>

      {/* Quick actions on hover */}
      {showActions && (
        <div className="lesson-element-actions flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(element.id);
            }}
            className="px-1.5 py-0.5 rounded text-[10px] text-ink-tertiary hover:text-accent hover:bg-accent-lightest transition-colors"
            title="Duplicate"
          >
            Dup
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="px-1.5 py-0.5 rounded text-[10px] text-ink-tertiary hover:text-error hover:bg-error-bg transition-colors"
            title="Delete"
          >
            Del
          </button>
        </div>
      )}
    </div>
  );
}
