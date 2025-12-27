
import React from 'react';
import { AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { getTranslation } from '../../locales';
import { SupportedLanguage } from '../../types';

interface ChatBubbleProps {
  role: 'user' | 'ai' | 'system' | 'thinking';
  text: string;
  steps?: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  lang: SupportedLanguage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, steps, riskLevel, lang }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const isThinking = role === 'thinking';
  const t = getTranslation(lang);

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[9px] bg-white/5 px-4 py-1.5 rounded-full text-slate-500 font-black uppercase tracking-[0.2em] border border-white/5 flex items-center gap-2">
          <Info size={10} /> {text}
        </span>
      </div>
    );
  }

  if (isThinking) {
    return (
      <div className="flex justify-start animate-pulse">
        <div className="bg-slate-800/50 p-4 rounded-[24px] rounded-tl-none border border-white/5 flex gap-1">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500 ease-out`}>
      <div 
        className={`max-w-[92%] p-5 rounded-[32px] shadow-2xl transition-all ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none shadow-blue-900/30' 
            : 'bg-slate-800/90 text-blue-50 rounded-tl-none border border-white/10 backdrop-blur-md'
        }`}
      >
        <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
          {text}
        </p>

        {steps && steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-[11px] text-slate-400 font-medium italic">
                <ChevronRight size={12} className="mt-0.5 text-blue-400 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {!isUser && riskLevel && riskLevel !== 'LOW' && (
          <div className={`mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${riskLevel === 'HIGH' ? 'text-red-400' : 'text-yellow-400'}`}>
            <AlertTriangle size={10} />
            {t.ui.riskProtocol}: {riskLevel}
          </div>
        )}
      </div>
    </div>
  );
};
