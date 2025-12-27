
import React from 'react';
import { Sparkles } from 'lucide-react';
import { OSAI_KNOWLEDGE } from '../../knowledge/osaiKnowledge';
import { getTranslation } from '../../locales';
import { SupportedLanguage } from '../../types';

interface SuggestionsProps {
  onSelect: (prompt: string) => void;
  lang: SupportedLanguage;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ onSelect, lang }) => {
  const t = getTranslation(lang);
  
  // Mapeia os IDs definidos no conhecimento para os dados traduzidos no locale
  const activeSuggestions = OSAI_KNOWLEDGE.suggestion_ids
    .map(id => ({ id, ...t.suggestions[id] }))
    .filter(s => s.label && s.prompt);

  return (
    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {activeSuggestions.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.prompt)}
          className="whitespace-nowrap shrink-0 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase text-blue-400 hover:bg-blue-600/20 transition-all flex items-center gap-2"
        >
          <Sparkles size={10} />
          {s.label}
        </button>
      ))}
    </div>
  );
};
