import { useState, useRef, useEffect } from 'react';

const PRESET_COLORS = [
  ['#292524', '#78716C', '#A8A29E', '#D97757', '#D95357', '#6BAA68'],
  ['#1C1917', '#44403C', '#E7E5E0', '#F3E5DD', '#FDECEC', '#E8F5E8'],
  ['#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626'],
  ['#C4B5FD', '#93C5FD', '#67E8F9', '#6EE7B7', '#FCD34D', '#FCA5A5'],
];

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  allowNone?: boolean;
}

export default function ColorPicker({ label, color, onChange, allowNone }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-[11px] text-ink-secondary mb-1">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full"
      >
        <div
          className="w-6 h-6 rounded-full border border-border-light flex-shrink-0"
          style={{
            background: color === 'transparent' ? 'repeating-linear-gradient(45deg, #A8A29E, #A8A29E 1px, transparent 1px, transparent 4px)' : color,
          }}
        />
        <span className="text-[12px] text-ink-secondary">{color === 'transparent' ? 'None' : color}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-border-light p-3 w-[200px]">
          <div className="grid grid-cols-6 gap-1.5">
            {allowNone && (
              <button
                key="none"
                onClick={() => { onChange('transparent'); setOpen(false); }}
                className="w-5 h-5 rounded-full border border-border-light"
                style={{ background: 'repeating-linear-gradient(45deg, #A8A29E, #A8A29E 1px, transparent 1px, transparent 4px)' }}
                title="None"
              />
            )}
            {PRESET_COLORS.flat().map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setOpen(false); }}
                className="w-5 h-5 rounded-full border border-border-light hover:scale-110 transition-transform"
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border-light">
            <input
              type="text"
              placeholder="#D97757"
              value={color === 'transparent' ? '' : color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full text-[12px] px-2 py-1 rounded-md bg-canvas-dark border border-border-light text-ink"
            />
          </div>
        </div>
      )}
    </div>
  );
}
