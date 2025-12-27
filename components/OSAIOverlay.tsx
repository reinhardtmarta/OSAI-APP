
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Suggestion, AIStatus, AIMode, UIConfig, SupportedLanguage, CognitiveProfile } from '../types';
import { PolicyEngine } from '../services/policyEngine';
import { SpeechEngine } from '../services/voice/speechEngine';
import { ChatBubble } from './chat/ChatBubble';
import { Suggestions } from './chat/Suggestions';
import { Haptics } from '../services/haptics';
import { getTranslation } from '../locales';
import { ToolExecutor } from '../services/tools/toolExecutor';
import { 
  Cpu, Minus, Mic, MicOff, SendHorizonal, Activity, Volume2, VolumeX, Speaker, BrainCircuit
} from 'lucide-react';

interface OSAIOverlayProps {
  status: AIStatus;
  suggestion: Suggestion | null;
  mode: AIMode;
  profile: CognitiveProfile;
  ui: UIConfig;
  lang: SupportedLanguage;
  canListen: boolean;
  isPassiveListening: boolean;
  isAiMicEnabled: boolean;
  isUserMicEnabled: boolean;
  isTtsEnabled: boolean;
  isAccessibilityMode: boolean;
  onApprove: () => void;
  onDeny: (reason?: string) => void;
  onAnalyze: (customPrompt?: string) => void;
  onUpdatePolicy: (key: string, value: boolean) => void;
  onLog: (msg: string, type?: 'info' | 'error' | 'success' | 'task') => void;
  onClose: () => void;
}

export const OSAIOverlay: React.FC<OSAIOverlayProps> = ({ 
  status, suggestion, ui, lang, isTtsEnabled, onAnalyze, onLog
}) => {
  const [history, setHistory] = useState<{role: 'user' | 'ai' | 'system' | 'thinking', text: string, id: string, reasoning?: string, steps?: string[]}[]>([]);
  const [input, setInput] = useState('');
  const [interimInput, setInterimInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speechEngineRef = useRef<SpeechEngine | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedId = useRef<string | null>(null);
  const ttsTimeoutRef = useRef<any>(null);
  
  const t = getTranslation(lang);

  const speak = useCallback((text: string) => {
    if (!text || !isTtsEnabled) return;
    
    window.speechSynthesis.cancel();
    if (ttsTimeoutRef.current) clearTimeout(ttsTimeoutRef.current);

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);

    ttsTimeoutRef.current = setTimeout(() => {
      window.speechSynthesis.speak(u);
    }, 100);
  }, [lang, isTtsEnabled]);

  const toggleMic = () => {
    Haptics.medium();
    const newState = !isAwake;
    setIsAwake(newState);
    
    if (newState) {
      speechEngineRef.current?.start();
      speak(t.ai.responses.listening);
    } else {
      speechEngineRef.current?.stop();
      setInterimInput('');
    }
  };

  const handleVoiceResult = useCallback((final: string, interim: string) => {
    if (!isAwake) return;
    setInterimInput(interim);
    if (final) {
      setInterimInput('');
      handleManualSubmit(final);
    }
  }, [isAwake]);

  useEffect(() => {
    if (!speechEngineRef.current) {
      speechEngineRef.current = new SpeechEngine(
        lang, 
        handleVoiceResult, 
        (err) => onLog(`Mic Error: ${err}`, 'error'),
        () => {}
      );
    }
    speechEngineRef.current.updateLanguage(lang);
    if (isAwake) speechEngineRef.current.start();
    else speechEngineRef.current.stop();

    return () => { speechEngineRef.current?.stop(); };
  }, [lang, handleVoiceResult, onLog]);

  const handleManualSubmit = (text?: string) => {
    const val = text || input.trim();
    if (!val) return;
    
    // Add user message to history
    setHistory(prev => [...prev, { role: 'user', text: val, id: 'u-' + Date.now() }]);
    onAnalyze(val);
    setInput('');
  };

  useEffect(() => {
    if (suggestion && suggestion.id !== lastProcessedId.current) {
      lastProcessedId.current = suggestion.id;
      
      const newEntry = { 
        role: 'ai' as const, 
        text: suggestion.description, 
        id: suggestion.id,
        reasoning: suggestion.reasoning,
        steps: suggestion.steps
      };

      // Ensure we keep the full history and just remove the 'thinking' placeholder if it exists
      setHistory(prev => [...prev.filter(m => m.role !== 'thinking'), newEntry]);
      
      if (isTtsEnabled) speak(suggestion.description);

      if (suggestion.toolCalls) {
        suggestion.toolCalls.forEach(call => {
          ToolExecutor.execute(call.name, call.args).then(res => {
            onLog(res, 'success');
            setHistory(prev => [...prev, { role: 'system', text: res, id: 'sys-' + Date.now() }]);
          });
        });
      }
    }
  }, [suggestion, isTtsEnabled, speak, onLog]);

  useEffect(() => {
    // Only show thinking if we aren't already ready with a suggestion
    if (status === AIStatus.ANALYZING) {
      setHistory(prev => {
        // Prevent duplicate thinking bubbles
        if (prev[prev.length - 1]?.role === 'thinking') return prev;
        return [...prev, { role: 'thinking', text: 'Analysing core...', id: 'think-' + Date.now() }];
      });
    } else if (status === AIStatus.IDLE || status === AIStatus.READY) {
      setHistory(prev => prev.filter(m => m.role !== 'thinking'));
    }
  }, [status]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history, interimInput]);

  return (
    <div className="fixed bottom-6 right-6 z-[999] pointer-events-none" style={{ transform: `scale(${ui.scale})`, opacity: ui.transparency }}>
      <div className={`pointer-events-auto glass rounded-[40px] border-2 shadow-2xl flex flex-col transition-all overflow-hidden ${isMinimized ? 'w-20 h-20' : 'w-80 h-[600px]'} ${isAwake ? 'border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.3)]' : 'border-white/10'}`}>
        
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <Cpu size={18} className={status === AIStatus.ANALYZING ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            {!isMinimized && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-white tracking-widest leading-tight">{t.ui.coreTitle}</span>
                <span className={`text-[8px] font-bold uppercase ${isAwake ? 'text-blue-400' : 'text-slate-500'}`}>{isAwake ? 'System Listening' : 'Waiting...'}</span>
              </div>
            )}
          </div>
          {!isMinimized && <button onClick={() => setIsMinimized(true)} className="p-2 text-white/40 hover:bg-white/5 rounded-xl"><Minus size={16} /></button>}
        </div>

        {!isMinimized ? (
          <>
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 custom-scrollbar flex flex-col scroll-smooth">
              {history.map(m => (
                <div key={m.id} className="space-y-1">
                  {m.reasoning && (
                    <div className="flex gap-2 items-start px-2 mb-1 opacity-60">
                      <BrainCircuit size={10} className="text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-[9px] text-blue-400 italic">Thinking: {m.reasoning}</div>
                    </div>
                  )}
                  <ChatBubble role={m.role} text={m.text} lang={lang} steps={m.steps} />
                </div>
              ))}
              {interimInput && (
                <div className="text-[11px] text-blue-400/90 italic bg-blue-500/10 p-4 rounded-3xl border border-blue-500/10 animate-pulse flex items-center gap-3">
                  <Activity size={14} /> <span>{interimInput}...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <Speaker size={10} className="text-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-emerald-400">Reading Screen Content</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/10 bg-black/40 space-y-4 shrink-0">
              <Suggestions onSelect={handleManualSubmit} lang={lang} />
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                    placeholder="Command or Question..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl pl-5 pr-14 py-4 text-[13px] text-white outline-none focus:border-blue-500 transition-all"
                  />
                  <button onClick={() => handleManualSubmit()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all">
                    <SendHorizonal size={18} />
                  </button>
                </div>
                <button 
                  onClick={toggleMic}
                  className={`p-4 rounded-full border transition-all ${isAwake ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}
                >
                  {isAwake ? <Mic size={22} className="text-white" /> : <MicOff size={22} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div onClick={() => setIsMinimized(false)} className="flex-1 flex items-center justify-center cursor-pointer group">
            <div className="relative">
              <Cpu size={32} className={`${isAwake ? 'text-blue-400' : 'text-slate-500'} transition-all ${status === AIStatus.ANALYZING ? 'animate-spin' : 'group-hover:scale-110'}`} />
              {isAwake && <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-ping opacity-20" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
