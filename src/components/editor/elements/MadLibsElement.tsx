import { useState, useCallback, useMemo } from 'react';
import type { MadLibsElement as MadLibsElementType, MadLibsPrompt } from '@/types/worksheet';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Eye, EyeOff, Wand2, Plus, Trash2, BookOpen } from 'lucide-react';

interface Props {
  element: MadLibsElementType;
  isEditing: boolean;
  isSelected: boolean;
  onUpdate: (updates: Partial<MadLibsElementType>) => void;
}

function parsePlaceholders(template: string): { placeholder: string; type: string; index: number }[] {
  const regex = /\{\{([^}:]+):(\d+)\}\}/g;
  const matches: { placeholder: string; type: string; index: number }[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    matches.push({ placeholder: match[0], type: match[1], index: parseInt(match[2]) });
  }
  return matches;
}

function buildCompletedStory(template: string, prompts: MadLibsPrompt[]): string {
  let story = template;
  for (const prompt of prompts) {
    if (prompt.value) story = story.split(prompt.placeholder).join(prompt.value);
  }
  return story;
}

const TYPE_COLORS: Record<string, string> = {
  noun: 'border-amber-400 focus:border-amber-500 bg-amber-50', verb: 'border-sky-400 focus:border-sky-500 bg-sky-50',
  adjective: 'border-rose-400 focus:border-rose-500 bg-rose-50', adverb: 'border-violet-400 focus:border-violet-500 bg-violet-50',
  place: 'border-emerald-400 focus:border-emerald-500 bg-emerald-50', animal: 'border-orange-400 focus:border-orange-500 bg-orange-50',
  food: 'border-pink-400 focus:border-pink-500 bg-pink-50', person: 'border-teal-400 focus:border-teal-500 bg-teal-50',
  exclamation: 'border-red-400 focus:border-red-500 bg-red-50', bodyPart: 'border-lime-400 focus:border-lime-500 bg-lime-50',
  number: 'border-cyan-400 focus:border-cyan-500 bg-cyan-50', color: 'border-indigo-400 focus:border-indigo-500 bg-indigo-50',
};

function getInputColorClass(placeholder: string): string {
  const match = placeholder.match(/\{\{([^}:]+):/);
  const type = match?.[1] || '';
  return TYPE_COLORS[type] || 'border-stone-300 focus:border-[#D97757] bg-white';
}

function MadLibsEditor({ element, onUpdate }: { element: MadLibsElementType; onUpdate: (u: Partial<MadLibsElementType>) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(element.storyTemplate || '');
  const parsed = useMemo(() => parsePlaceholders(element.storyTemplate || ''), [element.storyTemplate]);

  const handleParse = useCallback(() => {
    const matches = parsePlaceholders(templateDraft);
    const existingPrompts = element.prompts || [];
    const newPrompts: MadLibsPrompt[] = matches.map((m) => {
      const existing = existingPrompts.find((p) => p.placeholder === m.placeholder);
      return existing || { placeholder: m.placeholder, label: `${m.type.charAt(0).toUpperCase() + m.type.slice(1)}`, hint: '', value: '' };
    });
    onUpdate({ storyTemplate: templateDraft, prompts: newPrompts });
  }, [templateDraft, element.prompts, onUpdate]);

  const handlePromptUpdate = useCallback((index: number, updates: Partial<MadLibsPrompt>) => {
    const prompts = [...(element.prompts || [])];
    prompts[index] = { ...prompts[index], ...updates };
    onUpdate({ prompts });
  }, [element.prompts, onUpdate]);

  const handleAddPrompt = useCallback(() => {
    const existingCount = (element.prompts || []).length;
    const prompts = [...(element.prompts || []), { placeholder: `{{word:${existingCount + 1}}}`, label: `Word ${existingCount + 1}`, hint: '', value: '' }];
    onUpdate({ prompts });
  }, [element.prompts, onUpdate]);

  const handleRemovePrompt = useCallback((index: number) => {
    const prompts = [...(element.prompts || [])];
    prompts.splice(index, 1);
    onUpdate({ prompts });
  }, [element.prompts, onUpdate]);

  const allFilled = useMemo(() => element.prompts && element.prompts.length > 0 && element.prompts.every((p) => p.value && p.value.trim()), [element.prompts]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 overflow-auto">
      <input type="text" value={element.title || ''} onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Story Title" className="w-full text-sm font-bold text-stone-800 outline-none border-b border-dashed border-stone-300 pb-1 bg-transparent placeholder:text-stone-400" />
      <input type="text" value={element.instruction || ''} onChange={(e) => onUpdate({ instruction: e.target.value })}
        placeholder="Instruction text" className="w-full text-xs text-stone-600 outline-none border-b border-dashed border-stone-200 pb-1 bg-transparent placeholder:text-stone-400" />
      {!showPreview ? (
        <>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">Story Template</label>
            <textarea value={templateDraft} onChange={(e) => setTemplateDraft(e.target.value)}
              placeholder="Once upon a time, a {{adjective:1}} {{noun:1}} decided to {{verb:1}}..."
              className="w-full h-28 text-xs text-stone-700 outline-none border border-stone-300 rounded-md p-2 bg-white resize-none placeholder:text-stone-400 focus:border-[#D97757]" />
          </div>
          <button onClick={handleParse} className="flex items-center gap-1.5 self-start px-3 py-1.5 bg-[#D97757] text-white text-xs font-medium rounded-md hover:bg-[#c26a4d] transition-colors">
            <Wand2 className="w-3.5 h-3.5" />Parse Story</button>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Prompts ({element.prompts?.length || 0})</label>
              <button onClick={handleAddPrompt} className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#D97757] hover:bg-[#FDF5F0] rounded transition-colors"><Plus className="w-3 h-3" />Add</button>
            </div>
            {parsed.length > 0 && <div className="text-[10px] text-stone-500 bg-stone-50 rounded p-1.5">Found: {parsed.map((p) => p.placeholder).join(', ')}</div>}
            {(element.prompts || []).map((prompt, i) => (
              <div key={i} className="flex flex-col gap-1 border border-stone-200 rounded-md p-2 bg-white">
                <div className="flex items-center justify-between">
                  <code className="text-[10px] text-[#D97757] font-semibold bg-[#FDF5F0] px-1.5 py-0.5 rounded">{prompt.placeholder}</code>
                  <button onClick={() => handleRemovePrompt(i)} className="text-stone-400 hover:text-red-500 transition-colors" title="Remove prompt"><Trash2 className="w-3 h-3" /></button>
                </div>
                <div className="flex gap-2 mt-1">
                  <input type="text" value={prompt.label} onChange={(e) => handlePromptUpdate(i, { label: e.target.value })}
                    placeholder="Label" className="flex-1 text-xs text-stone-700 outline-none border border-stone-200 rounded px-2 py-1 bg-white placeholder:text-stone-400 focus:border-[#D97757]" />
                  <input type="text" value={prompt.hint || ''} onChange={(e) => handlePromptUpdate(i, { hint: e.target.value })}
                    placeholder="Hint" className="flex-1 text-xs text-stone-700 outline-none border border-stone-200 rounded px-2 py-1 bg-white placeholder:text-stone-400 focus:border-[#D97757]" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-stone-600 italic bg-stone-50 p-2 rounded border border-stone-200">
            {element.instruction || 'Fill in the blanks below, then read your silly story!'}</div>
          <div className="flex flex-col gap-2">
            {(element.prompts || []).map((prompt, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <label className="text-xs font-medium text-stone-700">{prompt.label}</label>
                {prompt.hint && <span className="text-[10px] text-stone-500">e.g. {prompt.hint}</span>}
                <input type="text" value={prompt.value || ''} readOnly placeholder="..."
                  className={`w-full text-xs border rounded-md px-2 py-1 outline-none ${getInputColorClass(prompt.placeholder)}`} />
              </div>
            ))}
          </div>
          {allFilled && <div className="text-sm text-stone-800 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">{buildCompletedStory(element.storyTemplate || '', element.prompts || [])}</div>}
        </div>
      )}
      <button onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-1.5 self-start text-[10px] text-stone-500 hover:text-[#D97757] transition-colors mt-auto">
        {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{showPreview ? 'Back to Editor' : 'Preview Student View'}
      </button>
    </div>
  );
}

function MadLibsStudent({ element, onUpdate }: { element: MadLibsElementType; onUpdate: (u: Partial<MadLibsElementType>) => void }) {
  const prompts = element.prompts || [];
  const handleValueChange = useCallback((index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { ...newPrompts[index], value };
    onUpdate({ prompts: newPrompts });
  }, [prompts, onUpdate]);

  const handleReveal = useCallback(() => {
    const story = buildCompletedStory(element.storyTemplate || '', prompts);
    onUpdate({ completedStory: story, isRevealed: true });
  }, [element.storyTemplate, prompts, onUpdate]);

  const handleTryAgain = useCallback(() => {
    const clearedPrompts = prompts.map((p) => ({ ...p, value: '' }));
    onUpdate({ prompts: clearedPrompts, completedStory: '', isRevealed: false });
  }, [prompts, onUpdate]);

  const allFilled = useMemo(() => prompts.length > 0 && prompts.every((p) => p.value && p.value.trim()), [prompts]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 overflow-auto">
      {element.title && <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#D97757]" />{element.title}</h3>}
      <p className="text-xs text-stone-600 italic">{element.instruction || 'Fill in the blanks below, then read your silly story!'}</p>
      <div className="flex flex-col gap-2.5">
        {prompts.map((prompt, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <label className="text-xs font-semibold text-stone-700">{prompt.label}</label>
            {prompt.hint && <span className="text-[10px] text-stone-500">e.g. {prompt.hint}</span>}
            <input type="text" value={prompt.value || ''} onChange={(e) => handleValueChange(i, e.target.value)}
              disabled={element.isRevealed} placeholder="Type your word here..."
              className={`w-full text-sm border-2 rounded-lg px-3 py-2 outline-none transition-all duration-200 ${getInputColorClass(prompt.placeholder)} ${element.isRevealed ? 'opacity-60 cursor-not-allowed' : ''}`} />
          </div>
        ))}
      </div>
      {!element.isRevealed ? (
        <button onClick={handleReveal} disabled={!allFilled}
          className={`flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${allFilled ? 'bg-[#D97757] text-white hover:bg-[#c26a4d] hover:scale-[1.02] active:scale-[0.98] shadow-md' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
          <Sparkles className="w-4 h-4" />Read My Story!
        </button>
      ) : (
        <button onClick={handleTryAgain}
          className="flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <RotateCcw className="w-4 h-4" />Try Again
        </button>
      )}
      <AnimatePresence>
        {element.isRevealed && element.completedStory && (
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="mt-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold uppercase tracking-wider text-amber-600">Your Story</span></div>
            <p className="text-sm leading-relaxed text-stone-800 font-medium">{element.completedStory}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MadLibsElement({ element, isEditing, isSelected, onUpdate }: Props) {
  return (
    <div className="w-full h-full" style={{ cursor: isEditing ? 'default' : isSelected ? 'text' : 'grab', borderRadius: 'inherit' }}>
      {isEditing ? <MadLibsEditor element={element} onUpdate={onUpdate} /> : <MadLibsStudent element={element} onUpdate={onUpdate} />}
    </div>
  );
}
