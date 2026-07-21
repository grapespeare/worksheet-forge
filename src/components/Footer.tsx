import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full bg-white border-t border-border-light py-8 px-6"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left — Brand */}
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-accent" strokeWidth={1.5} />
          <span className="text-[14px] font-medium text-ink">Worksheet Forge</span>
        </div>

        {/* Center — Tagline */}
        <p className="text-[12px] text-ink-tertiary">
          Made for educators &middot; No account needed &middot; Free to use
        </p>

        {/* Right — Links */}
        <div className="flex items-center gap-4">
          <button className="text-[12px] text-ink-secondary hover:text-accent transition-colors duration-150">
            Keyboard Shortcuts
          </button>
          <button className="text-[12px] text-ink-secondary hover:text-accent transition-colors duration-150">
            Help
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
