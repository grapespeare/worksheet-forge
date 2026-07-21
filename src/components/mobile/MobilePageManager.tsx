import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorksheetPage } from '@/types/worksheet';

interface MobilePageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pages: WorksheetPage[];
  currentPageIndex: number;
  onChangePage: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (index: number) => void;
}

export default function MobilePageManager({
  open,
  onOpenChange,
  pages,
  currentPageIndex,
  onChangePage,
  onAddPage,
  onRemovePage,
}: MobilePageManagerProps) {
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    if (pages.length <= 1) return;
    onRemovePage(index);
    setSwipedIndex(null);
    setShowDeleteConfirm(null);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[55vh] flex flex-col">
        <DrawerHeader className="pb-2 shrink-0 border-b border-border-light">
          <DrawerTitle className="text-base font-semibold flex items-center justify-between">
            <span>Pages ({pages.length})</span>
            <button
              onClick={() => {
                onAddPage();
                // Scroll to the new page after a brief delay
                setTimeout(() => {
                  const scroller = document.getElementById('page-manager-scroll');
                  if (scroller) scroller.scrollLeft = scroller.scrollWidth;
                }, 100);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-medium active:opacity-80 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              Add Page
            </button>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin' }}>
          {/* Horizontal scrolling page thumbnails */}
          <div
            id="page-manager-scroll"
            className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {pages.map((page, index) => {
              const isActive = index === currentPageIndex;
              const elementCount = page.elements?.length
                || page.sections?.reduce((acc, s) => acc + (s.elements?.length || 0), 0)
                || 0;

              return (
                <div
                  key={index}
                  className="snap-center shrink-0 relative"
                  style={{ width: 120 }}
                >
                  {/* Delete confirmation overlay */}
                  {showDeleteConfirm === index && (
                    <div className="absolute inset-0 z-20 bg-error-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                      <AlertTriangle className="w-6 h-6 text-error" strokeWidth={1.5} />
                      <span className="text-[11px] text-error font-medium text-center">Delete page {index + 1}?</span>
                      <div className="flex gap-1.5 w-full">
                        <button
                          onClick={() => handleRemove(index)}
                          className="flex-1 h-8 bg-error text-white rounded-lg text-[11px] font-medium active:opacity-80"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 h-8 bg-white text-ink rounded-lg text-[11px] font-medium border border-border-light"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Page thumbnail */}
                  <button
                    onClick={() => {
                      if (swipedIndex === index) {
                        setSwipedIndex(null);
                      } else {
                        onChangePage(index);
                        setSwipedIndex(null);
                      }
                    }}
                    className={cn(
                      'w-full aspect-[3/4] rounded-xl border-2 bg-white flex flex-col items-center justify-center transition-all active:scale-95 relative overflow-hidden',
                      isActive
                        ? 'border-accent shadow-md'
                        : 'border-border-light'
                    )}
                  >
                    {/* Mini page preview content */}
                    <div className="absolute inset-2 flex flex-col items-center justify-center gap-1">
                      {elementCount === 0 ? (
                        <span className="text-[10px] text-ink-tertiary">Empty</span>
                      ) : (
                        <>
                          <div className="w-full space-y-0.5">
                            {Array.from({ length: Math.min(4, elementCount) }).map((_, i) => (
                              <div
                                key={i}
                                className="h-1.5 rounded-sm bg-border-light"
                                style={{
                                  width: `${60 + Math.random() * 30}%`,
                                  marginLeft: `${Math.random() * 20}%`,
                                }}
                              />
                            ))}
                          </div>
                          {elementCount > 4 && (
                            <span className="text-[9px] text-ink-tertiary mt-0.5">
                              +{elementCount - 4} more
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Swipe delete button (visible when swiped) */}
                    {swipedIndex === index && pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(index);
                        }}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center shadow-md active:opacity-80 z-10"
                      >
                        <Trash2 className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </button>
                    )}
                  </button>

                  {/* Page number */}
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className={cn(
                      'text-[11px] font-medium',
                      isActive ? 'text-accent' : 'text-ink-secondary'
                    )}>
                      Page {index + 1}
                    </span>
                    {isActive && (
                      <span className="text-[9px] text-accent bg-accent-light px-1.5 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Swipe hint on inactive pages */}
                  {!isActive && pages.length > 1 && (
                    <button
                      onClick={() => setSwipedIndex(swipedIndex === index ? null : index)}
                      className="w-full text-center mt-0.5"
                    >
                      <span className="text-[9px] text-ink-tertiary">
                        {swipedIndex === index ? 'Tap thumbnail to cancel' : 'Tap to select, swipe icon to delete'}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Page stats */}
          <div className="mt-4 pt-4 border-t border-border-light space-y-2">
            <h4 className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
              Page Info
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-canvas-dark rounded-lg p-2.5">
                <span className="text-ink-tertiary">Total Pages</span>
                <p className="text-lg font-semibold text-ink mt-0.5">{pages.length}</p>
              </div>
              <div className="bg-canvas-dark rounded-lg p-2.5">
                <span className="text-ink-tertiary">Current</span>
                <p className="text-lg font-semibold text-ink mt-0.5">{currentPageIndex + 1}</p>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
