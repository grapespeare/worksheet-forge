import { useState, useCallback, useRef } from 'react';
import type { WorksheetSection, WorksheetElement, ElementType } from '@/types/worksheet';
import { SECTION_BLUEPRINTS } from '@/lib/worksheet';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Clock,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';

interface SectionProps {
  section: WorksheetSection;
  index: number;
  isDraggingOver: boolean;
  draggedElementId: string | null;
  children: React.ReactNode;
  onTitleChange: (id: string, title: string) => void;
  onTimeChange: (id: string, time: number) => void;
  onToggleCollapse: (id: string) => void;
  onDelete: (id: string) => void;
  onAddElement: (sectionId: string, type: ElementType) => void;
  onDragStart: (e: React.DragEvent, sectionId: string) => void;
  onDragOver: (e: React.DragEvent, sectionId: string) => void;
  onDrop: (e: React.DragEvent, sectionId: string) => void;
  onElementDragStart: (e: React.DragEvent, elementId: string, sourceSectionId: string) => void;
}

export default function Section({
  section,
  index,
  isDraggingOver,
  draggedElementId,
  children,
  onTitleChange,
  onTimeChange,
  onToggleCollapse,
  onDelete,
  onAddElement,
  onDragStart,
  onDragOver,
  onDrop,
  onElementDragStart,
}: SectionProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const elementCount = section.elements.length;
  const isCollapsed = section.isCollapsed ?? false;

  // Determine blueprint color hint from title match
  const getBlueprintHint = useCallback((): string | null => {
    const titleLower = section.title.toLowerCase();
    for (const [key, config] of Object.entries(SECTION_BLUEPRINTS)) {
      if (key === 'custom') continue;
      if (titleLower.includes(config.defaultTitle.toLowerCase().split(' /')[0])) {
        return key;
      }
    }
    return null;
  }, [section.title]);

  const blueprintHint = getBlueprintHint();

  const handleDelete = useCallback(() => {
    if (showDeleteConfirm) {
      onDelete(section.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  }, [showDeleteConfirm, onDelete, section.id]);

  const handleAddElement = useCallback((type: ElementType) => {
    onAddElement(section.id, type);
    setShowAddMenu(false);
  }, [onAddElement, section.id]);

  // Quick-add element types
  const quickAddTypes: { type: ElementType; label: string }[] = [
    { type: 'heading', label: 'Heading' },
    { type: 'text', label: 'Text' },
    { type: 'questionBox', label: 'Question' },
    { type: 'multipleChoice', label: 'Multiple Choice' },
    { type: 'fillInBlank', label: 'Fill in Blank' },
    { type: 'divider', label: 'Divider' },
    { type: 'table', label: 'Table' },
    { type: 'imagePlaceholder', label: 'Image' },
  ];

  return (
    <div
      className={`
        lesson-section-card relative rounded-xl border transition-all duration-200 overflow-hidden
        ${isDraggingOver
          ? 'border-accent ring-2 ring-accent/20 bg-accent-lightest'
          : 'border-border-light bg-white shadow-sm'
        }
        ${isCollapsed ? '' : ''}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(e, section.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(e, section.id);
      }}
      data-section-id={section.id}
    >
      {/* Section Header */}
      <div
        className={`
          lesson-section-header flex items-center gap-2 px-3 transition-colors duration-150 select-none
          ${isCollapsed ? 'bg-canvas-dark' : 'bg-white'}
        `}
        data-time={section.timeEstimate ? `(${section.timeEstimate} min)` : ''}
        style={{ height: '48px' }}
        draggable
        onDragStart={(e) => onDragStart(e, section.id)}
      >
        {/* Drag Handle */}
        <div
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-ink-tertiary hover:text-ink-secondary transition-colors"
          title="Drag to reorder sections"
        >
          <GripVertical className="w-4 h-4" strokeWidth={1.5} />
        </div>

        {/* Section Number */}
        <div
          className={`
            flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold flex-shrink-0
            ${blueprintHint
              ? 'bg-accent-light text-accent'
              : 'bg-canvas-dark text-ink-secondary'
            }
          `}
        >
          {index + 1}
        </div>

        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => onToggleCollapse(section.id)}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-canvas-dark text-ink-secondary hover:text-ink transition-colors"
          title={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* Title (editable) */}
        <input
          type="text"
          value={section.title}
          onChange={(e) => onTitleChange(section.id, e.target.value)}
          className="flex-1 min-w-0 text-[14px] font-semibold text-ink bg-transparent border-none outline-none focus:ring-0 placeholder:text-ink-tertiary truncate"
          placeholder="Section title"
        />

        {/* Time Estimate */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-ink-tertiary" strokeWidth={1.5} />
          <input
            type="number"
            value={section.timeEstimate ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : Math.max(1, parseInt(e.target.value, 10) || 1);
              onTimeChange(section.id, val ?? 0);
            }}
            className="w-10 text-[12px] text-ink-secondary bg-transparent border-none outline-none focus:ring-0 text-right"
            min={1}
            placeholder="-"
          />
          <span className="text-[11px] text-ink-tertiary">min</span>
        </div>

        {/* Element Count Badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-canvas-dark text-[11px] text-ink-secondary flex-shrink-0"
          title={`${elementCount} element${elementCount !== 1 ? 's' : ''}`}
        >
          <Layers className="w-3 h-3" strokeWidth={1.5} />
          {elementCount}
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`
            flex items-center justify-center w-6 h-6 rounded transition-all duration-150 flex-shrink-0
            ${showDeleteConfirm
              ? 'bg-error text-white hover:bg-error'
              : 'text-ink-tertiary hover:text-error hover:bg-error-bg'
            }
          `}
          title={showDeleteConfirm ? 'Click again to confirm delete' : 'Delete section'}
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Section Body (elements) */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          {/* Elements container */}
          <div className="min-h-[60px]">
            {children}
          </div>

          {/* Add Element Bar */}
          <div className="relative mt-2" ref={addMenuRef}>
            {!showAddMenu ? (
              <button
                onClick={() => setShowAddMenu(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border-medium text-[12px] text-ink-secondary hover:text-accent hover:border-accent hover:bg-accent-lightest transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                Add Element
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-1 p-2 rounded-lg border border-border-light bg-canvas-dark">
                {quickAddTypes.map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => handleAddElement(type)}
                    className="flex flex-col items-center gap-1 py-2 px-1 rounded-md text-[11px] text-ink-secondary hover:text-ink hover:bg-white transition-all duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-md text-[11px] text-ink-tertiary hover:text-ink-secondary hover:bg-white transition-all duration-150"
                >
                  <span className="text-[10px]">Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
