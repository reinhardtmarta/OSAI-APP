
import React from 'react';
import { AlertTriangle, ChevronRight, Info, ExternalLink, Cog } from 'lucide-react';
import { getTranslation } from '../../locales';
import { SupportedLanguage } from '../../types';

interface ChatBubbleProps {
  role: 'user' | 'ai' | 'system' | 'thinking';
  text: string;
  steps?: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  lang: SupportedLanguage;
  groundingUrls?: {uri: string, title?: string}[];
  toolCalls?: any[];
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, steps, riskLevel, lang, groundingUrls, toolCalls }) => {
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500 ease-out w-full`}>
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

        {toolCalls && toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {toolCalls.map((call, idx) => (
              <div key={idx} className="bg-black/20 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                <Cog size={14} className="text-blue-400 animate-spin-slow" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Executando Função</span>
                  <span className="text-[10px] font-mono text-slate-400">{call.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

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

        {groundingUrls && groundingUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Fontes de Pesquisa:</span>
            <div className="flex flex-wrap gap-2">
              {groundingUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-[10px] flex items-center gap-2 text-blue-400 transition-all truncate max-w-full"
                >
                  <ExternalLink size={10} /> {url.title || 'Ver Fonte'}
                </a>
              ))}
            </div>
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
