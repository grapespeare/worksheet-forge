import { lazy, Suspense, useState, useCallback } from 'react';
import { ViewProvider, useView } from '@/context/ViewContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Editor from '@/pages/Editor';
import StudentWorksheet from '@/pages/StudentWorksheet';
import Analytics from '@/pages/Analytics';
import PWAProvider from '@/components/pwa/PWAProvider';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { exportToPDF, triggerPrint } from '@/lib/export';
import type { Worksheet } from '@/types/worksheet';
import type { ExportOptions } from '@/components/export/ExportModal';
import './styles/print.css';

/* Lazy-load heavy components */
const Templates = lazy(() => import('@/pages/Templates'));
const ExportModal = lazy(() => import('@/components/export/ExportModal'));
const PrintPreview = lazy(() => import('@/components/export/PrintPreview'));

function AppContent() {
  const { currentView } = useView();

  /* Check if this is a student worksheet view (/w/:shareId) */
  const pathShareId = window.location.pathname.match(/^\/w\/([^/]+)/)?.[1];
  if (pathShareId) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-canvas-bg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-ink-secondary text-sm">Loading worksheet...</p>
            </div>
          </div>
        }
      >
        <StudentWorksheet shareId={pathShareId} />
      </Suspense>
    );
  }

  /* Export modal state */
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  /* Mock worksheet for export modal (until editor provides real one) */
  const mockWorksheet: Worksheet = {
    id: 'mock-1',
    title: 'My Worksheet',
    pages: [{ elements: [] }],
    orientation: 'portrait',
    pageSize: 'letter',
    margins: { top: 72, right: 72, bottom: 72, left: 72 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleExportPDF = useCallback(
    async (worksheet: Worksheet, options: ExportOptions) => {
      await exportToPDF(worksheet, options);
    },
    []
  );

  const handlePrint = useCallback((worksheet: Worksheet) => {
    triggerPrint(worksheet);
  }, []);

  const handleOpenExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  /* Editor view: full-screen, no Layout wrapper */
  if (currentView === 'editor') {
    return (
      <>
        <Editor />
        {/* Export Modal - available from editor */}
        <Suspense fallback={null}>
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            worksheet={mockWorksheet}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
          />
        </Suspense>
        {/* Print Preview Overlay */}
        <Suspense fallback={null}>
          <PrintPreview
            isOpen={showPrintPreview}
            onClose={() => setShowPrintPreview(false)}
            worksheet={mockWorksheet}
            onExportPDF={handleOpenExport}
            onPrint={() => handlePrint(mockWorksheet)}
          />
        </Suspense>
        <InstallPrompt />
      </>
    );
  }

  return (
    <Layout>
      {currentView === 'home' && <Home />}

      {currentView === 'analytics' && <Analytics />}

      {currentView === 'templates' && (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-canvas-bg">
              <div className="text-center">
                <p className="text-ink-secondary text-[14px]">
                  Loading templates...
                </p>
              </div>
            </div>
          }
        >
          <Templates />
        </Suspense>
      )}
      <InstallPrompt />
    </Layout>
  );
}

export default function App() {
  return (
    <ViewProvider>
      <PWAProvider>
        <AppContent />
      </PWAProvider>
    </ViewProvider>
  );
}
