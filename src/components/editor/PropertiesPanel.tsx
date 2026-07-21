import { useMemo } from 'react';
import type { WorksheetElement, Worksheet, ElementType } from '@/types/worksheet';
import ColorPicker from './ColorPicker';
import {
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustifyIcon,
  Lock,
  Unlock,
  Group,
} from 'lucide-react';

interface PropertiesPanelProps {
  worksheet: Worksheet;
  selectedElement: WorksheetElement | null;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  aiPanelOpen?: boolean;
  onUpdateWorksheet: (updates: Partial<Worksheet>) => void;
  onUpdateElement: (id: string, updates: Partial<WorksheetElement>) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleGrid: () => void;
  onSetGridSize: (size: number) => void;
  onToggleSnap: () => void;
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

const BORDER_STYLES: Array<{ value: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy'; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'double', label: 'Double' },
  { value: 'wavy', label: 'Wavy' },
];

const TEXT_ALIGNS = [
  { icon: AlignLeft, value: 'left' },
  { icon: AlignCenter, value: 'center' },
  { icon: AlignRight, value: 'right' },
  { icon: AlignJustifyIcon, value: 'justify' },
] as const;

const LINE_HEIGHTS = [
  { value: 1, label: 'Single' },
  { value: 1.5, label: '1.5' },
  { value: 2, label: 'Double' },
];

export default function PropertiesPanel({
  worksheet,
  selectedElement,
  showGrid,
  gridSize,
  snapToGrid,
  aiPanelOpen = false,
  onUpdateWorksheet,
  onUpdateElement,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  onDelete,
  onToggleGrid,
  onSetGridSize,
  onToggleSnap,
}: PropertiesPanelProps) {
  const handlePageSettingChange = (field: string, value: unknown) => {
    onUpdateWorksheet({ [field]: value });
  };

  return (
    <div className={`fixed top-12 z-40 w-[280px] h-[calc(100vh-48px)] bg-white border-l border-border-light overflow-y-auto p-5 flex flex-col gap-5 transition-all duration-200 ${aiPanelOpen ? 'right-[360px]' : 'right-0'}`} style={{ scrollbarWidth: 'thin' }}>
      {/* Page Settings */}
      <section>
        <h3 className="text-[12px] font-semibold text-ink-secondary uppercase tracking-[0.06em] mb-3">
          Page Setup
        </h3>

        {/* Orientation */}
        <label className="block text-[11px] text-ink-secondary mb-1">Orientation</label>
        <div className="flex mb-3">
          <button
            onClick={() => handlePageSettingChange('orientation', 'portrait')}
            className={`
              flex-1 h-14 flex flex-col items-center justify-center gap-1 rounded-l-md text-[11px] font-medium transition-colors
              ${worksheet.orientation === 'portrait'
                ? 'bg-accent text-white'
                : 'bg-canvas-dark text-ink-secondary hover:brightness-95'
              }
            `}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <rect x="0.5" y="0.5" width="11" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
            Portrait
          </button>
          <button
            onClick={() => handlePageSettingChange('orientation', 'landscape')}
            className={`
              flex-1 h-14 flex flex-col items-center justify-center gap-1 rounded-r-md text-[11px] font-medium transition-colors
              ${worksheet.orientation === 'landscape'
                ? 'bg-accent text-white'
                : 'bg-canvas-dark text-ink-secondary hover:brightness-95'
              }
            `}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect x="0.5" y="0.5" width="15" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
            Landscape
          </button>
        </div>

        {/* Page size */}
        <label className="block text-[11px] text-ink-secondary mb-1">Page Size</label>
        <select
          value={worksheet.pageSize}
          onChange={(e) => handlePageSettingChange('pageSize', e.target.value)}
          className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink mb-3 outline-none focus:border-accent transition-colors"
        >
          <option value="letter">US Letter (8.5 x 11&quot;)</option>
          <option value="a4">A4 (210 x 297mm)</option>
          <option value="legal">Legal (8.5 x 14&quot;)</option>
          <option value="tabloid">Tabloid (11 x 17&quot;)</option>
        </select>

        {/* Page Background */}
        <label className="block text-[11px] text-ink-secondary mb-1">Page Background</label>
        <select
          value={worksheet.pageBackground || 'blank'}
          onChange={(e) => handlePageSettingChange('pageBackground', e.target.value)}
          className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink mb-3 outline-none focus:border-accent transition-colors"
        >
          <option value="blank">Blank</option>
          <option value="lined">Lined Paper</option>
          <option value="graph">Graph Paper</option>
          <option value="dot">Dot Grid</option>
          <option value="story">Story Paper</option>
          <option value="manuscript">Manuscript</option>
        </select>

        {/* Column Layout */}
        <label className="block text-[11px] text-ink-secondary mb-1">Column Layout</label>
        <div className="flex mb-3">
          {[1, 2, 3].map((col) => (
            <button
              key={col}
              onClick={() => handlePageSettingChange('columns', col)}
              className={`
                flex-1 h-8 text-[12px] font-medium transition-colors
                ${(worksheet.columns || 1) === col
                  ? 'bg-accent text-white'
                  : 'bg-canvas-dark text-ink-secondary hover:brightness-95'
                }
                ${col === 1 ? 'rounded-l-md' : col === 3 ? 'rounded-r-md' : ''}
              `}
            >
              {col} {col === 1 ? 'Column' : 'Columns'}
            </button>
          ))}
        </div>

        {/* Column gap */}
        {(worksheet.columns || 1) > 1 && (
          <div className="mb-3">
            <label className="block text-[11px] text-ink-secondary mb-1">Column Gap</label>
            <input
              type="range"
              min={8}
              max={72}
              value={worksheet.columnGap || 24}
              onChange={(e) => handlePageSettingChange('columnGap', parseInt(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="text-[10px] text-ink-tertiary text-right">{worksheet.columnGap || 24}px</div>
          </div>
        )}

        {/* Margins */}
        <label className="block text-[11px] text-ink-secondary mb-1">Margins</label>
        <div className="grid grid-cols-2 gap-2">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <div key={side}>
              <label className="block text-[10px] text-ink-tertiary capitalize">{side}</label>
              <input
                type="number"
                value={Math.round(worksheet.margins[side] / 72 * 100) / 100}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  const inches = Math.max(0, Math.min(2, val));
                  onUpdateWorksheet({
                    margins: { ...worksheet.margins, [side]: Math.round(inches * 72) },
                  });
                }}
                className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-2 py-1 text-ink outline-none focus:border-accent transition-colors"
                step={0.25}
                min={0}
                max={2}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border-light" />

      {/* Element Properties */}
      {selectedElement && (
        <>
          <section>
            <h3 className="text-[12px] font-semibold text-ink-secondary uppercase tracking-[0.06em] mb-3">
              Element — {getElementLabel(selectedElement.type)}
            </h3>

            {/* Content editing for text-based elements */}
            {(selectedElement.type === 'text' || selectedElement.type === 'heading' || selectedElement.type === 'questionBox' || selectedElement.type === 'multipleChoice' || selectedElement.type === 'fillInBlank') && (
              <div className="mb-3">
                <label className="block text-[11px] text-ink-secondary mb-1">Content</label>
                <ElementContentEditor element={selectedElement} onUpdate={onUpdateElement} />
              </div>
            )}

            {/* Font family */}
            {(selectedElement.type === 'text' || selectedElement.type === 'heading' || selectedElement.type === 'questionBox' || selectedElement.type === 'readingPassage') && (
              <div className="mb-3">
                <label className="block text-[11px] text-ink-secondary mb-1">Font</label>
                <select
                  value={(selectedElement as { fontFamily?: string }).fontFamily || 'Inter'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                  className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink outline-none focus:border-accent transition-colors"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Font size */}
            <div className="mb-3">
              <label className="block text-[11px] text-ink-secondary mb-1">Size</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const current = (selectedElement as { fontSize?: number }).fontSize || 14;
                    onUpdateElement(selectedElement.id, { fontSize: Math.max(8, current - 1) });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-canvas-dark text-ink-secondary transition-colors"
                >
                  <span className="text-[14px]">&minus;</span>
                </button>
                <input
                  type="number"
                  value={(selectedElement as { fontSize?: number }).fontSize || 14}
                  onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Math.max(8, Math.min(96, parseInt(e.target.value) || 14)) })}
                  className="w-20 text-[13px] bg-canvas-dark border border-border-light rounded-md px-2 py-1 text-ink outline-none focus:border-accent transition-colors text-center"
                  min={8}
                  max={96}
                />
                <button
                  onClick={() => {
                    const current = (selectedElement as { fontSize?: number }).fontSize || 14;
                    onUpdateElement(selectedElement.id, { fontSize: Math.min(96, current + 1) });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-canvas-dark text-ink-secondary transition-colors"
                >
                  <span className="text-[14px]">+</span>
                </button>
                <span className="text-[11px] text-ink-tertiary">px</span>
              </div>
            </div>

            {/* Font weight */}
            {(selectedElement.type === 'text' || selectedElement.type === 'heading') && (
              <div className="mb-3">
                <label className="block text-[11px] text-ink-secondary mb-1">Weight</label>
                <div className="flex">
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { fontWeight: 400 })}
                    className={`
                      flex-1 h-8 text-[12px] rounded-l-md transition-colors
                      ${(selectedElement as { fontWeight?: number }).fontWeight !== 700
                        ? 'bg-accent text-white'
                        : 'bg-canvas-dark text-ink-secondary'
                      }
                    `}
                  >
                    Regular
                  </button>
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { fontWeight: 700 })}
                    className={`
                      flex-1 h-8 text-[12px] font-bold rounded-r-md transition-colors
                      ${(selectedElement as { fontWeight?: number }).fontWeight === 700
                        ? 'bg-accent text-white'
                        : 'bg-canvas-dark text-ink-secondary'
                      }
                    `}
                  >
                    Bold
                  </button>
                </div>
              </div>
            )}

            {/* Line Height */}
            {(selectedElement.type === 'text' || selectedElement.type === 'heading' || selectedElement.type === 'readingPassage') && (
              <div className="mb-3">
                <label className="block text-[11px] text-ink-secondary mb-1">Line Height</label>
                <div className="flex">
                  {LINE_HEIGHTS.map((lh, i) => (
                    <button
                      key={lh.value}
                      onClick={() => onUpdateElement(selectedElement.id, { lineHeight: lh.value })}
                      className={`
                        flex-1 h-8 text-[12px] transition-colors
                        ${((selectedElement as { lineHeight?: number }).lineHeight || 1.5) === lh.value
                          ? 'bg-accent text-white'
                          : 'bg-canvas-dark text-ink-secondary hover:brightness-95'
                        }
                        ${i === 0 ? 'rounded-l-md' : i === LINE_HEIGHTS.length - 1 ? 'rounded-r-md' : ''}
                      `}
                    >
                      {lh.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text color */}
            <div className="mb-3">
              <ColorPicker
                label="Text Color"
                color={(selectedElement as { color?: string }).color || '#292524'}
                onChange={(color) => onUpdateElement(selectedElement.id, { color })}
              />
            </div>

            {/* Background color */}
            <div className="mb-3">
              <ColorPicker
                label="Background"
                color={(selectedElement as { backgroundColor?: string }).backgroundColor || 'transparent'}
                onChange={(bg) => onUpdateElement(selectedElement.id, { backgroundColor: bg === 'transparent' ? undefined : bg })}
                allowNone
              />
            </div>

            {/* Border toggle + style */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-ink-secondary">Border</label>
                <button
                  onClick={() => onUpdateElement(selectedElement.id, {
                    border: !(selectedElement as { border?: boolean }).border,
                  })}
                  className={`w-9 h-5 rounded-full transition-colors duration-150 relative ${(selectedElement as { border?: boolean }).border ? 'bg-accent' : 'bg-border-medium'}`}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150"
                    style={{ transform: (selectedElement as { border?: boolean }).border ? 'translateX(16px)' : 'translateX(0)', left: '2px' }}
                  />
                </button>
              </div>

              {(selectedElement as { border?: boolean }).border && (
                <>
                  {/* Border style */}
                  <select
                    value={(selectedElement as { borderStyle?: string }).borderStyle || 'solid'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy' })}
                    className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1 text-ink mb-2 outline-none focus:border-accent transition-colors"
                  >
                    {BORDER_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>

                  {/* Border width */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-ink-secondary w-12">Width</span>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={(selectedElement as { borderWidth?: number }).borderWidth || 1}
                      onChange={(e) => onUpdateElement(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-[10px] text-ink-tertiary w-6 text-right">
                      {(selectedElement as { borderWidth?: number }).borderWidth || 1}px
                    </span>
                  </div>

                  {/* Border radius */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-ink-secondary w-12">Radius</span>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={(selectedElement as { borderRadius?: number }).borderRadius || 0}
                      onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-[10px] text-ink-tertiary w-6 text-right">
                      {(selectedElement as { borderRadius?: number }).borderRadius || 0}px
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Text Align */}
            {(selectedElement.type === 'text' || selectedElement.type === 'heading') && (
              <div className="mb-3">
                <label className="block text-[11px] text-ink-secondary mb-1">Text Align</label>
                <div className="flex">
                  {TEXT_ALIGNS.map(({ icon: Icon, value }, i) => (
                    <button
                      key={value}
                      onClick={() => onUpdateElement(selectedElement.id, { textAlign: value as 'left' | 'center' | 'right' | 'justify' })}
                      className={`
                        flex-1 h-8 flex items-center justify-center transition-colors
                        ${((selectedElement as { textAlign?: string }).textAlign || 'left') === value
                          ? 'bg-accent text-white'
                          : 'bg-canvas-dark text-ink-secondary hover:brightness-95'
                        }
                        ${i === 0 ? 'rounded-l-md' : i === TEXT_ALIGNS.length - 1 ? 'rounded-r-md' : ''}
                      `}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rotation */}
            <div className="mb-3">
              <label className="block text-[11px] text-ink-secondary mb-1">Rotation</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={selectedElement.rotation || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    onUpdateElement(selectedElement.id, { rotation: ((val % 360) + 360) % 360 });
                  }}
                  className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink outline-none focus:border-accent transition-colors"
                  min={0}
                  max={360}
                  step={1}
                />
                <span className="text-[11px] text-ink-tertiary">&deg;</span>
              </div>
            </div>

            {/* Opacity */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-ink-secondary">Opacity</label>
                <span className="text-[10px] text-ink-tertiary">
                  {Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}
                onChange={(e) => onUpdateElement(selectedElement.id, { opacity: parseInt(e.target.value) / 100 })}
                className="w-full accent-accent"
              />
            </div>

            {/* Divider-specific: thickness and width */}
            {selectedElement.type === 'divider' && (
              <>
                <div className="mb-3">
                  <label className="block text-[11px] text-ink-secondary mb-1">Thickness</label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={(selectedElement as { thickness?: number }).thickness || 1}
                    onChange={(e) => onUpdateElement(selectedElement.id, { thickness: parseInt(e.target.value) })}
                    className="w-full accent-accent"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] text-ink-secondary mb-1">Width %</label>
                  <input
                    type="number"
                    value={Math.round((selectedElement.width) / selectedElement.width * 100)}
                    onChange={(e) => {
                      const pct = parseInt(e.target.value) || 100;
                      onUpdateElement(selectedElement.id, { width: Math.max(10, Math.round(selectedElement.width * pct / 100)) });
                    }}
                    className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink outline-none focus:border-accent transition-colors"
                    min={10}
                    max={100}
                  />
                </div>
              </>
            )}

            {/* Table-specific: border style, header bg, cell padding */}
            {selectedElement.type === 'table' && (
              <>
                <div className="mb-3">
                  <label className="block text-[11px] text-ink-secondary mb-1">Border Style</label>
                  <select
                    value={(selectedElement as { borderStyle?: string }).borderStyle || 'solid'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                    className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink outline-none focus:border-accent transition-colors"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] text-ink-secondary mb-1">Border Width</label>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    value={(selectedElement as { borderWidth?: number }).borderWidth || 1}
                    onChange={(e) => onUpdateElement(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
                    className="w-full accent-accent"
                  />
                </div>
                <div className="mb-3">
                  <ColorPicker
                    label="Header Background"
                    color={(selectedElement as { headerBg?: string }).headerBg || '#F0EBE0'}
                    onChange={(headerBg) => onUpdateElement(selectedElement.id, { headerBg })}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] text-ink-secondary mb-1">Cell Padding</label>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={(selectedElement as { cellPadding?: number }).cellPadding || 8}
                    onChange={(e) => onUpdateElement(selectedElement.id, { cellPadding: parseInt(e.target.value) })}
                    className="w-full accent-accent"
                  />
                </div>
              </>
            )}

            {/* Width & Height */}
            <div className="mb-3">
              <label className="block text-[11px] text-ink-secondary mb-1">Width (px)</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => onUpdateElement(selectedElement.id, { width: Math.max(40, parseInt(e.target.value) || 200) })}
                className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink outline-none focus:border-accent transition-colors"
                min={40}
              />
            </div>

            <div className="mb-3">
              <label className="block text-[11px] text-ink-secondary mb-1">Height (px)</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => onUpdateElement(selectedElement.id, { height: Math.max(20, parseInt(e.target.value) || 80) })}
                className="w-full text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-1.5 text-ink outline-none focus:border-accent transition-colors"
                min={20}
              />
            </div>
          </section>

          <div className="h-px bg-border-light" />

          {/* Arrangement */}
          <section>
            <h3 className="text-[12px] font-semibold text-ink-secondary uppercase tracking-[0.06em] mb-3">
              Arrangement
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onBringToFront(selectedElement.id)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-ink-secondary hover:bg-canvas-dark transition-colors"
              >
                <ArrowUpToLine className="w-4 h-4" strokeWidth={1.5} />
                Bring to Front
              </button>
              <button
                onClick={() => onSendToBack(selectedElement.id)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-ink-secondary hover:bg-canvas-dark transition-colors"
              >
                <ArrowDownToLine className="w-4 h-4" strokeWidth={1.5} />
                Send to Back
              </button>
              <button
                onClick={() => onDuplicate(selectedElement.id)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-ink-secondary hover:bg-canvas-dark transition-colors"
              >
                <Copy className="w-4 h-4" strokeWidth={1.5} />
                Duplicate
              </button>

              {/* Group Selected (UI placeholder) */}
              <button
                onClick={() => { /* TODO: multi-select grouping */ }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-ink-secondary hover:bg-canvas-dark transition-colors opacity-50 cursor-not-allowed"
                disabled
                title="Multi-select grouping coming soon"
              >
                <Group className="w-4 h-4" strokeWidth={1.5} />
                Group Selected
              </button>

              {/* Lock Position toggle */}
              <button
                onClick={() => onUpdateElement(selectedElement.id, {
                  groupId: selectedElement.groupId ? undefined : 'locked',
                })}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-ink-secondary hover:bg-canvas-dark transition-colors"
              >
                {selectedElement.groupId === 'locked' ? (
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Unlock className="w-4 h-4" strokeWidth={1.5} />
                )}
                {selectedElement.groupId === 'locked' ? 'Unlock Position' : 'Lock Position'}
              </button>

              <button
                onClick={() => onDelete(selectedElement.id)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-error hover:bg-error-bg transition-colors"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Delete
              </button>
            </div>
          </section>

          <div className="h-px bg-border-light" />
        </>
      )}

      {/* Grid Settings */}
      <section>
        <h3 className="text-[12px] font-semibold text-ink-secondary uppercase tracking-[0.06em] mb-3">
          Grid &amp; Snap
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-ink">Show grid</span>
          <button
            onClick={onToggleGrid}
            className={`w-9 h-5 rounded-full transition-colors duration-150 relative ${showGrid ? 'bg-accent' : 'bg-border-medium'}`}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150"
              style={{ transform: showGrid ? 'translateX(16px)' : 'translateX(0)', left: '2px' }}
            />
          </button>
        </div>

        <label className="block text-[11px] text-ink-secondary mb-1">Grid size</label>
        <div className="flex mb-3">
          {[
            { label: 'Coarse', size: 16 },
            { label: 'Normal', size: 8 },
            { label: 'Fine', size: 4 },
          ].map(({ label, size }) => (
            <button
              key={size}
              onClick={() => onSetGridSize(size)}
              className={`
                flex-1 h-8 text-[12px] transition-colors
                ${gridSize === size
                  ? 'bg-accent text-white'
                  : 'bg-canvas-dark text-ink-secondary hover:brightness-95'
                }
                ${size === 16 ? 'rounded-l-md' : size === 4 ? 'rounded-r-md' : ''}
              `}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink">Snap to grid</span>
          <button
            onClick={onToggleSnap}
            className={`w-9 h-5 rounded-full transition-colors duration-150 relative ${snapToGrid ? 'bg-accent' : 'bg-border-medium'}`}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150"
              style={{ transform: snapToGrid ? 'translateX(16px)' : 'translateX(0)', left: '2px' }}
            />
          </button>
        </div>
      </section>
    </div>
  );
}

/* Element-specific content editor */
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
    }
  };

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
      default:
        return '';
    }
  }, [element]);

  return (
    <textarea
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full min-h-[80px] text-[13px] bg-canvas-dark border border-border-light rounded-md px-3 py-2 text-ink outline-none focus:border-accent transition-colors resize-y"
      placeholder="Enter text here..."
    />
  );
}
