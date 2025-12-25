
import React, { useState, useRef, useEffect } from 'react';
import { Suggestion, AIStatus, AIMode, UIConfig } from '../types';
import { Cpu, Check, X, GripVertical, Minus, Send, MessageSquare, Mic, MicOff, Accessibility, PhoneCall, AlertCircle, ShieldCheck, Maximize2, User, Activity, Settings as SettingsIcon, Eye, History as HistoryIcon, ArrowLeft } from 'lucide-react';

interface OSAIOverlayProps {
  status: AIStatus;
  suggestion: Suggestion | null;
  mode: AIMode;
  ui: UIConfig;
  canWrite: boolean;
  canListen: boolean;
  isAccessibilityMode: boolean;
  onApprove: () => void;
  onDeny: () => void;
  onAnalyze: (customPrompt?: string) => void;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  action?: string;
}

export const OSAIOverlay: React.FC<OSAIOverlayProps> = ({ 
  status, 
  suggestion, 
  mode, 
  ui, 
  canWrite, 
  canListen, 
  isAccessibilityMode, 
  onApprove, 
  onDeny, 
  onAnalyze,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [assistanceInput, setAssistanceInput] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const offsetRef = useRef({ x: 0, y: 0 });
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (historyScrollRef.current) historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
  }, [history, status, suggestion, showHistory]);

  useEffect(() => {
    if (suggestion) {
      setHistory(prev => {
          if (prev.length > 0 && prev[prev.length - 1].text === suggestion.description) return prev;
          return [...prev, { 
            role: 'ai', 
            text: suggestion.description, 
            action: suggestion.action,
            timestamp: new Date() 
          }];
      });
    }
  }, [suggestion]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAssistanceInput(transcript);
        setIsVoiceListening(false);
        handleSend(transcript);
      };
      recognitionRef.current.onend = () => setIsVoiceListening(false);
      recognitionRef.current.onerror = () => setIsVoiceListening(false);
    }
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setHistory(prev => [...prev, { role: 'user', text, timestamp: new Date() }]);
    onAnalyze(text);
    setAssistanceInput('');
  };

  const toggleVoiceInput = () => {
    if (!canListen) return;
    if (isVoiceListening) {
      recognitionRef.current?.stop();
    } else {
      try { recognitionRef.current?.start(); setIsVoiceListening(true); } catch (e) {}
    }
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
      const overlayWidth = containerRef.current?.offsetWidth || 320;
      const overlayHeight = containerRef.current?.offsetHeight || 100;
      setPosition({ 
        x: Math.max(0, Math.min(newX, window.innerWidth - overlayWidth)), 
        y: Math.max(0, Math.min(newY, window.innerHeight - overlayHeight)) 
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
  const labelSizeClass = ui.fontSize === 'large' ? 'text-[10px]' : 'text-[8px]';

  const isEmergency = suggestion?.type === 'emergency' || suggestion?.type === 'call' || (suggestion?.action.toLowerCase().includes('ligar') && !suggestion.action.includes('Habilitar'));
  const isPermissionRequest = suggestion?.action.includes('Habilitar');

  return (
    <div 
      ref={containerRef}
      className="fixed z-[100] pointer-events-none select-none animate-in zoom-in slide-in-from-bottom-10 fade-in duration-500 ease-out"
      style={{ 
        left: position.x, 
        top: position.y, 
        transform: `scale(${ui.scale})`, 
        opacity: ui.transparency,
        maxWidth: 'calc(100vw - 20px)',
        transformOrigin: 'top left'
      }}
    >
      <div className={`pointer-events-auto w-[320px] glass rounded-[36px] overflow-hidden shadow-2xl transition-all duration-300 border-2 ${
        status === AIStatus.CALLING ? 'border-red-500 animate-pulse' :
        isEmergency ? 'border-red-500/50' :
        isPermissionRequest ? 'border-orange-500/50' :
        status === AIStatus.ANALYZING ? 'border-blue-500/50' : 
        'border-white/10'
      } ${isMinimized ? 'h-14 w-auto min-w-[160px]' : 'h-[480px] flex flex-col'}`}>
        
        {/* Header */}
        <div onMouseDown={handleDragStart} onTouchStart={handleDragStart} className={`p-4 flex items-center justify-between cursor-move shrink-0 ${isEmergency || status === AIStatus.CALLING ? 'bg-red-600/30' : 'bg-white/5'}`}>
          <div className="flex items-center space-x-2.5">
            {showHistory ? (
               <button onClick={() => setShowHistory(false)} className="p-1.5 bg-white/5 rounded-full text-white">
                 <ArrowLeft className="w-3.5 h-3.5" />
               </button>
            ) : <GripVertical className="w-4 h-4 text-slate-500" />}
            <div className="relative">
                {status === AIStatus.CALLING ? <PhoneCall className="w-4 h-4 text-white animate-bounce" /> : <Cpu className={`w-4 h-4 ${mode === AIMode.ACTIVE ? 'text-emerald-400' : 'text-blue-400'}`} />}
                {mode === AIMode.ACTIVE && !isMinimized && !showHistory && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
            </div>
            <span className="font-black text-[9px] uppercase tracking-[0.15em] text-white">
                {isMinimized ? 'OSAI' : showHistory ? 'HISTÓRICO DE IA' : mode === AIMode.ACTIVE ? 'ASSISTENTE ATIVO' : 'ASSISTENTE VIRTUAL'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {!isMinimized && !showHistory && (
              <button onClick={() => setShowHistory(true)} className="p-1.5 hover:bg-white/10 rounded-xl text-white transition-all">
                <HistoryIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-xl text-white transition-all active:scale-75">
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
            {!isMinimized && (
              <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 rounded-xl text-white hover:text-red-400 transition-all active:scale-75">
                  <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {!isMinimized && (
          <>
            {showHistory ? (
              /* Dedicated History View */
              <div ref={historyScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/60 scroll-smooth backdrop-blur-xl">
                 <div className="flex flex-col items-center mb-6 opacity-40">
                    <HistoryIcon className="w-8 h-8 text-blue-400 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Registro de Decisões</span>
                 </div>
                 {history.length === 0 ? (
                   <div className="text-center py-20 opacity-20">Nenhuma decisão registrada.</div>
                 ) : (
                   history.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1 mb-4`}>
                      <div className={`max-w-[90%] p-4 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-white/5 border border-white/10'}`}>
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                          {msg.role === 'ai' ? <Cpu className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <span className="text-[8px] font-black uppercase">{msg.role === 'ai' ? 'SISTEMA' : 'USUÁRIO'}</span>
                          <span className="text-[8px] font-medium ml-auto">{msg.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className={`${fontSizeClass} text-white font-medium leading-relaxed`}>{msg.text}</p>
                        {msg.action && (
                          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                             <Check className="w-3 h-3 text-emerald-400" />
                             <span className="text-[9px] font-black text-emerald-300 uppercase">AÇÃO: {msg.action}</span>
                          </div>
                        )}
                      </div>
                    </div>
                   ))
                 )}
              </div>
            ) : (
              /* Standard Interaction View */
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40 scroll-smooth">
                  {history.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                      {mode === AIMode.ACTIVE ? <Eye className="w-12 h-12 mb-4 text-emerald-400 animate-pulse" /> : <Activity className="w-12 h-12 mb-4 text-blue-400" />}
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        {mode === AIMode.ACTIVE ? 'Monitorando para Assistência' : 'Inicie um comando'}
                      </p>
                    </div>
                  )}
                  {history.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[85%] p-3.5 rounded-3xl ${fontSizeClass} leading-relaxed shadow-lg flex gap-3 items-start ${
                        msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20' : 'bg-white/10 text-blue-100 border border-white/5 rounded-tl-none backdrop-blur-md'
                      }`}>
                        {msg.role === 'ai' ? <Cpu className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40" /> : <User className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40" />}
                        <span className="font-medium">{msg.text}</span>
                      </div>
                    </div>
                  ))}
                  {status === AIStatus.ANALYZING && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/5 flex gap-1.5 animate-pulse backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4 shrink-0 bg-white/5 border-t border-white/10 backdrop-blur-md">
                  <div className="flex space-x-3">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(assistanceInput); }} className="relative flex-1">
                      <input 
                        type="text"
                        value={assistanceInput}
                        onChange={(e) => setAssistanceInput(e.target.value)}
                        placeholder={isVoiceListening ? "Ouvindo..." : "O que você precisa?"}
                        className={`w-full bg-black/40 border border-white/10 rounded-[22px] py-3.5 pl-5 pr-12 ${fontSizeClass} text-blue-100 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner`}
                      />
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300">
                        <Send className="w-4.5 h-4.5" />
                      </button>
                    </form>
                    <button onClick={toggleVoiceInput} className={`w-12 h-12 rounded-[22px] flex items-center justify-center border transition-all ${isVoiceListening ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 border-white/10 text-blue-400 hover:bg-white/10'}`}>
                      {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>

                  {status === AIStatus.READY && suggestion && (
                    <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                      <div className={`p-4 rounded-3xl border ${isEmergency ? 'bg-red-600/10 border-red-500 shadow-lg shadow-red-500/10' : isPermissionRequest ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10' : 'bg-blue-600/10 border-blue-500/20 shadow-lg shadow-blue-500/10'}`}>
                        <div className="flex items-start gap-3">
                          {isPermissionRequest ? <SettingsIcon className="w-5 h-5 text-orange-400 mt-0.5" /> : isEmergency ? <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" /> : <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />}
                          <div>
                              <h4 className={`${fontSizeClass} font-black uppercase tracking-tight ${isEmergency ? 'text-red-100' : isPermissionRequest ? 'text-orange-100' : 'text-blue-100'}`}>
                                  {suggestion.action}
                              </h4>
                              {isPermissionRequest && <p className={`${labelSizeClass} text-orange-300/70 mt-1 font-bold`}>Requer permissões adicionais.</p>}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={onApprove} className={`flex-1 py-4 rounded-3xl ${fontSizeClass} font-black transition-all flex items-center justify-center space-x-2 shadow-xl active:scale-95 ${isEmergency ? 'bg-red-600 hover:bg-red-500 text-white' : isPermissionRequest ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                          <Check className="w-4 h-4" />
                          <span>{isPermissionRequest ? 'ABRIR PERMISSÕES' : 'EXECUTAR AGORA'}</span>
                        </button>
                        <button onClick={onDeny} className="w-14 py-4 bg-white/5 hover:bg-white/10 text-white rounded-3xl transition-all flex items-center justify-center active:scale-95 border border-white/5">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
