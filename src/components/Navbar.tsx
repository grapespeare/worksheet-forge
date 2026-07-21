import { motion } from 'framer-motion';
import {
  HelpCircle,
  PenTool,
  LogIn,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';
import { useView } from '@/context/ViewContext';
import { useState } from 'react';

export default function Navbar() {
  const { currentView, navigateTo, user, isLoading, signIn, signOut } = useView();
  const [showHelp, setShowHelp] = useState(false);

  const showNav = currentView === 'home' || currentView === 'templates';

  if (!showNav) return null;

  return (
    <motion.nav
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-border-light flex items-center justify-between px-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Left — Brand */}
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-150"
      >
        <div className="w-6 h-6 rounded-sm bg-accent flex items-center justify-center">
          <PenTool className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <span className="font-serif text-2xl text-ink tracking-[-0.01em]">Worksheet Forge</span>
      </button>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const el = document.getElementById('how-it-works');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-3 py-1.5 text-[13px] font-medium text-ink-secondary hover:bg-canvas-dark rounded-md transition-all duration-150"
        >
          How It Works
        </button>

        <div className="relative">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-ink-secondary hover:bg-canvas-dark rounded-md transition-all duration-150"
          >
            <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          {showHelp && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowHelp(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-20 w-56 bg-white rounded-lg shadow-xl border border-border-light py-2"
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                  Help & Resources
                </div>
                <button
                  onClick={() => { setShowHelp(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] text-ink hover:bg-canvas-dark transition-colors duration-100"
                >
                  Keyboard Shortcuts
                </button>
                <button
                  onClick={() => { setShowHelp(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] text-ink hover:bg-canvas-dark transition-colors duration-100"
                >
                  Getting Started
                </button>
                <div className="my-1 border-t border-border-light" />
                <div className="px-3 py-2 text-[12px] text-ink-tertiary leading-relaxed">
                  Worksheet Forge — a professional worksheet builder for educators, parents, tutors, and counselors.
                </div>
              </motion.div>
            </>
          )}
        </div>

        <div className="w-px h-5 bg-border-light mx-1" />

        {/* Auth */}
        {isLoading ? (
          <div className="px-3 py-1.5">
            <Loader2 className="w-4 h-4 animate-spin text-ink-secondary" strokeWidth={1.5} />
          </div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-ink-secondary">
              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline max-w-[100px] truncate">
                {user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-ink-secondary hover:text-error hover:bg-error/5 rounded-md transition-all duration-150"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors duration-150"
          >
            <LogIn className="w-4 h-4" strokeWidth={1.5} />
            Sign In
          </button>
        )}
      </div>
    </motion.nav>
  );
}
