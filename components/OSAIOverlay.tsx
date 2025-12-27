
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Suggestion, AIStatus, AIMode, UIConfig, SupportedLanguage, CognitiveProfile } from '../types';
import { PolicyEngine } from '../services/policyEngine';
import { SpeechEngine } from '../services/voice/speechEngine';
import { AudioVisualizer } from './ui/AudioVisualizer';
import { ChatBubble } from './chat/ChatBubble';
import { aiManager } from '../services/aiManager';
import { Haptics } from '../services/haptics';
import { getTranslation } from '../locales';
import { 
  Cpu, Minus, Mic, MicOff, Maximize2, 
  Trash2, ShieldCheck, SendHorizonal, Activity
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
  onClose: () => void;
}

export const OSAIOverlay: React.FC<OSAIOverlayProps> = ({ 
  status, suggestion, ui, lang, canListen, isPassiveListening, isAiMicEnabled, isUserMicEnabled,
  isTtsEnabled, isAccessibilityMode, onApprove, onDeny, onAnalyze
}) => {
  const [history, setHistory] = useState<{role: 'user' | 'ai' | 'system' | 'thinking', text: string, id: string, steps?: string[], riskLevel?: any}[]>([]);
  const [input, setInput] = useState('');
  const [interimInput, setInterimInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [frequencies, setFrequencies] = useState<number[]>([0, 0, 0, 0, 0]);
  
  const speechEngineRef = useRef<SpeechEngine | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedSuggestionId = useRef<string | null>(null);
  
  const t = getTranslation(lang);

  useEffect(() => {
    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    const greeting = aiManager.getGreeting(lang);
    setHistory([{ role: 'ai', text: greeting, id: 'init-' + Date.now() }]);
  }, [lang]);

  useEffect(() => {
    if (suggestion && suggestion.description && suggestion.id !== lastProcessedSuggestionId.current) {
      lastProcessedSuggestionId.current = suggestion.id;
      setHistory(prev => {
        const filtered = prev.filter(m => m.role !== 'thinking');
        return [...filtered, { 
          role: 'ai', 
          text: suggestion.description, 
          id: suggestion.id,
          steps: suggestion.steps,
          riskLevel: suggestion.riskLevel
        }];
      });
      if (isTtsEnabled) speak(suggestion.description);
      Haptics.medium();
    }
  }, [suggestion, isTtsEnabled]);

  useEffect(() => {
    if (status === AIStatus.ANALYZING) {
      setHistory(prev => [...prev, { role: 'thinking', text: '', id: 'thinking-' + Date.now() }]);
    }
  }, [status]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, interimInput]);

  const speak = useCallback((text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const preferredVoice = availableVoices.find(v => v.lang === lang) || 
                          availableVoices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
                          availableVoices.find(v => v.default);
    if (preferredVoice) u.voice = preferredVoice;
    u.lang = lang;
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }, [lang, availableVoices]);

  const handleManualSubmit = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setHistory(prev => [...prev, { role: 'user', text, id: 'user-' + Date.now() }]);
    onAnalyze(text);
    setInput('');
    Haptics.light();
  };

  const clearHistory = () => {
    Haptics.heavy();
    setHistory([{ role: 'system', text: t.ui.waitingPulse, id: 'clear-' + Date.now() }]);
  };

  const setupAudioAnalyzer = async () => {
    if (mediaStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 64;
      source.connect(analyzer);
      audioContextRef.current = audioCtx;
      analyzerRef.current = analyzer;
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const update = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        const bands = [0, 0, 0, 0, 0];
        const step = Math.floor(dataArray.length / 5);
        for (let i = 0; i < 5; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
          bands[i] = Math.min(100, (sum / step) * 0.8);
        }
        setFrequencies(bands);
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (e) { console.debug("Audio analyzer unavailable"); }
  };

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    analyzerRef.current = null;
    setFrequencies([0, 0, 0, 0, 0]);
  };

  const handleVoiceResult = useCallback((final: string, interim: string) => {
    if (interim) setInterimInput(interim);
    if (final) {
      setInterimInput('');
      const transcript = final.trim();
      if (transcript.length < 2) return;

      if (isAiMicEnabled && !isAwake && PolicyEngine.detectWakeWord(transcript)) {
        setIsAwake(true);
        const wakeMsg = t.ai.responses.wake;
        setHistory(prev => [...prev, { role: 'ai', text: wakeMsg, id: 'wake-' + Date.now() }]);
        speak(wakeMsg);
        Haptics.success();
        return;
      }

      if (isAwake || isPassiveListening || isUserMicEnabled) {
        setHistory(prev => [...prev, { role: 'user', text: transcript, id: 'user-' + Date.now() }]);
        onAnalyze(transcript);
        setIsAwake(false);
        Haptics.light();
      }
    }
  }, [isAiMicEnabled, isUserMicEnabled, isAwake, isPassiveListening, t, onAnalyze, speak]);

  useEffect(() => {
    const micAnyEnabled = isAiMicEnabled || isUserMicEnabled;
    if (!speechEngineRef.current && micAnyEnabled) {
      speechEngineRef.current = new SpeechEngine(
        lang,
        handleVoiceResult,
        () => {},
        () => { if (micAnyEnabled && canListen) speechEngineRef.current?.start(); }
      );
    }
    
    if (micAnyEnabled && canListen) {
      speechEngineRef.current?.start();
      setupAudioAnalyzer();
    } else {
      speechEngineRef.current?.stop();
      stopAudioAnalyzer();
    }
    
    return () => {
      speechEngineRef.current?.stop();
      stopAudioAnalyzer();
    };
  }, [isAiMicEnabled, isUserMicEnabled, canListen, lang, handleVoiceResult]);

  const anyMicActive = isAiMicEnabled || isUserMicEnabled;

  return (
    <div 
      className="fixed bottom-4 right-4 z-[999] pointer-events-none" 
      style={{ transform: `scale(${ui.scale})`, opacity: ui.transparency }}
      aria-live="polite"
    >
      <div 
        role="complementary"
        aria-label="OSAI Overlay Assistant"
        className={`pointer-events-auto glass rounded-[44px] border-2 transition-all duration-500 shadow-2xl flex flex-col ${isMinimized ? 'w-20 h-20' : 'w-85 h-[620px] max-h-[85vh]'} ${
        !anyMicActive ? 'border-slate-700 bg-slate-900/40' :
        isAwake ? 'border-blue-400 bg-blue-950/20 shadow-[0_0_40px_rgba(37,99,235,0.1)]' :
        status === AIStatus.READY ? 'border-yellow-400 bg-yellow-950/10' : 'border-white/10'
      }`}>
        <div className="p-5 flex items-center justify-between border-b border-white/5 shrink-0 bg-white/5 rounded-t-[44px]">
          <div className="flex items-center gap-3">
            <div 
              className={`p-2.5 rounded-full transition-all duration-300 relative ${!anyMicActive ? 'bg-slate-700' : isAwake ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800'}`}
              aria-hidden="true"
            >
              <Cpu className={`w-4 h-4 text-white ${status === AIStatus.ANALYZING ? 'animate-spin' : ''}`} />
              {!anyMicActive && <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border border-slate-900"><MicOff size={8} /></div>}
            </div>
            {!isMinimized && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-white tracking-[0.15em]">{t.ui.coreTitle}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[7px] font-black uppercase tracking-widest ${!anyMicActive ? 'text-slate-400' : 'text-blue-500'}`}>
                    {!anyMicActive ? t.ai.responses.muted : (t.ai.status[status] || status)}
                  </span>
                  {isAccessibilityMode && <ShieldCheck size={8} className="text-emerald-500" />}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isMinimized && (
              <button 
                onClick={clearHistory} 
                aria-label={t.ui.clearMemory}
                className="p-2.5 hover:bg-white/10 rounded-xl text-white/30 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              onClick={() => { setIsMinimized(!isMinimized); Haptics.light(); }} 
              aria-label={isMinimized ? "Maximize OSAI" : "Minimize OSAI"}
              className="p-2.5 hover:bg-white/10 rounded-xl text-white/30 transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div 
              ref={scrollContainerRef} 
              role="log"
              aria-relevant="additions"
              className="flex-1 overflow-y-auto p-5 space-y-6 bg-black/40 custom-scrollbar flex flex-col relative pb-10"
            >
              <div className="flex-1 space-y-5">
                {history.map(m => (
                  <ChatBubble key={m.id} role={m.role} text={m.text} steps={m.steps} riskLevel={m.riskLevel} lang={lang} />
                ))}
              </div>
              
              {interimInput && (
                <div className="sticky bottom-0 w-full flex justify-end pb-2 animate-in fade-in slide-in-from-right-4">
                  <div className="max-w-[85%] p-4 rounded-[24px] bg-blue-600/30 text-blue-100 text-[11px] border border-blue-500/40 backdrop-blur-md italic flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-bold text-[9px] uppercase"><Activity size={10} className="text-blue-400 animate-pulse" /> {t.ai.responses.listening}...</span>
                    <span className="opacity-80">{interimInput}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/80 backdrop-blur-3xl shrink-0 rounded-b-[44px]">
              <div className="flex gap-3 items-center">
                 <div className="relative flex-1">
                    <input 
                      value={input} 
                      onChange={e => setInput(e.target.value)} 
                      onKeyDown={e => { if(e.key === 'Enter') handleManualSubmit(); }} 
                      placeholder={!isUserMicEnabled ? "..." : t.ai.responses.listening}
                      aria-label="Manual command input"
                      className="w-full bg-white/5 border border-white/10 rounded-[30px] pl-6 pr-14 py-4.5 text-[14px] text-white outline-none focus:border-blue-500/60 focus:bg-white/10 transition-all placeholder:text-white/20 shadow-inner" 
                    />
                    <button 
                      onClick={handleManualSubmit} 
                      aria-label="Send command"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 p-2 hover:scale-110 active:scale-95 transition-all"
                    >
                      <SendHorizonal size={22} />
                    </button>
                 </div>
                 
                 <div className="flex gap-2.5">
                    {isUserMicEnabled && (
                      <button 
                        onClick={() => { Haptics.light(); speak(t.ai.responses.listening); }}
                        aria-label="Activate voice recognition"
                        className="w-15 h-15 rounded-[30px] flex items-center justify-center border-2 border-blue-500/30 bg-blue-500/10 text-blue-400 animate-in zoom-in shadow-lg active:scale-95"
                      >
                        <Mic size={24} />
                      </button>
                    )}
                    <div 
                      className="w-15 h-15 rounded-[30px] flex items-center justify-center border-2 border-white/10 bg-white/5 shadow-lg"
                      aria-hidden="true"
                    >
                      <AudioVisualizer frequencies={frequencies} isMuted={!anyMicActive} />
                    </div>
                 </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
