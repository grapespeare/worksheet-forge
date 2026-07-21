import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FileText,
  LayoutTemplate,
  MousePointerClick,
  SlidersHorizontal,
  Printer,
  BookOpen,
  Layout,
  MousePointer2,
  Type,
  Image,
  Shapes,
  Undo2,
  ArrowRight,
  X,
  Palette,
  LogIn,
} from 'lucide-react';
import { useView } from '@/context/ViewContext';
import { templates, categories } from '@/data/templates';
import { recentWorksheets } from '@/data/recentWorksheets';
import { formatDate } from '@/lib/worksheet';
import type { Category } from '@/data/templates';
import type { Worksheet } from '@/types/worksheet';
import TemplatePreview from '@/components/TemplatePreview';
import MyWorksheets from '@/components/share/MyWorksheets';
import Footer from '@/components/Footer';

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.06 },
  },
  viewport: { once: true, amount: 0.15 },
};

const staggerItem = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
};

const howItWorksSteps = [
  {
    icon: LayoutTemplate,
    title: 'Choose a starting point',
    description: 'Start from a blank page or pick from 76 templates across every subject — ELA, Art, Math, Science, and more.',
  },
  {
    icon: MousePointerClick,
    title: 'Add your content',
    description: 'Drag text, questions, tables, shapes, and more onto your page. Perfect for reading, writing, art, or any learning activity.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Arrange & customize',
    description: 'Resize, reposition, and style every element with the properties panel. Full creative control for any activity type.',
  },
  {
    icon: Printer,
    title: 'Print or export PDF',
    description: "Export a print-ready PDF or use your browser's print dialog. Crisp output every time.",
  },
];

const features = [
  { icon: BookOpen, title: 'Reading & Writing', description: 'Dedicated templates for reading comprehension, book reports, vocabulary, essays, and more ELA content.' },
  { icon: Palette, title: 'Visual Arts', description: 'Art critique forms, color wheels, drawing prompts, technique grids, and portfolio review sheets for art instruction.' },
  { icon: Layout, title: 'Any Layout', description: 'Portrait or landscape, custom margins, multiple page sizes — full control over the page.' },
  { icon: MousePointer2, title: 'Drag & Drop', description: 'Intuitive canvas with snap-to-grid, drag handles, and pixel-perfect positioning.' },
  { icon: Printer, title: 'Print-Ready', description: 'Export crisp PDFs optimized for standard printers. No formatting surprises.' },
  { icon: Type, title: 'Rich Text', description: 'Headings, paragraphs, multiple choice, fill-in-the-blank, tables, and equations.' },
  { icon: Image, title: 'Image Support', description: 'Add image placeholders for diagrams, maps, photos, or student drawing areas.' },
  { icon: Shapes, title: 'Visual Tools', description: 'Number lines, graph paper, handwriting guides, shapes, and geometric diagrams.' },
  { icon: Undo2, title: 'Full Undo/Redo', description: 'Unlimited undo/redo with keyboard shortcuts. Experiment without worry.' },
];

/* Category badge colors */
function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    ELA: 'text-discipline-ela bg-discipline-ela-light',
    Art: 'text-discipline-art bg-discipline-art-light',
    Math: 'text-discipline-math bg-discipline-math-light',
    Science: 'text-discipline-science bg-discipline-science-light',
    'Social Studies': 'text-discipline-social bg-discipline-social-light',
    General: 'text-discipline-general bg-discipline-general-light',
    Blank: 'text-ink-tertiary bg-stone-100',
  };
  return (
    <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 ${colorMap[category] || colorMap.General}`}>
      {category}
    </span>
  );
}

export default function Home() {
  const { navigateTo, user, signIn } = useView();
  const [activeFilter, setActiveFilter] = useState<Category>('All');
  const [showResume, setShowResume] = useState(true);

  const filteredTemplates = activeFilter === 'All'
    ? templates
    : templates.filter((t) => t.category === activeFilter);

  /* Featured rows - used for section ordering */

  return (
    <div className="flex flex-col min-h-[100dvh] pt-12">
      {/* ———————————— Section 2: Hero ———————————— */}
      <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-canvas-bg">
        {/* Decorative blobs */}
        <div
          className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] bg-accent-light rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-blob-drift-1"
          style={{ opacity: 0.2 }}
        />
        <div
          className="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-discipline-art-light rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-blob-drift-2"
          style={{ opacity: 0.12 }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-discipline-ela-light rounded-[50%_50%_20%_80%/25%_80%_20%_75%] animate-blob-drift-3"
          style={{ opacity: 0.1 }}
        />

        {/* Hero heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="font-serif text-[56px] leading-[1.1] tracking-[-0.02em] text-ink text-center relative z-10"
        >
          Worksheet Forge
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.3 }}
          className="text-[18px] text-ink-secondary text-center max-w-[580px] leading-relaxed mt-4 relative z-10"
        >
          Build beautiful, printable learning activities for any subject — reading, writing, visual arts, math, science, and more. Designed for educators, parents, tutors, and counselors.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut, delay: 0.5 }}
          className="flex flex-row gap-3 mt-8 relative z-10"
        >
          <button
            onClick={() => navigateTo('editor', null)}
            className="inline-flex items-center px-6 py-3 bg-accent text-white text-[15px] font-medium rounded-lg hover:bg-accent-hover hover:-translate-y-px active:scale-[0.98] transition-all duration-200"
            style={{ boxShadow: '0 4px 14px rgba(217, 119, 87, 0.35)' }}
          >
            <Plus className="w-[18px] h-[18px] mr-2" strokeWidth={1.5} />
            Start from Blank
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('templates-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center px-6 py-3 bg-white text-ink text-[15px] font-medium rounded-lg border border-border-medium hover:bg-canvas-dark transition-all duration-150"
          >
            Browse Templates
          </button>
        </motion.div>

        {/* Resume banner */}
        <AnimatePresence>
          {showResume && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: easeOut, delay: 1 }}
              className="mt-6 bg-accent-lightest border border-accent-light rounded-lg px-4 py-3 flex items-center gap-3 relative z-10"
            >
              <span className="text-[13px] text-ink">You have a worksheet in progress.</span>
              <button
                onClick={() => navigateTo('editor')}
                className="text-[13px] font-medium text-accent hover:underline transition-all duration-150"
              >
                Resume Work
              </button>
              <button
                onClick={() => setShowResume(false)}
                className="ml-2 text-ink-tertiary hover:text-ink transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ———————————— Section 3: Templates ———————————— */}
      <section id="templates-section" className="w-full bg-white py-16 px-6 border-t border-border-light">
        <div className="max-w-[1200px] mx-auto">
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.4, ease: easeOut }}
            className="font-serif text-[32px] tracking-[-0.01em] text-ink"
          >
            Start with a template
          </motion.h2>

          {/* Filter tabs */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.3, ease: easeOut, delay: 0.1 }}
            className="flex flex-wrap gap-2 mt-4 mb-8"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={
                  cat === activeFilter
                    ? 'px-4 py-1.5 rounded-full text-[13px] font-medium bg-accent text-white transition-all duration-150'
                    : 'px-4 py-1.5 rounded-full text-[13px] font-medium bg-canvas-dark text-ink-secondary hover:brightness-[0.97] transition-all duration-150'
                }
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Template grid — ELA & Art first if showing All */}
          <AnimatePresence mode="wait">
            {activeFilter === 'All' ? (
              /* When showing All, display ELA & Art first, then the rest */
              <motion.div
                key="all-prioritized"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* ELA & Art highlighted row */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-discipline-ela" strokeWidth={2} />
                    <span className="text-[13px] font-semibold text-ink">Reading & Writing</span>
                    <span className="text-[10px] text-ink-tertiary bg-discipline-ela-light rounded-full px-2 py-0.5">ELA</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templates.filter((t) => t.category === 'ELA').slice(0, 4).map((template) => (
                      <motion.div
                        key={template.id}
                        variants={staggerItem}
                        transition={{ duration: 0.3, ease: easeOut }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => navigateTo('editor', template.id)}
                        className="group bg-canvas-dark rounded-xl border border-border-light overflow-hidden cursor-pointer hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-discipline-ela/40 transition-all duration-200"
                      >
                        <div className="h-[180px] bg-white relative">
                          <div className="w-full h-full">
                            <TemplatePreview preview={template.preview} category={template.category} />
                          </div>
                          <div className="absolute inset-0 bg-discipline-ela-light opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                        </div>
                        <div className="px-3 pt-2 pb-3">
                          <p className="text-[14px] font-medium text-ink">{template.name}</p>
                          <div className="mt-1">
                            <CategoryBadge category={template.category} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Art Educators row */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-discipline-art" strokeWidth={2} />
                    <span className="text-[13px] font-semibold text-ink">Art & Creative</span>
                    <span className="text-[10px] text-ink-tertiary bg-discipline-art-light rounded-full px-2 py-0.5">Art</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templates.filter((t) => t.category === 'Art').slice(0, 4).map((template) => (
                      <motion.div
                        key={template.id}
                        variants={staggerItem}
                        transition={{ duration: 0.3, ease: easeOut }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => navigateTo('editor', template.id)}
                        className="group bg-canvas-dark rounded-xl border border-border-light overflow-hidden cursor-pointer hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-discipline-art/40 transition-all duration-200"
                      >
                        <div className="h-[180px] bg-white relative">
                          <div className="w-full h-full">
                            <TemplatePreview preview={template.preview} category={template.category} />
                          </div>
                          <div className="absolute inset-0 bg-discipline-art-light opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                        </div>
                        <div className="px-3 pt-2 pb-3">
                          <p className="text-[14px] font-medium text-ink">{template.name}</p>
                          <div className="mt-1">
                            <CategoryBadge category={template.category} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Remaining categories */}
                {['Math', 'Science', 'Social Studies', 'General', 'Blank'].map((cat) => {
                  const catTemplates = templates.filter((t) => t.category === cat).slice(0, 4);
                  if (catTemplates.length === 0) return null;
                  return (
                    <div key={cat} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-semibold text-ink">{cat}</span>
                        <span className="text-[10px] text-ink-tertiary bg-canvas-dark rounded-full px-2 py-0.5">{catTemplates.length}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {catTemplates.map((template) => (
                          <motion.div
                            key={template.id}
                            variants={staggerItem}
                            transition={{ duration: 0.3, ease: easeOut }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            onClick={() => navigateTo('editor', template.id)}
                            className="group bg-canvas-dark rounded-xl border border-border-light overflow-hidden cursor-pointer hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-accent/40 transition-all duration-200"
                          >
                            <div className="h-[180px] bg-white relative">
                              <div className="w-full h-full">
                                <TemplatePreview preview={template.preview} category={template.category} />
                              </div>
                              <div className="absolute inset-0 bg-accent-lightest opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                            </div>
                            <div className="px-3 pt-2 pb-3">
                              <p className="text-[14px] font-medium text-ink">{template.name}</p>
                              <div className="mt-1">
                                <CategoryBadge category={template.category} />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              /* Filtered view */
              <motion.div
                key={activeFilter}
                variants={staggerContainer}
                initial="initial"
                animate="whileInView"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    variants={staggerItem}
                    transition={{ duration: 0.3, ease: easeOut }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => navigateTo('editor', template.id)}
                    className="group bg-canvas-dark rounded-xl border border-border-light overflow-hidden cursor-pointer hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-accent/50 transition-all duration-200"
                  >
                    <div className="h-[180px] bg-white relative">
                      <div className="w-full h-full">
                        <TemplatePreview preview={template.preview} category={template.category} />
                      </div>
                      <div className="absolute inset-0 bg-accent-lightest opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                    </div>
                    <div className="px-3 pt-2 pb-3">
                      <p className="text-[14px] font-medium text-ink">{template.name}</p>
                      <div className="mt-1">
                        <CategoryBadge category={template.category} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* See all templates link */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigateTo('templates')}
              className="inline-flex items-center text-[14px] font-medium text-accent hover:text-accent-hover hover:underline transition-all duration-150"
            >
              See all templates
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ———————————— Section 4: Recent Worksheets ———————————— */}
      <section className="w-full bg-canvas-bg py-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.4, ease: easeOut }}
            className="font-serif text-[28px] tracking-[-0.01em] text-ink"
          >
            {user ? 'Your worksheets' : 'Your recent worksheets'}
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col gap-2 mt-6"
          >
            {user ? (
              /* Logged in: real data from Supabase */
              <MyWorksheets
                userId={user.id}
                onLoadWorksheet={(ws: Worksheet) => {
                  /* Pass worksheet ID via URL */
                  const url = new URL(window.location.href);
                  url.searchParams.set('load', ws.id);
                  window.history.replaceState({}, '', url.toString());
                  navigateTo('editor');
                }}
              />
            ) : (
              /* Not logged in: mock data */
              <>
                {recentWorksheets.map((ws, i) => (
                  <motion.div
                    key={ws.id}
                    variants={{
                      initial: { opacity: 0, x: -15 },
                      whileInView: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.25, ease: easeOut, delay: i * 0.08 }}
                    onClick={() => navigateTo('editor')}
                    className="bg-white rounded-lg border border-border-light px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-canvas-dark hover:border-border-medium transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[14px] font-medium text-ink">{ws.title}</span>
                      <span className="text-[11px] text-ink-secondary bg-canvas-dark rounded-full px-2 py-0.5">
                        {ws.pages.length} page{ws.pages.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-[12px] text-ink-tertiary">{formatDate(ws.updatedAt)}</span>
                  </motion.div>
                ))}
              </>
            )}

            {/* Sign-in prompt when not logged in */}
            {!user && (
              <motion.div
                variants={{
                  initial: { opacity: 0, x: -15 },
                  whileInView: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.25, ease: easeOut, delay: recentWorksheets.length * 0.08 }}
                className="bg-accent-lightest border border-accent-light rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  <span className="text-[13px] text-ink">Sign in to save and sync worksheets across devices</span>
                </div>
                <button
                  onClick={signIn}
                  className="text-[13px] font-medium text-accent hover:underline transition-all duration-150"
                >
                  Sign In
                </button>
              </motion.div>
            )}

            <motion.div
              variants={{
                initial: { opacity: 0, x: -15 },
                whileInView: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.25, ease: easeOut, delay: (recentWorksheets.length + 1) * 0.08 }}
              onClick={() => navigateTo('editor', null)}
              className="border-2 border-dashed border-border-light bg-canvas-bg rounded-lg px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-canvas-dark hover:border-border-medium transition-all duration-150"
            >
              <Plus className="w-[18px] h-[18px] text-ink-tertiary" strokeWidth={1.5} />
              <span className="text-[14px] font-medium text-ink-tertiary">Create new worksheet</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ———————————— Section 5: How It Works ———————————— */}
      <section id="how-it-works" className="w-full bg-white py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.4, ease: easeOut }}
            className="font-serif text-[32px] tracking-[-0.01em] text-ink text-center"
          >
            How it works
          </motion.h2>

          <div className="relative mt-12">
            <div className="hidden lg:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-border-light" />

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {howItWorksSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    variants={{
                      initial: { opacity: 0, y: 30 },
                      whileInView: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.4, ease: easeOut, delay: i * 0.15 }}
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        whileInView: { opacity: 1, scale: 1 },
                      }}
                      transition={{ duration: 0.3, ease: easeOut }}
                      className="w-10 h-10 rounded-full bg-accent-light border-2 border-accent flex items-center justify-center relative z-10"
                    >
                      <span className="font-serif text-[18px] text-accent">{i + 1}</span>
                    </motion.div>
                    <Icon className="w-8 h-8 text-ink-secondary mt-4" strokeWidth={1.5} />
                    <p className="text-[16px] font-semibold text-ink mt-3">{step.title}</p>
                    <p className="text-[13px] text-ink-secondary mt-2 max-w-[200px] leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ———————————— Section 6: Features Grid ———————————— */}
      <section className="w-full bg-canvas-bg py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, ease: easeOut }}
            className="text-center"
          >
            <h2 className="font-serif text-[32px] tracking-[-0.01em] text-ink">
              Built for every learning environment
            </h2>
            <p className="text-[15px] text-ink-secondary max-w-[540px] mx-auto mt-3 leading-relaxed">
              From kindergarten handwriting practice to high school art critique — one tool for every educator, parent, and tutor.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  transition={{ duration: 0.3, ease: easeOut, delay: i * 0.06 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  className="bg-white rounded-xl border border-border-light p-5 cursor-default hover:border-border-medium transition-all duration-200"
                >
                  <Icon className="w-6 h-6 text-accent mb-3" strokeWidth={1.5} />
                  <p className="text-[15px] font-semibold text-ink mb-1">{feature.title}</p>
                  <p className="text-[13px] text-ink-secondary leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ———————————— Section 7: Footer ———————————— */}
      <Footer />
    </div>
  );
}
