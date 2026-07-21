import { useView } from '@/context/ViewContext';
import {
  Home,
  LayoutGrid,
  Sparkles,
  FolderOpen,
  BarChart3,
} from 'lucide-react';

const tabs = [
  { view: 'home' as const, label: 'Home', Icon: Home },
  { view: 'templates' as const, label: 'Templates', Icon: LayoutGrid },
  { view: 'editor' as const, label: 'Create', Icon: Sparkles, isCreate: true },
  { view: 'home' as const, label: 'Sheets', Icon: FolderOpen, action: 'sheets' },
  { view: 'analytics' as const, label: 'Analytics', Icon: BarChart3 },
];

export default function MobileNav() {
  const { currentView, setCurrentView, navigateTo } = useView();

  const handleTab = (tab: (typeof tabs)[number]) => {
    if (tab.action === 'sheets') {
      // For now, navigate to home with a sheets focus
      setCurrentView('home');
      return;
    }
    if (tab.isCreate) {
      navigateTo('editor');
      return;
    }
    setCurrentView(tab.view);
  };

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.isCreate) return currentView === 'editor';
    if (tab.action === 'sheets') return false;
    return currentView === tab.view;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const { Icon } = tab;

          if (tab.isCreate) {
            return (
              <button
                key={tab.label}
                onClick={() => handleTab(tab)}
                className="relative -top-3 flex flex-col items-center justify-center"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    active ? 'bg-accent' : 'bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium text-ink-secondary mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.label}
              onClick={() => handleTab(tab)}
              className="flex flex-col items-center justify-center min-w-[56px] h-full active:scale-95 transition-transform select-none"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-accent' : 'text-ink-tertiary'
                }`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  active ? 'text-accent font-semibold' : 'text-ink-tertiary'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
