import { useState, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { WorksheetElement, ElementType } from '@/types/worksheet';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Trash2,
  AlertTriangle,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface MobilePropertiesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element: WorksheetElement | null;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function getElementLabel(type: ElementType): string {
  const labels: Record<ElementType, string> = {
    text: 'Text Block',
    heading: 'Heading',
    questionBox: 'Question Box',
    multipleChoice: 'Multiple Choice',
    fillInBlank: 'Fill-in-the-Blank',
    divider: 'Divider',
    table: 'Table',
    imagePlaceholder: 'Image',
    diagram: 'Shape',
    numberLine: 'Number Line',
    graphPaper: 'Graph Paper',
    handwritingLines: 'Handwriting Lines',
    equation: 'Equation',
    readingPassage: 'Reading Passage',
    vocabularyBox: 'Vocabulary Box',
    storyMap: 'Story Map',
    characterAnalysis: 'Character Analysis',
    compareContrast: 'Compare & Contrast',
    artCritique: 'Art Critique',
    drawingPrompt: 'Drawing Prompt',
    techniqueGrid: 'Technique Grid',
    colorStudy: 'Color Study',
    blackoutPoetry: 'Blackout Poetry',
    wordSearch: 'Word Search',
    crossword: 'Crossword',
    flashcards: 'Flashcards',
    bingo: 'BINGO',
    madLibs: 'Mad Libs',
    matching: 'Matching Game',
  };
  return labels[type] || 'Element';
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Instrument Serif', label: 'Instrument Serif' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Caveat', label: 'Caveat (cursive)' },
  { value: 'Kalam', label: 'Kalam (handwriting)' },
  { value: 'Comic Neue', label: 'Comic Neue (comic)' },
  { value: 'Patrick Hand', label: 'Patrick Hand (casual)' },
];

export default function MobilePropertiesSheet({
  open,
  onOpenChange,
  element,
  onUpdate,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  onDelete,
}: MobilePropertiesSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('content');

  if (!element) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[50vh] flex flex-col items-center justify-center">
          <p className="text-ink-tertiary text-sm">Select an element to edit its properties</p>
        </DrawerContent>
      </Drawer>
    );
  }

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? '' : id));
  };

  const SectionHeader = ({ id, title }: { id: string; title: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-3 border-b border-border-light"
    >
      <span className="text-[13px] font-semibold text-ink">{title}</span>
      {expandedSection === id ? (
        <ChevronUp className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} />
      ) : (
        <ChevronDown className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} />
      )}
    </button>
  );

  const opacityVal = element.opacity !== undefined ? element.opacity : 1;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[65vh] flex flex-col">
        <DrawerHeader className="pb-2 shrink-0 border-b border-border-light">
          <DrawerTitle className="text-base font-semibold flex items-center gap-2">
            <span>{getElementLabel(element.type)}</span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: 'thin' }}>
          {/* Content Section */}
          <SectionHeader id="content" title="Content" />
          {expandedSection === 'content' && (
            <div className="py-3 space-y-3">
              <ElementContentEditor element={element} onUpdate={onUpdate} />
            </div>
          )}

          {/* Style Section */}
          <SectionHeader id="style" title="Style" />
          {expandedSection === 'style' && (
            <div className="py-3 space-y-4">
              {/* Font Family */}
              {(element.type === 'text' || element.type === 'heading' || element.type === 'questionBox' || element.type === 'readingPassage') && (
                <div>
                  <label className="block text-[11px] text-ink-secondary mb-1.5">Font</label>
                  <select
                    value={(element as { fontFamily?: string }).fontFamily || 'Inter'}
                    onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
                    className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-lg px-3 py-2.5 text-ink outline-none focus:border-accent transition-colors"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Font Size */}
              <div>
                <label className="block text-[11px] text-ink-secondary mb-1.5">Font Size</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const current = (element as { fontSize?: number }).fontSize || 14;
                      onUpdate(element.id, { fontSize: Math.max(8, current - 1) });
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-canvas-dark active:bg-border-medium transition-colors"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <input
                    type="number"
                    value={(element as { fontSize?: number }).fontSize || 14}
                    onChange={(e) => onUpdate(element.id, { fontSize: Math.max(8, Math.min(96, parseInt(e.target.value) || 14)) })}
                    className="flex-1 text-[13px] bg-canvas-dark border border-border-light rounded-lg px-2 py-2.5 text-ink outline-none focus:border-accent transition-colors text-center"
                    min={8}
                    max={96}
                  />
                  <button
                    onClick={() => {
                      const current = (element as { fontSize?: number }).fontSize || 14;
                      onUpdate(element.id, { fontSize: Math.min(96, current + 1) });
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-canvas-dark active:bg-border-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Bold/Italic */}
              {(element.type === 'text' || element.type === 'heading') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(element.id, {
                      fontWeight: (element as { fontWeight?: number }).fontWeight === 700 ? 400 : 700
                    })}
                    className={cn(
                      'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors',
                      (element as { fontWeight?: number }).fontWeight === 700
                        ? 'bg-accent text-white'
                        : 'bg-canvas-dark text-ink-secondary active:bg-border-medium'
                    )}
                  >
                    <Bold className="w-4 h-4" strokeWidth={1.5} />
                    Bold
                  </button>
                  <button
                    onClick={() => {
                      const el = element as WorksheetElement & { fontStyle?: string };
                      onUpdate(element.id, {
                        fontStyle: (el.fontStyle || 'normal') === 'normal' ? 'italic' : 'normal',
                      } as Partial<WorksheetElement>);
                    }}
                    className={cn(
                      'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors',
                      ((element as unknown as { fontStyle?: string }).fontStyle || 'normal') === 'italic'
                        ? 'bg-accent text-white'
                        : 'bg-canvas-dark text-ink-secondary active:bg-border-medium'
                    )}
                  >
                    <Italic className="w-4 h-4" strokeWidth={1.5} />
                    Italic
                  </button>
                </div>
              )}

              {/* Text Color */}
              <div>
                <label className="block text-[11px] text-ink-secondary mb-1.5">Text Color</label>
                <div className="flex flex-wrap gap-2">
                  {['#292524', '#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA', '#C2410C', '#0891B2'].map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdate(element.id, { color: c })}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all active:scale-90',
                        ((element as { color?: string }).color || '#292524') === c
                          ? 'border-accent scale-110'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-[11px] text-ink-secondary mb-1.5">Background</label>
                <div className="flex flex-wrap gap-2">
                  {['transparent', '#FFFFFF', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#F3E8FF', '#E0F2FE'].map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdate(element.id, { backgroundColor: c === 'transparent' ? undefined : c })}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all active:scale-90',
                        ((element as { backgroundColor?: string }).backgroundColor || 'transparent') === c
                          ? 'border-accent scale-110'
                          : 'border-border-medium'
                      )}
                      style={{
                        backgroundColor: c,
                        backgroundImage: c === 'transparent'
                          ? 'repeating-linear-gradient(45deg, #e5e5e5 0, #e5e5e5 2px, transparent 0, transparent 50%)'
                          : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Text Align */}
              {(element.type === 'text' || element.type === 'heading') && (
                <div>
                  <label className="block text-[11px] text-ink-secondary mb-1.5">Alignment</label>
                  <div className="flex rounded-lg overflow-hidden border border-border-light">
                    {([
                      { icon: AlignLeft, val: 'left' },
                      { icon: AlignCenter, val: 'center' },
                      { icon: AlignRight, val: 'right' },
                    ] as const).map(({ icon: Icon, val }) => (
                      <button
                        key={val}
                        onClick={() => onUpdate(element.id, { textAlign: val })}
                        className={cn(
                          'flex-1 h-10 flex items-center justify-center transition-colors',
                          ((element as { textAlign?: string }).textAlign || 'left') === val
                            ? 'bg-accent text-white'
                            : 'bg-canvas-dark text-ink-secondary active:bg-border-medium'
                        )}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Layout Section */}
          <SectionHeader id="layout" title="Layout" />
          {expandedSection === 'layout' && (
            <div className="py-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-ink-secondary mb-1">X Position</label>
                  <Input
                    type="number"
                    value={Math.round(element.x)}
                    onChange={(e) => onUpdate(element.id, { x: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-ink-secondary mb-1">Y Position</label>
                  <Input
                    type="number"
                    value={Math.round(element.y)}
                    onChange={(e) => onUpdate(element.id, { y: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-ink-secondary mb-1">Width</label>
                  <Input
                    type="number"
                    value={Math.round(element.width)}
                    onChange={(e) => onUpdate(element.id, { width: Math.max(40, parseInt(e.target.value) || 200) })}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-ink-secondary mb-1">Height</label>
                  <Input
                    type="number"
                    value={Math.round(element.height)}
                    onChange={(e) => onUpdate(element.id, { height: Math.max(20, parseInt(e.target.value) || 80) })}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-ink-secondary">Opacity</label>
                  <span className="text-[11px] text-ink-tertiary">{Math.round(opacityVal * 100)}%</span>
                </div>
                <Slider
                  value={[Math.round(opacityVal * 100)]}
                  onValueChange={([v]) => onUpdate(element.id, { opacity: v / 100 })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Rotation */}
              <div>
                <label className="block text-[11px] text-ink-secondary mb-1">Rotation</label>
                <Input
                  type="number"
                  value={element.rotation || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    onUpdate(element.id, { rotation: ((val % 360) + 360) % 360 });
                  }}
                  className="h-10"
                  min={0}
                  max={360}
                />
              </div>
            </div>
          )}

          {/* Multiple Choice Options */}
          {element.type === 'multipleChoice' && (
            <>
              <SectionHeader id="mc-options" title="Options" />
              {expandedSection === 'mc-options' && (
                <MCOptionsEditor element={element as WorksheetElement & { options: string[]; correctAnswer?: number }} onUpdate={onUpdate} />
              )}
            </>
          )}

          {/* Fill-in-Blank */}
          {element.type === 'fillInBlank' && (
            <>
              <SectionHeader id="fib" title="Blanks" />
              {expandedSection === 'fib' && (
                <FIBEditor element={element as WorksheetElement & { sentence: string; blanks: string[] }} onUpdate={onUpdate} />
              )}
            </>
          )}

          {/* Actions Section */}
          <SectionHeader id="actions" title="Actions" />
          {expandedSection === 'actions' && (
            <div className="py-3 space-y-2">
              <ActionButton
                icon={<ArrowUpToLine className="w-4 h-4" strokeWidth={1.5} />}
                label="Bring to Front"
                onClick={() => onBringToFront(element.id)}
              />
              <ActionButton
                icon={<ArrowDownToLine className="w-4 h-4" strokeWidth={1.5} />}
                label="Send to Back"
                onClick={() => onSendToBack(element.id)}
              />
              <ActionButton
                icon={<Copy className="w-4 h-4" strokeWidth={1.5} />}
                label="Duplicate"
                onClick={() => onDuplicate(element.id)}
              />
              <div className="pt-2">
                {!showDeleteConfirm ? (
                  <ActionButton
                    icon={<Trash2 className="w-4 h-4" strokeWidth={1.5} />}
                    label="Delete"
                    danger
                    onClick={() => setShowDeleteConfirm(true)}
                  />
                ) : (
                  <div className="bg-error-bg rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-error">
                      <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-xs font-medium">Delete this element?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDelete(element.id);
                          setShowDeleteConfirm(false);
                          onOpenChange(false);
                        }}
                        className="flex-1 h-9 bg-error text-white rounded-lg text-xs font-medium active:opacity-80 transition-opacity"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 h-9 bg-canvas-dark text-ink rounded-lg text-xs font-medium active:bg-border-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ActionButton({ icon, label, danger, onClick }: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 h-11 rounded-lg text-[13px] font-medium transition-colors active:scale-[0.98]',
        danger
          ? 'text-error hover:bg-error-bg active:bg-error-bg'
          : 'text-ink-secondary hover:bg-canvas-dark active:bg-border-medium'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* Content editor that adapts to element type */
function ElementContentEditor({ element, onUpdate }: {
  element: WorksheetElement;
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
}) {
  const handleChange = (value: string) => {
    switch (element.type) {
      case 'text':
      case 'heading':
        onUpdate(element.id, { content: value });
        break;
      case 'questionBox':
        onUpdate(element.id, { question: value } as Partial<WorksheetElement>);
        break;
      case 'multipleChoice':
        onUpdate(element.id, { question: value } as Partial<WorksheetElement>);
        break;
      case 'fillInBlank':
        onUpdate(element.id, { sentence: value } as Partial<WorksheetElement>);
        break;
      case 'readingPassage':
        onUpdate(element.id, { content: value } as Partial<WorksheetElement>);
        break;
      default:
        break;
    }
  };

  const label = useMemo(() => {
    switch (element.type) {
      case 'text': return 'Text Content';
      case 'heading': return 'Heading Text';
      case 'questionBox': return 'Question';
      case 'multipleChoice': return 'Question';
      case 'fillInBlank': return 'Sentence (use [blank] for blanks)';
      case 'readingPassage': return 'Passage Content';
      default: return 'Content';
    }
  }, [element.type]);

  const value = useMemo(() => {
    switch (element.type) {
      case 'text':
      case 'heading':
        return (element as { content?: string }).content || '';
      case 'questionBox':
        return (element as { question?: string }).question || '';
      case 'multipleChoice':
        return (element as { question?: string }).question || '';
      case 'fillInBlank':
        return (element as { sentence?: string }).sentence || '';
      case 'readingPassage':
        return (element as { content?: string }).content || '';
      default:
        return '';
    }
  }, [element]);

  const hasContent = element.type === 'text' || element.type === 'heading' || element.type === 'questionBox'
    || element.type === 'multipleChoice' || element.type === 'fillInBlank' || element.type === 'readingPassage';

  if (!hasContent) {
    return (
      <p className="text-xs text-ink-tertiary py-2">
        This element type does not have editable text content. Use the Style and Layout sections to customize it.
      </p>
    );
  }

  return (
    <div>
      <label className="block text-[11px] text-ink-secondary mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full min-h-[80px] text-[13px] bg-canvas-dark border border-border-light rounded-lg px-3 py-2.5 text-ink outline-none focus:border-accent transition-colors resize-y"
        placeholder="Enter text here..."
      />
    </div>
  );
}

/* Multiple Choice Options Editor */
function MCOptionsEditor({ element, onUpdate }: {
  element: WorksheetElement & { options: string[]; correctAnswer?: number };
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
}) {
  const [newOption, setNewOption] = useState('');

  const updateOptions = (opts: string[]) => {
    onUpdate(element.id, { options: opts } as Partial<WorksheetElement>);
  };

  const addOption = () => {
    if (newOption.trim()) {
      updateOptions([...element.options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (idx: number) => {
    if (element.options.length <= 2) return;
    const newOpts = element.options.filter((_, i) => i !== idx);
    updateOptions(newOpts);
    if (element.correctAnswer === idx) {
      onUpdate(element.id, { correctAnswer: undefined } as Partial<WorksheetElement>);
    }
  };

  return (
    <div className="py-3 space-y-2">
      {element.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(element.id, { correctAnswer: i } as Partial<WorksheetElement>)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors',
              element.correctAnswer === i
                ? 'bg-green-100 text-green-600'
                : 'bg-canvas-dark text-ink-tertiary'
            )}
          >
            {element.correctAnswer === i ? (
              <Check className="w-4 h-4" strokeWidth={2} />
            ) : (
              <span className="text-xs">{String.fromCharCode(65 + i)}</span>
            )}
          </button>
          <input
            type="text"
            value={opt}
            onChange={(e) => {
              const newOpts = [...element.options];
              newOpts[i] = e.target.value;
              updateOptions(newOpts);
            }}
            className="flex-1 text-[13px] bg-canvas-dark border border-border-light rounded-lg px-2.5 py-2 text-ink outline-none focus:border-accent"
          />
          <button
            onClick={() => removeOption(i)}
            disabled={element.options.length <= 2}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-tertiary active:bg-error-bg disabled:opacity-30"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Input
          placeholder="New option..."
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addOption()}
          className="flex-1 h-9 text-xs"
        />
        <button
          onClick={addOption}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent text-white active:opacity-80"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* Fill-in-the-Blank Editor */
function FIBEditor({ element, onUpdate }: {
  element: WorksheetElement & { sentence: string; blanks: string[] };
  onUpdate: (id: string, updates: Partial<WorksheetElement>) => void;
}) {
  const parts = element.sentence.split(/(\[\[.*?\]\])/g);

  const parseBlanks = (sentence: string): string[] => {
    const matches = sentence.match(/\[\[(.*?)\]\]/g);
    return matches ? matches.map((m) => m.slice(2, -2)) : [];
  };

  return (
    <div className="py-3 space-y-3">
      <div className="bg-canvas-dark rounded-lg p-3">
        <p className="text-[11px] text-ink-secondary mb-2">Use [[word]] to create blanks</p>
        <div className="text-sm text-ink leading-relaxed">
          {parts.map((part, i) => {
            if (part.match(/^\[\[.*?\]\]$/)) {
              return (
                <span key={i} className="inline-block bg-accent/20 border-b-2 border-accent px-1 mx-0.5 rounded text-accent font-medium min-w-[3em] text-center">
                  {part.slice(2, -2)}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-ink-secondary mb-1.5">Answers</label>
        {element.blanks.map((blank, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-ink-tertiary w-6">{i + 1}.</span>
            <Input
              value={blank}
              onChange={(e) => {
                const newBlanks = [...element.blanks];
                newBlanks[i] = e.target.value;
                onUpdate(element.id, { blanks: newBlanks } as Partial<WorksheetElement>);
              }}
              className="flex-1 h-9 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
