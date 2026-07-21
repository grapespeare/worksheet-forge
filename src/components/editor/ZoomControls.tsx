import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
}

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomFit }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-border-light px-2 py-1.5">
      <button
        onClick={onZoomOut}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-canvas-dark transition-colors duration-150"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} />
      </button>
      <span className="text-[12px] font-medium text-ink min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
      <button
        onClick={onZoomIn}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-canvas-dark transition-colors duration-150"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} />
      </button>
      <button
        onClick={onZoomFit}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-canvas-dark transition-colors duration-150"
        aria-label="Fit to width"
      >
        <Maximize2 className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} />
      </button>
    </div>
  );
}
