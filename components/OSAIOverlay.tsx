import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Suggestion, AIStatus, AIMode, UIConfig, SupportedLanguage, CognitiveProfile, PlatformType } from '../types';
import { getGreeting } from '../services/geminiService';
import { isInterruptionCommand } from '../services/policy';
import { platformManager } from '../services/platformManager';
import { Cpu, Check, X, Minus, Send, Mic, MicOff, Maximize2, User, ShieldCheck, Activity, Lock, AlertOctagon, Volume2, Info } from 'lucide-react';

interface OSAIOverlayProps {
  status: AIStatus;
  suggestion: Suggestion | null;
  mode: AIMode;
  profile: CognitiveProfile;
  ui: UIConfig;
  lang: SupportedLanguage;
  canWrite: boolean;
  canListen: boolean;
  isTtsEnabled: boolean;
  isAccessibilityMode: boolean;
  onApprove: () => void;
  onDeny: (reason?: string) => void;
  onAnalyze: (customPrompt?: string) => void;
  onUpdatePolicy: (key: string, value: boolean) => void;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  action?: string;
  isInterruption?: boolean;
}

const MIC_LABELS: Record<SupportedLanguage, { on: string; off: string; title: string }> = {
  'pt-BR': { on: 'ON', off: 'OFF', title: 'Microfone' },
  'en-US': { on: 'ON', off: 'OFF', title: 'Microphone' },
  'es-ES': { on: 'ON', off: 'OFF', title: 'Micrófono' },
  'fr-FR': { on: 'ON', off: 'OFF', title: 'Microphone' },
  'de-DE': { on: 'EIN', off: 'AUS', title: 'Mikrofon' },
  'it-IT': { on: 'ON', off: 'OFF', title: 'Microfono' },
  'zh-CN': { on: '开启', off: '关闭', title: '麦克风' },
  'ja-JP': { on: 'オン', off: 'オフ', title: 'マイク' },
};

const STATUS_MICROCOPY: Record<AIStatus, string> = {
  [AIStatus.IDLE]: "Assistente disponível. Nenhuma ação ativa no momento.",
  [AIStatus.ANALYZING]: "Processando sua solicitação...",
  [AIStatus.READY]: "Análise concluída.",
  [AIStatus.EXECUTING]: "Executando ação confirmada.",
  [AIStatus.COOLDOWN]: "Finalizando processos...",
  [AIStatus.ERROR]: "Assistente disponível. Nenhuma ação ativa no momento.",
  [AIStatus.CALLING]: "Iniciando comunicação...",
  [AIStatus.SUSPENDED]: "Assistente temporariamente desativado."
};

export const OSAIOverlay: React.FC<OSAIOverlayProps> = ({ 
  status, 
  suggestion, 
  mode, 
  profile,
  ui, 
  lang,
  canWrite, 
  canListen, 
  isTtsEnabled,
  isAccessibilityMode, 
  onApprove, 
  onDeny, 
  onAnalyze,
  onUpdatePolicy,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canListenRef = useRef(canListen);
  const platform = platformManager.getPlatform();
  
  const [position, setPosition] = useState({ 
    x: 20, 
    y: Math.max(20, window.innerHeight - 580) 
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [assistanceInput, setAssistanceInput] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const offsetRef = useRef({ x: 0, y: 0 });
  const recognitionRef = useRef<any>(null);
  const isSuspended = status === AIStatus.SUSPENDED;

  // Sincroniza a Ref com a prop canListen para uso seguro em callbacks assíncronos
  useEffect(() => {
    canListenRef.current = canListen;
  }, [canListen]);

  useEffect(() => {
    if (platform === PlatformType.IOS) {
      setHistory(prev => [
        { 
          role: 'system', 
          text: 'iOS Detectado: Mantenha esta aba aberta para que o microfone continue funcionando.', 
          timestamp: new Date() 
        }
      ]);
    }
  }, [platform]);

  const speak = useCallback((text: string) => {
    if (!isTtsEnabled || isSuspended) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [isTtsEnabled, lang, isSuspended]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, status, suggestion, isVoiceListening]);

  useEffect(() => {
    if (suggestion && !isSuspended) {
      const alreadyLogged = history.some(m => m.text === suggestion.description && m.role === 'ai');
      if (!alreadyLogged) {
        setHistory(prev => [...prev, { 
          role: 'ai', 
          text: suggestion.description, 
          action: suggestion.action,
          timestamp: new Date() 
        }]);
        speak(suggestion.description);
      }
    }
  }, [suggestion, speak, isSuspended, history]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang;
      
      recognitionRef.current.onresult = (event: any) => {
        // Bloqueio imediato se o microfone deveria estar desligado
        if (!canListenRef.current || isSuspended) return;

        const transcript = event.results[event.results.length - 1][0].transcript;
        const normalized = transcript.toLowerCase().trim();
        
        if (isInterruptionCommand(transcript)) {
          onDeny('Interrupção por voz.');
          setHistory(prev => [...prev, { role: 'user', text: transcript, timestamp: new Date(), isInterruption: true }]);
          return;
        }

        if (normalized.includes('osai')) {
          const greeting = getGreeting(lang, profile);
          setHistory(prev => [...prev, { role: 'user', text: transcript, timestamp: new Date() }]);
          setHistory(prev => [...prev, { role: 'ai', text: greeting, timestamp: new Date() }]);
          speak(greeting);
        } else if (normalized.length > 2) {
          setHistory(prev => [...prev, { role: 'user', text: transcript, timestamp: new Date() }]);
          onAnalyze(transcript);
        }
      };

      recognitionRef.current.onstart = () => {
        if (!canListenRef.current) {
          recognitionRef.current.stop();
          setIsVoiceListening(false);
        } else {
          setIsVoiceListening(true);
        }
      };
      
      recognitionRef.current.onend = () => {
        // Só reinicia se a permissão ainda estiver ativa
        if (canListenRef.current && !isSuspended) {
          try { recognitionRef.current.start(); } catch (e) { setIsVoiceListening(false); }
        } else {
          setIsVoiceListening(false);
        }
      };

      recognitionRef.current.onerror = (e: any) => {
        console.warn("Speech recognition error:", e.error);
        if (e.error === 'not-allowed') {
          onUpdatePolicy('canListen', false);
        }
        setIsVoiceListening(false);
      };
    }

    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
      if (canListen && !isSuspended) {
        try { recognitionRef.current.start(); } catch (e) {}
      } else {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }
  }, [lang, profile, speak, onDeny, onAnalyze, canListen, isSuspended, onUpdatePolicy]);

  const handleSend = (text: string) => {
    if (!text.trim() || isSuspended) return;
    setHistory(prev => [...prev, { role: 'user', text, timestamp: new Date() }]);
    onAnalyze(text);
    setAssistanceInput('');
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    offsetRef.current = { x: clientX - position.x, y: clientY - position.y };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      let newX = clientX - offsetRef.current.x;
      let newY = clientY - offsetRef.current.y;
      setPosition({ 
        x: Math.max(0, Math.min(newX, window.innerWidth - 320)), 
        y: Math.max(0, Math.min(newY, window.innerHeight - 100)) 
      });
    };
    const handleUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const fontSizeClass = ui.fontSize === 'large' ? 'text-sm' : 'text-[11px]';
  const isEmergency = suggestion?.intent === 'EMERGENCY' || suggestion?.type === 'emergency';
  const isSuggestion = suggestion?.isSuggestion;

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[999] select-none animate-in zoom-in duration-300 pointer-events-none transition-all duration-300 ${isVoiceListening ? 'drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]' : ''}`}
      style={{ 
        left: position.x, 
        top: position.y, 
        transform: `scale(${ui.scale})`, 
        opacity: ui.transparency,
        transformOrigin: 'top left'
      }}
    >
      <div className={`pointer-events-auto w-[320px] glass rounded-[36px] overflow-hidden shadow-2xl transition-all duration-500 border-2 relative ${
        status === AIStatus.CALLING ? 'border-red-500 animate-pulse' :
        isEmergency ? 'border-red-500/50' :
        status === AIStatus.ANALYZING ? 'border-blue-500/50' : 
        isVoiceListening ? 'border-emerald-500/60 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' :
        isSuspended ? 'border-red-600/50 grayscale' : 'border-white/10'
      } ${isMinimized ? 'h-14 w-[160px]' : 'h-[540px] flex flex-col'}`}>
        
        {isSuspended && !isMinimized && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 bg-red-600/20 rounded-full border border-red-500/30 mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-2">Assistente Suspenso</h3>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
              {STATUS_MICROCOPY[AIStatus.SUSPENDED]}
            </p>
          </div>
        )}

        <div 
          onMouseDown={handleDragStart} 
          onTouchStart={handleDragStart} 
          className={`p-4 flex items-center justify-between cursor-move shrink-0 z-[60] ${isEmergency ? 'bg-red-600/30' : 'bg-white/5'}`}
        >
          <div className="flex items-center space-x-2.5">
            <Cpu className={`w-4 h-4 ${isEmergency ? 'text-white' : (isSuspended ? 'text-red-500' : 'text-blue-400')}`} />
            <div className="flex flex-col items-start">
               <span className="font-black text-[9px] uppercase tracking-[0.15em] text-white">OSAI SHIELDED</span>
               <span className="text-[7px] font-bold text-slate-500 tracking-[0.2em]">{platform} ENGINE</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
              className="p-1.5 hover:bg-white/10 rounded-xl text-white pointer-events-auto"
            >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className={`px-5 py-2 border-b border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center justify-between shrink-0 transition-colors duration-300 ${
              isSuspended ? 'bg-red-600/30 text-red-400' : 
              isVoiceListening ? 'bg-emerald-600/40 text-emerald-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 
              status === AIStatus.ANALYZING ? 'bg-blue-600/20 text-blue-400' : 
              'bg-black/20 text-slate-500'
            }`}>
               <div className="flex items-center space-x-2">
                  {isVoiceListening ? (
                    <div className="flex items-end space-x-0.5 h-3">
                      <div className="w-0.5 bg-emerald-100 animate-[bounce_0.6s_infinite_0s] rounded-full" />
                      <div className="w-0.5 bg-emerald-100 animate-[bounce_0.6s_infinite_0.1s] rounded-full" />
                      <div className="w-0.5 bg-emerald-100 animate-[bounce_0.6s_infinite_0.2s] rounded-full" />
                    </div>
                  ) : <Activity className="w-3 h-3" />}
                  <span className={isVoiceListening ? "text-emerald-50" : ""}>
                    {isVoiceListening ? "OSAI ESCUTANDO..." : STATUS_MICROCOPY[status].split('.')[0]}
                  </span>
               </div>
               <div className="flex items-center space-x-1 opacity-60">
                  <Volume2 className={`w-3 h-3 ${isVoiceListening ? 'text-emerald-100' : ''}`} />
                  <span className={isVoiceListening ? "text-emerald-100" : ""}>VOZ ATIVA</span>
               </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40 scroll-smooth">
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 space-y-4">
                   <div className={`p-4 rounded-full border-2 transition-all duration-500 ${isVoiceListening ? 'bg-emerald-500/20 border-emerald-500 animate-pulse' : 'border-white/10'}`}>
                      <Mic className={`w-10 h-10 ${isVoiceListening ? 'text-emerald-400' : ''}`} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                     Aguardando...<br/>Chame por "OSAI" para iniciar.
                   </p>
                </div>
              )}
              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                  <div className={`max-w-[85%] p-3.5 rounded-3xl ${fontSizeClass} shadow-lg flex gap-3 ${
                    msg.role === 'user' ? (msg.isInterruption ? 'bg-red-600/30 text-white' : 'bg-blue-600 text-white') + ' rounded-tr-none' : 
                    msg.role === 'system' ? 'bg-slate-800/50 text-slate-300 italic border border-slate-700 mx-auto w-full text-center rounded-none text-[9px]' :
                    'bg-white/10 text-blue-100 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' && <Cpu className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40" />}
                    {msg.role === 'user' && <User className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40" />}
                    {msg.role === 'system' && <Info className="w-3 h-3 mt-0.5 shrink-0 opacity-40" />}
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
              {status === AIStatus.ANALYZING && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-3xl flex gap-1.5 border border-white/5">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className={`p-5 space-y-4 shrink-0 bg-white/5 border-t border-white/10 ${isSuspended ? 'pointer-events-none opacity-50' : 'pointer-events-auto'}`}>
              {status === AIStatus.READY && suggestion && isSuggestion && !isSuspended && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4">
                  <div className={`p-4 rounded-3xl border ${isEmergency ? 'bg-red-600/20 border-red-500' : 'bg-blue-600/10 border-blue-500/20'} flex items-start gap-3 text-left`}>
                    <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${isEmergency ? 'text-red-400' : 'text-blue-400'}`} />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-slate-500 mb-1">Ação Sugerida</span>
                      <h4 className={`${fontSizeClass} font-black uppercase text-white leading-tight`}>{suggestion.action}</h4>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={onApprove} className="flex-1 py-4 rounded-3xl bg-blue-600 text-white font-black flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all">
                      <Check className="w-4 h-4" /><span>CONFIRMAR</span>
                    </button>
                    <button onClick={() => onDeny('Rejeitado.')} className="w-14 py-4 bg-white/5 text-white rounded-3xl border border-white/5 flex items-center justify-center active:scale-95"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(assistanceInput); }} className="relative flex-1">
                  <input 
                    type="text" value={assistanceInput} onChange={(e) => setAssistanceInput(e.target.value)}
                    placeholder={isVoiceListening ? "Fale agora..." : (isSuspended ? "BLOQUEADO" : (canWrite ? "Digite ou fale..." : "Escrita OFF"))}
                    disabled={status === AIStatus.ANALYZING || isSuspended}
                    className={`w-full bg-black/40 border border-white/10 rounded-[22px] py-3.5 pl-5 pr-12 ${fontSizeClass} text-blue-100 focus:outline-none focus:border-blue-500/50 transition-all ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''} ${isVoiceListening ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : ''}`}
                  />
                  <button type="submit" disabled={!canWrite || status === AIStatus.ANALYZING || isSuspended} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 disabled:opacity-30"><Send className="w-4.5 h-4.5" /></button>
                </form>
                
                <button 
                  onClick={() => onUpdatePolicy('canListen', !canListen)} 
                  disabled={isSuspended}
                  className={`relative w-12 h-12 rounded-[22px] flex flex-col items-center justify-center border transition-all duration-300 ${
                    !canListen ? 'bg-red-900/40 border-red-500/30 text-red-500 shadow-inner' : 
                    (isVoiceListening ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg ring-4 ring-emerald-500/20' : 'bg-white/5 border-white/10 text-blue-400 hover:bg-white/10')
                  }`}
                  title={MIC_LABELS[lang].title}
                >
                  {isVoiceListening && <div className="absolute inset-0 rounded-[22px] bg-emerald-400/20 animate-ping" />}
                  {canListen ? <Mic className={`w-4 h-4 mb-0.5 ${isVoiceListening ? 'animate-pulse' : ''}`} /> : <MicOff className="w-4 h-4 mb-0.5" />}
                  <span className="text-[7px] font-black uppercase tracking-tighter opacity-80">
                    {canListen ? MIC_LABELS[lang].on : MIC_LABELS[lang].off}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};