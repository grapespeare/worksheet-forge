import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Worksheet, WorksheetElement } from '@/types/worksheet';
import StudentElement from '@/components/student/StudentElement';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Save,
  Send,
  User,
  FileText,
} from 'lucide-react';

/* ─── Types ─── */

interface StudentWorksheetProps {
  shareId: string;
}

type Status = 'loading' | 'error' | 'ready' | 'submitted';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/* ─── Helpers ─── */

function getInteractiveElements(pages: { elements?: WorksheetElement[] }[]): WorksheetElement[] {
  const interactiveTypes = new Set([
    'questionBox',
    'multipleChoice',
    'fillInBlank',
    'table',
    'vocabularyBox',
    'drawingPrompt',
  ]);
  const elements: WorksheetElement[] = [];
  for (const page of pages) {
    for (const el of page.elements || []) {
      if (interactiveTypes.has(el.type)) {
        elements.push(el);
      }
    }
  }
  return elements;
}

function calculateProgress(answers: Record<string, string>, elements: WorksheetElement[]): number {
  if (elements.length === 0) return 0;
  let answered = 0;
  for (const el of elements) {
    const ans = answers[el.id];
    if (!ans || ans.trim() === '' || ans === '[]' || ans === '{}') continue;
    // For fillInBlank, check if any blank is filled
    if (el.type === 'fillInBlank') {
      try {
        const parsed = JSON.parse(ans) as string[];
        if (parsed.some((s) => s.trim() !== '')) answered++;
      } catch { /* ignore */ }
      continue;
    }
    // For vocabularyBox, check if either field is filled
    if (el.type === 'vocabularyBox') {
      try {
        const parsed = JSON.parse(ans) as { definition: string; sentence: string };
        if (parsed.definition?.trim() || parsed.sentence?.trim()) answered++;
      } catch { /* ignore */ }
      continue;
    }
    answered++;
  }
  return Math.round((answered / elements.length) * 100);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/* ─── localStorage helpers ─── */

function getLocalStorageKey(shareId: string): string {
  return `worksheet-forge-student-${shareId}`;
}

function loadFromLocal(shareId: string): { studentName: string; answers: Record<string, string> } | null {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(shareId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToLocal(shareId: string, studentName: string, answers: Record<string, string>) {
  try {
    localStorage.setItem(getLocalStorageKey(shareId), JSON.stringify({ studentName, answers }));
  } catch { /* ignore */ }
}

function clearLocal(shareId: string) {
  localStorage.removeItem(getLocalStorageKey(shareId));
}

/* ─── Main Component ─── */

export default function StudentWorksheet({ shareId }: StudentWorksheetProps) {
  /* State */
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string>('');
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentNameSubmitted, setStudentNameSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [responseId, setResponseId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string>('');

  /* Timer */
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  /* Debounce refs */
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  const studentNameRef = useRef(studentName);
  const worksheetRef = useRef(worksheet);
  const responseIdRef = useRef(responseId);

  /* Keep refs in sync */
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { studentNameRef.current = studentName; }, [studentName]);
  useEffect(() => { worksheetRef.current = worksheet; }, [worksheet]);
  useEffect(() => { responseIdRef.current = responseId; }, [responseId]);

  /* Interactive elements */
  const interactiveElements = useMemo(
    () => (worksheet ? getInteractiveElements(worksheet.pages) : []),
    [worksheet]
  );
  const progress = useMemo(
    () => calculateProgress(answers, interactiveElements),
    [answers, interactiveElements]
  );

  /* Fetch worksheet on mount */
  useEffect(() => {
    let cancelled = false;

    async function fetchWorksheet() {
      try {
        const { data, error: supaError } = await supabase
          .from('worksheets')
          .select('*')
          .eq('public_share_id', shareId)
          .eq('is_public', true)
          .single();

        if (cancelled) return;

        if (supaError || !data) {
          setError('Worksheet not found. It may have been removed or is not public.');
          setStatus('error');
          return;
        }

        const ws: Worksheet = {
          id: data.id,
          title: data.title || 'Untitled Worksheet',
          pages: data.pages || [{ elements: [] }],
          orientation: data.orientation || 'portrait',
          pageSize: data.page_size || 'letter',
          margins: data.margins || { top: 72, right: 72, bottom: 72, left: 72 },
          pageBackground: data.page_background || 'blank',
          columns: data.columns || 1,
          columnGap: data.column_gap || 24,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setWorksheet(ws);

        /* Try to restore from localStorage */
        const local = loadFromLocal(shareId);
        if (local) {
          setStudentName(local.studentName || '');
          setAnswers(local.answers || {});
          if (local.studentName?.trim()) {
            setStudentNameSubmitted(true);
            startTimer();
          }
        }

        /* Try to fetch existing response */
        const { data: respData } = await supabase
          .from('student_responses')
          .select('*')
          .eq('worksheet_id', data.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (respData) {
          setResponseId(respData.id);
          if (respData.student_name) {
            setStudentName(respData.student_name);
            studentNameRef.current = respData.student_name;
            if (!local?.studentName) {
              setStudentNameSubmitted(true);
              startTimer();
            }
          }
          if (respData.responses && typeof respData.responses === 'object') {
            setAnswers((prev) => ({ ...prev, ...respData.responses }));
          }
          if (respData.completion_status === 'submitted') {
            setSubmittedAt(respData.submitted_at || respData.updated_at);
            setStatus('submitted');
            return;
          }
        }

        setStatus('ready');
      } catch {
        if (!cancelled) {
          setError('Failed to load worksheet. Please try again.');
          setStatus('error');
        }
      }
    }

    fetchWorksheet();

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  /* Timer helpers */
  function startTimer() {
    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopTimer();
  }, []);

  /* Debounced save to Supabase */
  const saveToSupabase = useCallback(async () => {
    const ws = worksheetRef.current;
    const name = studentNameRef.current.trim();
    if (!ws || !name) return;

    setSaveStatus('saving');

    try {
      const payload = {
        worksheet_id: ws.id,
        student_name: name,
        responses: answersRef.current,
        completion_status: 'in-progress',
      };

      const existingId = responseIdRef.current;
      let result;

      if (existingId) {
        result = await supabase
          .from('student_responses')
          .update(payload)
          .eq('id', existingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('student_responses')
          .insert(payload)
          .select()
          .single();
      }

      if (result.data?.id) {
        setResponseId(result.data.id);
        responseIdRef.current = result.data.id;
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, []);

  /* Auto-save on answer change (debounced) */
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase();
    }, 500);
  }, [saveToSupabase]);

  const handleAnswerChange = useCallback((elementId: string, answer: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [elementId]: answer };
      answersRef.current = updated;
      return updated;
    });
    saveToLocal(shareId, studentNameRef.current, answersRef.current);
    if (studentNameRef.current.trim()) {
      triggerAutoSave();
    }
  }, [shareId, triggerAutoSave]);

  /* Name submission */
  const handleNameSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const name = studentName.trim();
    if (!name) return;
    setStudentNameSubmitted(true);
    startTimer();
    saveToLocal(shareId, name, answers);
    saveToSupabase();
  }, [studentName, answers, shareId, saveToSupabase]);

  /* Final submission */
  const handleSubmit = useCallback(async () => {
    if (!responseIdRef.current) {
      /* If no responseId yet, save first */
      await saveToSupabase();
    }
    const id = responseIdRef.current;
    if (!id) return;

    try {
      await supabase
        .from('student_responses')
        .update({
          responses: answersRef.current,
          completion_status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id);

      setSubmittedAt(new Date().toISOString());
      stopTimer();
      clearLocal(shareId);
      setShowConfirm(false);
      setStatus('submitted');
    } catch {
      setSaveStatus('error');
    }
  }, [shareId, saveToSupabase]);

  /* Cleanup debounce on unmount */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  /* ─── Render: Loading ─── */
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
          <p className="text-ink-secondary text-sm">Loading worksheet...</p>
        </div>
      </div>
    );
  }

  /* ─── Render: Error ─── */
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-ink mb-2">Unable to Load Worksheet</h2>
          <p className="text-ink-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ─── Render: Submitted ─── */
  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-discipline-math-light flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">
            Thank you, {studentName}!
          </h2>
          <p className="text-ink-secondary text-sm mb-6">
            Your worksheet has been submitted successfully.
          </p>

          <div className="bg-white rounded-xl border border-border-light p-5 mb-6 text-left">
            <h3 className="text-sm font-semibold text-ink mb-3">Submission Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Worksheet
                </span>
                <span className="font-medium text-ink">{worksheet?.title}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Questions Answered
                </span>
                <span className="font-medium text-ink">
                  {calculateProgress(answers, interactiveElements)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Time Spent
                </span>
                <span className="font-medium text-ink">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
              {submittedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary flex items-center gap-2">
                    <Send className="w-4 h-4" /> Submitted
                  </span>
                  <span className="font-medium text-ink">
                    {new Date(submittedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  /* ─── Render: Ready ─── */
  if (!worksheet) return null;

  return (
    <div className="min-h-screen bg-canvas-bg">
      {/* ─── Top: Student Name Input ─── */}
      <div className="sticky top-0 z-50 bg-white border-b border-border-light shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {!studentNameSubmitted ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-ink">
                <User className="w-5 h-5 text-accent" />
                <label htmlFor="student-name" className="text-sm font-medium whitespace-nowrap">
                  Your Name
                </label>
              </div>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name to start..."
                className="flex-1 px-3 py-2 text-sm border border-border-light rounded-md
                           focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                           bg-white text-ink placeholder:text-ink-tertiary"
                autoFocus
              />
              <button
                type="submit"
                disabled={!studentName.trim()}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-md
                           hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink">
                <User className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{studentName}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(elapsedSeconds)}</span>
                </div>
                {/* Save indicator */}
                <div className="flex items-center gap-1 text-xs">
                  {saveStatus === 'saving' && (
                    <>
                      <Save className="w-3.5 h-3.5 text-ink-tertiary animate-pulse" />
                      <span className="text-ink-tertiary">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span className="text-success">All changes saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-error" />
                      <span className="text-error">Save failed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Worksheet Content ─── */}
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Title */}
        <h1 className="font-serif text-[28px] font-bold text-ink text-center mb-8 leading-tight">
          {worksheet.title}
        </h1>

        {/* Pages */}
        {worksheet.pages.map((page, pageIdx) => (
          <div key={pageIdx} className="mb-8">
            {pageIdx > 0 && <div className="border-t-2 border-dashed border-border-medium my-6" />}
            <div className="space-y-6">
              {(page.elements || []).map((element) => (
                <div key={element.id} className="student-element">
                  <StudentElement
                    element={element}
                    studentAnswers={answers}
                    onAnswerChange={handleAnswerChange}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Bottom Bar: Progress + Submit ─── */}
      {studentNameSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light shadow-lg z-50">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-ink-secondary">
                    {progress}% Complete
                  </span>
                  <span className="text-xs text-ink-tertiary">
                    {Math.round(progress / 100 * interactiveElements.length)} of {interactiveElements.length} answered
                  </span>
                </div>
                <div className="w-full h-2 bg-canvas-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-semibold
                           rounded-lg hover:bg-accent-hover active:scale-[0.97] transition-all
                           shadow-sm whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirmation Dialog ─── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-lg font-bold text-ink mb-2">Ready to Submit?</h3>
            <p className="text-sm text-ink-secondary mb-5">
              You won&apos;t be able to edit your answers after submitting.
              {progress < 100 && (
                <span className="block mt-1 text-accent">
                  You&apos;ve only completed {progress}% of the worksheet.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink
                           bg-canvas-dark rounded-lg hover:bg-border-light transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-semibold text-white bg-accent
                           rounded-lg hover:bg-accent-hover transition-colors"
              >
                Submit Worksheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
