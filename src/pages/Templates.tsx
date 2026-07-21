import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  X,
  Plus,
  Check,
  Maximize2,
  SearchX,
  Loader2,
  BookOpen,
  Palette,
  Calculator,
  FlaskConical,
  Globe,
  FileText,
  Sparkles,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { useView } from '@/context/ViewContext';
import { templates } from '@/data/templates';
import TemplatePreview from '@/components/TemplatePreview';

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalleryTemplate {
  id: string;
  name: string;
  discipline: string;
  gradeLevel: string;
  layoutType: string;
  orientation: 'portrait' | 'landscape';
  pageSize: string;
  description: string;
  elementCount: number;
  preview: string;
  category: string;
}

/* ------------------------------------------------------------------ */
/*  Discipline config                                                  */
/* ------------------------------------------------------------------ */

interface DisciplineConfig {
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}

const disciplineConfig: Record<string, DisciplineConfig> = {
  ELA: { color: 'text-discipline-ela', bg: 'bg-discipline-ela-light', border: 'border-discipline-ela/30', icon: BookOpen },
  Art: { color: 'text-discipline-art', bg: 'bg-discipline-art-light', border: 'border-discipline-art/30', icon: Palette },
  Math: { color: 'text-discipline-math', bg: 'bg-discipline-math-light', border: 'border-discipline-math/30', icon: Calculator },
  Science: { color: 'text-discipline-science', bg: 'bg-discipline-science-light', border: 'border-discipline-science/30', icon: FlaskConical },
  'Social Studies': { color: 'text-discipline-social', bg: 'bg-discipline-social-light', border: 'border-discipline-social/30', icon: Globe },
  General: { color: 'text-discipline-general', bg: 'bg-discipline-general-light', border: 'border-discipline-general/30', icon: FileText },
  Blank: { color: 'text-ink-tertiary', bg: 'bg-stone-100', border: 'border-stone-300/30', icon: FileText },
};

const allDisciplines = [
  'All', 'ELA', 'Art', 'Math', 'Science', 'Social Studies', 'General', 'Blank',
];

const disciplineIcons: Record<string, React.ElementType> = {
  All: Sparkles,
  ELA: BookOpen,
  Art: Palette,
  Math: Calculator,
  Science: FlaskConical,
  'Social Studies': Globe,
  General: FileText,
  Blank: FileText,
};

/* ------------------------------------------------------------------ */
/*  Featured templates selection                                       */
/* ------------------------------------------------------------------ */

const featuredIds = [
  'ela-r-1',   // Reading Comprehension
  'ela-r-4',   // Character Analysis
  'ela-r-8',   // Compare & Contrast
  'art-1',     // Art Critique — Feldman
  'art-4',     // Elements of Art
  'art-8',     // Technique Practice
];

/* ------------------------------------------------------------------ */
/*  Convert legacy templates to gallery format                         */
/* ------------------------------------------------------------------ */

function adaptTemplates(): GalleryTemplate[] {
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    discipline: t.category === 'Blank' ? 'General' : t.category,
    category: t.category,
    gradeLevel: 'All',
    layoutType: 'Mixed',
    orientation: 'portrait' as const,
    pageSize: 'letter',
    description: t.description,
    elementCount: t.elementCount,
    preview: t.preview,
  }));
}

/* ------------------------------------------------------------------ */
/*  Helper: highlight matching text                                    */
/* ------------------------------------------------------------------ */

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-accent-light text-accent font-medium rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Category badge color                                               */
/* ------------------------------------------------------------------ */

function CategoryBadge({ category }: { category: string }) {
  const config = disciplineConfig[category];
  if (!config) {
    return (
      <span className="inline-flex items-center text-[11px] text-ink-tertiary bg-stone-100 rounded-full px-2 py-0.5">
        {category}
      </span>
    );
  }
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 ${config.color} ${config.bg}`}>
      <Icon className="w-3 h-3" strokeWidth={2} />
      {category}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini paper preview for the drawer                                  */
/* ------------------------------------------------------------------ */

function MiniPaperPreview({ template }: { template: GalleryTemplate }) {
  return (
    <div
      className="bg-white rounded-sm shadow-md overflow-hidden mx-auto"
      style={{
        width: template.orientation === 'landscape' ? 340 : 300,
        height: template.orientation === 'landscape' ? 240 : 390,
        padding: 20,
      }}
    >
      <div className="w-full h-full opacity-30">
        <TemplatePreview preview={template.preview} category={template.category} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Templates() {
  const { navigateTo, setCurrentView } = useView();
  const [activeDiscipline, setActiveDiscipline] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<GalleryTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHeroBanner, setShowHeroBanner] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const galleryTemplates = useMemo(() => adaptTemplates(), []);

  /* Filtering */
  const filteredTemplates = useMemo(() => {
    let result = galleryTemplates;

    if (activeDiscipline !== 'All') {
      result = result.filter((t) =>
        activeDiscipline === 'General' && t.category === 'Blank'
          ? true
          : t.discipline === activeDiscipline
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [galleryTemplates, activeDiscipline, searchQuery]);

  /* Featured templates */
  const featuredTemplates = useMemo(
    () => galleryTemplates.filter((t) => featuredIds.includes(t.id)),
    [galleryTemplates]
  );

  /* Group by discipline for category view */
  const grouped = useMemo(() => {
    const groups: Record<string, GalleryTemplate[]> = {};
    for (const t of filteredTemplates) {
      const d = t.discipline;
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    }
    return groups;
  }, [filteredTemplates]);

  const disciplineOrder = allDisciplines.filter(
    (d) => d !== 'All' && grouped[d] && grouped[d].length > 0
  );

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (selectedTemplate) {
          setSelectedTemplate(null);
        } else {
          setCurrentView('editor');
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('template-search')?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedTemplate, setCurrentView]);

  const handleUseTemplate = useCallback(
    (template: GalleryTemplate) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSelectedTemplate(null);
        navigateTo('editor', template.id);
      }, 600);
    },
    [navigateTo]
  );

  const handleBlankStart = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigateTo('editor', null);
    }, 400);
  }, [navigateTo]);

  const clearFilters = useCallback(() => {
    setActiveDiscipline('All');
    setSearchQuery('');
  }, []);

  const toggleGroup = useCallback((group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* Suggestions for empty state */
  const suggestions = useMemo(() => {
    if (filteredTemplates.length === 0 && searchQuery) {
      const q = searchQuery.toLowerCase();
      if (q.includes('art') || q.includes('draw') || q.includes('paint')) return 'Art';
      if (q.includes('read') || q.includes('book') || q.includes('write') || q.includes('essay')) return 'ELA';
      if (q.includes('math') || q.includes('number') || q.includes('equation')) return 'Math';
      if (q.includes('science') || q.includes('lab') || q.includes('experiment')) return 'Science';
      if (q.includes('history') || q.includes('map') || q.includes('geo')) return 'Social Studies';
    }
    return null;
  }, [filteredTemplates.length, searchQuery]);

  return (
    <div className="min-h-[100dvh] bg-canvas-bg pt-12">
      {/* ───────── Hero Banner (dismissible) ───────── */}
      <AnimatePresence>
        {showHeroBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="w-full bg-accent-lightest border-b border-accent-light overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-ink leading-snug">
                  <span className="font-medium">English Language Arts &amp; Art</span> — Now with dedicated templates for reading comprehension, writing, and visual arts
                </p>
              </div>
              <button
                onClick={() => setShowHeroBanner(false)}
                className="text-ink-tertiary hover:text-ink transition-colors p-1 flex-shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────── Gallery Header ───────── */}
      <div className="w-full px-8 pt-10 pb-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="font-serif text-[36px] tracking-[-0.01em] text-ink"
            >
              Template Gallery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: easeOut, delay: 0.15 }}
              className="text-[15px] text-ink-secondary mt-2 max-w-[480px]"
            >
              Choose a starting point, then customize every detail. 76 templates across 7 disciplines.
            </motion.p>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: easeOut, delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" strokeWidth={1.5} />
            <input
              id="template-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-[280px] max-w-full bg-white border border-border-light rounded-lg pl-10 pr-4 py-2.5 text-[13px] text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_#F3E5DD] transition-all duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ───────── Filter Bar with Icons ───────── */}
      <div className="w-full px-8 pb-4">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: easeOut, delay: 0.1 }}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            {allDisciplines.map((discipline) => {
              const Icon = disciplineIcons[discipline] || FileText;
              const isActive = discipline === activeDiscipline;
              return (
                <button
                  key={discipline}
                  onClick={() => setActiveDiscipline(discipline)}
                  className={
                    isActive
                      ? 'flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-accent text-white transition-all duration-150 flex-shrink-0'
                      : 'flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-white text-ink border border-border-light hover:bg-canvas-dark transition-all duration-150 flex-shrink-0'
                  }
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {discipline}
                </button>
              );
            })}

            {(activeDiscipline !== 'All' || searchQuery) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-[12px] text-ink-tertiary hover:text-error transition-colors duration-150 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                Clear
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ───────── Featured Section (top of gallery) ───────── */}
      {activeDiscipline === 'All' && !searchQuery && (
        <div className="w-full px-8 pb-6">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-accent" strokeWidth={2} />
                <h2 className="text-[16px] font-semibold text-ink">Featured: ELA &amp; Art</h2>
                <span className="ml-1 text-[10px] font-bold text-white bg-accent rounded-full px-2 py-0.5">NEW</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {featuredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => handleUseTemplate(template)}
                    className="group bg-white rounded-xl border border-accent/30 overflow-hidden cursor-pointer hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-accent transition-all duration-200"
                  >
                    <div className="h-[140px] bg-white relative p-2">
                      <div className="w-full h-full">
                        <TemplatePreview preview={template.preview} category={template.category} />
                      </div>
                      <div className="absolute inset-0 bg-accent-lightest opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                    </div>
                    <div className="px-2.5 pt-1.5 pb-2.5 border-t border-border-light">
                      <p className="text-[12px] font-medium text-ink truncate">{template.name}</p>
                      <div className="mt-1">
                        <CategoryBadge category={template.category} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ───────── Template Groups ───────── */}
      <div className="w-full px-8 pb-12">
        <div className="max-w-[1400px] mx-auto">
          {filteredTemplates.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <SearchX className="w-12 h-12 text-ink-tertiary mb-4" strokeWidth={1} />
              <p className="text-[16px] font-medium text-ink mb-2">No templates found</p>
              <p className="text-[13px] text-ink-secondary mb-4">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              {suggestions && (
                <button
                  onClick={() => {
                    setActiveDiscipline(suggestions);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1 text-[13px] text-accent hover:underline"
                >
                  Try <CategoryBadge category={suggestions} /> templates
                </button>
              )}
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium bg-accent text-white hover:bg-accent-hover transition-all"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                Clear filters
              </button>
            </motion.div>
          ) : (
            disciplineOrder.map((discipline) => {
              const groupTemplates = grouped[discipline] || [];
              const isCollapsed = collapsedGroups[discipline];
              const Icon = disciplineIcons[discipline] || FileText;

              return (
                <div key={discipline} className="mb-6">
                  {/* Sticky category header */}
                  <button
                    onClick={() => toggleGroup(discipline)}
                    className="sticky top-12 z-10 w-full flex items-center gap-2 py-2 px-3 -mx-3 mb-3 rounded-lg hover:bg-canvas-dark transition-colors"
                  >
                    <Icon className="w-4 h-4 text-ink-secondary" strokeWidth={2} />
                    <h3 className="text-[14px] font-semibold text-ink">{discipline}</h3>
                    <span className="text-[11px] text-ink-tertiary bg-white rounded-full px-2 py-0.5 ml-1">
                      {groupTemplates.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-ink-tertiary ml-auto" strokeWidth={2} />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-ink-tertiary ml-auto" strokeWidth={2} />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: easeOut }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {groupTemplates.map((template) => (
                            <motion.div
                              key={template.id}
                              layout
                              whileHover={{ y: -4, transition: { duration: 0.2 } }}
                              onClick={() => setSelectedTemplate(template)}
                              className="group bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-accent/50 transition-all duration-200 relative"
                            >
                              {/* Preview area */}
                              <div className="h-[200px] bg-white relative p-3">
                                <div className="w-full h-full">
                                  <TemplatePreview preview={template.preview} category={template.category} />
                                </div>
                                <div className="absolute inset-0 bg-accent-lightest opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                                {/* Quick Use button on hover */}
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUseTemplate(template);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent text-white text-[11px] font-medium rounded-md shadow-sm hover:bg-accent-hover transition-colors"
                                  >
                                    <Zap className="w-3 h-3" strokeWidth={2} />
                                    Use
                                  </button>
                                </div>
                                {/* Favorite star */}
                                <button
                                  onClick={(e) => toggleFavorite(e, template.id)}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                >
                                  <Star
                                    className={`w-4 h-4 ${favorites.has(template.id) ? 'text-amber-400 fill-amber-400' : 'text-ink-tertiary hover:text-amber-400'}`}
                                    strokeWidth={1.5}
                                  />
                                </button>
                              </div>
                              {/* Info area */}
                              <div className="px-3 pt-2 pb-3 border-t border-border-light">
                                <p className="text-[14px] font-medium text-ink group-hover:text-accent transition-colors truncate">
                                  <HighlightedText text={template.name} query={searchQuery} />
                                </p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <CategoryBadge category={template.discipline === 'General' && template.id === 'blank-1' ? 'Blank' : template.discipline} />
                                  <span className="text-[10px] text-ink-tertiary">{template.elementCount} elements</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ───────── Floating blank-start FAB ───────── */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        onClick={handleBlankStart}
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 px-5 py-3 bg-ink text-white text-[14px] font-medium rounded-full shadow-lg hover:bg-ink-secondary transition-colors z-30"
      >
        <Plus className="w-[18px] h-[18px]" strokeWidth={1.5} />
        Blank Canvas
      </motion.button>

      {/* ───────── Template Detail Drawer ───────── */}
      <AnimatePresence>
        {selectedTemplate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedTemplate(null)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-ink-tertiary hover:text-ink transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <div>
                    <h2 className="text-[16px] font-semibold text-ink">{selectedTemplate.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={selectedTemplate.discipline === 'General' && selectedTemplate.id === 'blank-1' ? 'Blank' : selectedTemplate.discipline} />
                      <span className="text-[11px] text-ink-tertiary">{selectedTemplate.elementCount} elements</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-ink-tertiary hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Preview */}
                <div className="mb-6 flex justify-center">
                  <MiniPaperPreview template={selectedTemplate} />
                </div>

                {/* Description */}
                <p className="text-[14px] text-ink-secondary leading-relaxed mb-6">
                  {selectedTemplate.description}
                </p>

                {/* Element summary */}
                <div className="bg-canvas-dark rounded-xl p-4 mb-6">
                  <h3 className="text-[13px] font-semibold text-ink mb-3">Template includes:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: Math.min(selectedTemplate.elementCount, 8) }, (_, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-ink-secondary">
                        <Check className="w-3.5 h-3.5 text-success" strokeWidth={2} />
                        {['Heading', 'Text block', 'Question box', 'Multiple choice', 'Fill-in-blank', 'Table', 'Image area', 'Divider'][i] || `Element ${i + 1}`}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Properties */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-canvas-dark rounded-lg p-3 text-center">
                    <p className="text-[11px] text-ink-tertiary mb-1">Orientation</p>
                    <p className="text-[13px] font-medium text-ink capitalize">{selectedTemplate.orientation}</p>
                  </div>
                  <div className="bg-canvas-dark rounded-lg p-3 text-center">
                    <p className="text-[11px] text-ink-tertiary mb-1">Page Size</p>
                    <p className="text-[13px] font-medium text-ink uppercase">{selectedTemplate.pageSize}</p>
                  </div>
                  <div className="bg-canvas-dark rounded-lg p-3 text-center">
                    <p className="text-[11px] text-ink-tertiary mb-1">Layout</p>
                    <p className="text-[13px] font-medium text-ink">{selectedTemplate.layoutType}</p>
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-border-light px-6 py-4 flex items-center gap-3 flex-shrink-0 bg-white">
                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-accent text-white text-[14px] font-medium rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Use This Template
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-3 border border-border-light text-ink text-[14px] font-medium rounded-lg hover:bg-canvas-dark transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ───────── Loading overlay ───────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[60] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2} />
              <p className="text-[14px] text-ink-secondary">Loading template...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
