
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { OSAIOverlay } from './components/OSAIOverlay';
import { SettingsDialog } from './components/SettingsDialog';
import { AIStatus, Suggestion, AppSettings, AIMode, SupportedLanguage } from './types';
import { getSuggestion } from './services/geminiService';
import { Settings, Power, Cpu, Shield, Globe, Accessibility, Phone, Mic, Languages, Users, LayoutDashboard, Activity, Database, History, MousePointer2, Keyboard, Eye, AppWindow, MapPin } from 'lucide-react';

const SETTINGS_KEY = 'osai_user_settings_v10';

const DEFAULT_SETTINGS: AppSettings = {
  isOsaiEnabled: true,
  isAiEnabled: true,
  isAccessibilityMode: true,
  mode: AIMode.PASSIVE,
  policy: {
    blockDangerousKeywords: true,
    requireApproval: true,
    sandboxExecution: true,
    canSee: true,
    canWrite: true,
    canListen: false,
    canReadFiles: true,
    canAccessNetwork: false,
    canManageApps: true,
    canMakeCalls: true,
    canAccessContacts: false,
    canAccessLocation: false, // Default location off
    canOverlay: true,      
    canUseKeyboard: true, 
    canReadScreen: true,  
  },
  ui: {
    transparency: 0.98,
    scale: 1.0,
    fontSize: 'normal'
  },
  data: {
    saveMemory: true,
    allowSuggestions: true, 
    voiceWakeWord: true,
    language: 'pt-BR',
    showAiLog: true
  }
};

const WAKE_WORDS: Record<SupportedLanguage, string[]> = {
  'pt-BR': ['ativar osai', 'abrir osai', 'desativar osai', 'fechar osai'],
  'en-US': ['activate osai', 'open osai', 'deactivate osai', 'close osai'],
  'es-ES': ['activar osai', 'abrir osai', 'desactivar osai', 'cerrar osai'],
  'fr-FR': ['activer osai', 'ouvrir osai', 'désactivar osai', 'fermer osai'],
  'de-DE': ['osai aktivieren', 'osai öffnen', 'osai deaktivieren', 'osai schließen'],
  'it-IT': ['attiva osai', 'apri osai', 'chiudi osai', 'disattiva osai'],
  'zh-CN': ['启动osai', '打开osai', '停用osai', '关闭osai'],
  'ja-JP': ['osaiを起動', 'osaiを開く', 'osaiを停止', 'osaiを閉じる'],
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [logs, setLogs] = useState<string[]>(["[OSAI] Kernel de Assistência Ativa v5.0 iniciado."]);
  const [status, setStatus] = useState<AIStatus>(AIStatus.IDLE);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true); 
  const [lastUserRequest, setLastUserRequest] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const prevEnabledRef = useRef(settings.isOsaiEnabled);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (settings.isOsaiEnabled && !prevEnabledRef.current) {
        handleAnalyze("Olá OSAI. O usuário acabou de habilitar o sistema. Apresente-se brevemente e pergunte como pode ajudar hoje.");
    }
    prevEnabledRef.current = settings.isOsaiEnabled;
  }, [settings.isOsaiEnabled]);

  useEffect(() => {
    if (lastUserRequest) {
        addLog(`[SYSTEM] Estado de permissões alterado. Re-avaliando contexto...`);
        handleAnalyze(lastUserRequest);
    }
  }, [
    settings.policy.canAccessNetwork, 
    settings.policy.canAccessContacts, 
    settings.policy.canAccessLocation,
    settings.policy.canReadScreen, 
    settings.policy.canUseKeyboard,
    settings.policy.canManageApps
  ]);

  useEffect(() => {
    let interval: number;
    if (settings.mode === AIMode.ACTIVE && settings.isAiEnabled && status === AIStatus.IDLE) {
      interval = window.setInterval(() => {
        const screenCtx = settings.policy.canReadScreen ? "Lendo conteúdo visual da tela atual em tempo real." : "Aguardando permissão de leitura de tela para assistência ativa.";
        handleAnalyze(`[ATIVO] ${screenCtx} Usuário navegando entre aplicativos.`);
      }, 25000); 
    }
    return () => clearInterval(interval);
  }, [settings.mode, settings.isAiEnabled, status, settings.policy.canReadScreen]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (SpeechRecognition && settings.data.voiceWakeWord && settings.policy.canListen) {
      if (recognitionRef.current) recognitionRef.current.stop();
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = settings.data.language;
      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
        const words = WAKE_WORDS[settings.data.language];
        
        // Check for universal wake word "OSAI"
        if (text.includes('osai')) {
          if (!settings.isOsaiEnabled) {
            setSettings(s => ({...s, isOsaiEnabled: true}));
            addLog(`[VOICE] Assistente Habilitado via chamada direta.`);
          } else {
            addLog(`[VOICE] Chamada direta 'OSAI' detectada. Iniciando análise...`);
            handleAnalyze("O usuário chamou pelo seu nome 'OSAI'. Pergunte em que pode ajudar.");
          }
          return;
        }

        if (text.includes(words[0]) || text.includes(words[1])) {
          setSettings(s => ({...s, isOsaiEnabled: true}));
          addLog(`[VOICE] Assistente Habilitado via comando.`);
        } else if (text.includes(words[2]) || text.includes(words[3])) {
          setSettings(s => ({...s, isOsaiEnabled: false}));
          addLog(`[VOICE] Assistente Desabilitado via comando.`);
        }
      };
      recognition.onend = () => { if (settings.data.voiceWakeWord) recognition.start(); };
      try { recognition.start(); } catch(e) {}
      recognitionRef.current = recognition;
    }
    return () => recognitionRef.current?.stop();
  }, [settings.data.voiceWakeWord, settings.data.language, settings.policy.canListen, settings.isOsaiEnabled]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleAnalyze = async (customPrompt?: string) => {
    if (!settings.isAiEnabled) return;
    if (customPrompt) setLastUserRequest(customPrompt);
    
    setStatus(AIStatus.ANALYZING);
    addLog(`[CORE] IA observando aplicativos autorizados...`);
    
    const suggestion = await getSuggestion(
      customPrompt || "Usuário em atividade no dispositivo.", 
      settings.isAccessibilityMode, 
      settings.data.language,
      {
        hasContactAccess: settings.policy.canAccessContacts,
        hasInternetAccess: settings.policy.canAccessNetwork,
        hasScreenAccess: settings.policy.canReadScreen,
        hasKeyboardAccess: settings.policy.canUseKeyboard,
        hasAppManagement: settings.policy.canManageApps,
        hasLocationAccess: settings.policy.canAccessLocation
      }
    );
    
    if (suggestion) {
      if (!suggestion.action.includes('Habilitar')) {
          setLastUserRequest(null);
      }
      setStatus(AIStatus.READY);
      setCurrentSuggestion(suggestion);
      addLog(`[MOTOR] Sugestão gerada: ${suggestion.action}`);
    } else {
      setStatus(AIStatus.ERROR);
      addLog(`[ERROR] Falha de comunicação com o motor de IA.`);
    }
  };

  const handleApprove = async () => {
    if (!currentSuggestion) return;
    setStatus(AIStatus.EXECUTING);
    addLog(`[AUTH] Executando comando: ${currentSuggestion.action}`);
    
    const actionLower = currentSuggestion.action.toLowerCase();

    if (currentSuggestion.action.includes('Habilitar')) {
        setShowDashboard(true);
        setShowSettings(true);
        setStatus(AIStatus.IDLE);
        setCurrentSuggestion(null);
        return;
    }

    if (actionLower.startsWith('fechar') || actionLower.startsWith('sair')) {
        const appName = currentSuggestion.action.split(' ').slice(1).join(' ');
        addLog(`[SYSTEM] Encerrando processo do aplicativo: ${appName || 'atual'}`);
        await new Promise(r => setTimeout(r, 1500));
        addLog(`[SYSTEM] Recurso liberado. Aplicativo encerrado.`);
    } else if (currentSuggestion.type === 'call' || currentSuggestion.type === 'emergency') {
        if (!settings.policy.canAccessContacts && currentSuggestion.type === 'call') {
            addLog(`[ERROR] Acesso a contatos negado. Habilite nas configurações.`);
            setStatus(AIStatus.ERROR);
            return;
        }
        setStatus(AIStatus.CALLING);
        addLog(`[NETWORK] Conectando...`);
        await new Promise(r => setTimeout(r, 4000));
        addLog(`[NETWORK] Chamada encerrada.`);
    } else {
        await new Promise(r => setTimeout(r, 1000));
        addLog(`[SYSTEM] Operação concluída.`);
    }

    setStatus(AIStatus.IDLE);
    setCurrentSuggestion(null);
  };

  const aiLogs = logs.filter(log => log.includes('[CORE]') || log.includes('[MOTOR]') || log.includes('[AUTH]') || log.includes('[NETWORK]') || log.includes('[SYSTEM]') || log.includes('[VOICE]') || log.includes('[ERROR]'));

  const fontSizeClass = settings.ui.fontSize === 'large' ? 'text-lg' : 'text-sm';

  return (
    <div className={`min-h-screen w-full flex flex-col bg-[#020617] transition-all duration-700 font-sans ${!settings.isOsaiEnabled ? 'grayscale brightness-50' : ''} ${settings.ui.fontSize === 'large' ? 'large-text-active' : ''}`}>
      {settings.isOsaiEnabled && !showDashboard && (
        <button 
          onClick={() => setShowDashboard(true)}
          className="fixed top-4 left-4 z-[90] p-3 bg-blue-600 rounded-2xl shadow-lg border border-white/10 text-white animate-in zoom-in"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>
      )}

      {showDashboard && (
        <>
          <header className="sticky top-0 h-16 border-b border-white/5 glass px-4 flex items-center justify-between z-40 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${settings.isAccessibilityMode ? 'bg-orange-600 shadow-orange-500/20 shadow-lg' : 'bg-blue-600 shadow-blue-500/20 shadow-lg'}`}>
                  {settings.isAccessibilityMode ? <Accessibility className="w-5 h-5 text-white" /> : <LayoutDashboard className="w-5 h-5 text-white" />}
              </div>
              <div onClick={() => setShowDashboard(false)} className="cursor-pointer">
                <h1 className={`${fontSizeClass} font-black text-white leading-none tracking-tighter`}>OSAI CONTROL</h1>
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${settings.mode === AIMode.ACTIVE ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{settings.mode} MODE</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
               <button onClick={() => setShowSettings(true)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 transition-all border border-white/5">
                 <Settings className="w-5 h-5" />
               </button>
            </div>
          </header>

          <main className="flex-1 p-5 pb-32 flex flex-col space-y-6 max-w-lg mx-auto w-full">
            <div className="grid grid-cols-6 gap-2">
                <PermissionBox icon={Globe} active={settings.policy.canAccessNetwork} label="NET" fontSizeClass={fontSizeClass} />
                <PermissionBox icon={Eye} active={settings.policy.canReadScreen} label="SCREEN" fontSizeClass={fontSizeClass} />
                <PermissionBox icon={Keyboard} active={settings.policy.canUseKeyboard} label="KEYS" fontSizeClass={fontSizeClass} />
                <PermissionBox icon={AppWindow} active={settings.policy.canManageApps} label="APPS" fontSizeClass={fontSizeClass} />
                <PermissionBox icon={Users} active={settings.policy.canAccessContacts} label="CONTS" fontSizeClass={fontSizeClass} />
                <PermissionBox icon={MapPin} active={settings.policy.canAccessLocation} label="LOC" fontSizeClass={fontSizeClass} />
            </div>

            <div className={`glass p-6 rounded-[32px] border transition-all relative overflow-hidden ${settings.isAccessibilityMode ? 'border-orange-500/20 shadow-orange-500/5' : 'border-white/10'}`}>
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" /> STATUS GLOBAL
                    </h3>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase">Seguro</div>
                </div>

                <div className="space-y-4">
                    <StatusRow label="Modo Operacional" value={settings.mode === AIMode.ACTIVE ? "Assistência em Tempo Real" : "Modo Manual"} color={settings.mode === AIMode.ACTIVE ? "text-emerald-400" : "text-blue-400"} fontSizeClass={fontSizeClass} />
                    <StatusRow label="Sobreposição" value={settings.policy.canOverlay ? "ATIVADA" : "DESATIVADA"} color={settings.policy.canOverlay ? "text-emerald-400" : "text-slate-400"} fontSizeClass={fontSizeClass} />
                    <StatusRow label="IA Integrada" value={status} color={status === AIStatus.ERROR ? 'text-red-400' : 'text-blue-300'} fontSizeClass={fontSizeClass} />
                </div>
            </div>

            {settings.data.showAiLog && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <History className="w-3 h-3" /> REGISTROS DE ASSISTÊNCIA
                </h3>
                <Terminal logs={aiLogs} />
              </div>
            )}

            <div className="flex-1 min-h-[120px]">
               <Terminal logs={logs} />
            </div>
          </main>

          <footer className="fixed bottom-0 left-0 right-0 h-24 glass-heavy flex items-center justify-center px-6 z-40 border-t border-white/5">
              <div className="max-w-md w-full glass px-6 py-4 rounded-[40px] flex items-center justify-between shadow-2xl border border-white/10">
                    <button 
                      onClick={() => handleAnalyze()}
                      className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all shadow-xl active:scale-90 ${settings.isAiEnabled ? 'bg-blue-600 border-blue-400 shadow-blue-600/30' : 'bg-slate-800 border-white/5'}`}
                    >
                        <Cpu className={`w-8 h-8 ${settings.isAiEnabled ? 'text-white' : 'text-slate-600'}`} />
                    </button>
                    <div className="h-10 w-[1px] bg-white/10"></div>
                    <button 
                      onClick={() => setSettings({...settings, isOsaiEnabled: !settings.isOsaiEnabled})}
                      className={`p-4 rounded-3xl transition-all shadow-lg ${settings.isOsaiEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    >
                      <Power className="w-6 h-6" />
                    </button>
              </div>
          </footer>
        </>
      )}

      {settings.isOsaiEnabled && (
        <OSAIOverlay 
          status={status} 
          suggestion={currentSuggestion} 
          mode={settings.mode}
          ui={settings.ui}
          canWrite={settings.policy.canWrite}
          canListen={settings.policy.canListen}
          isAccessibilityMode={settings.isAccessibilityMode}
          onApprove={handleApprove} 
          onDeny={() => { setCurrentSuggestion(null); setStatus(AIStatus.IDLE); setLastUserRequest(null); }} 
          onAnalyze={handleAnalyze} 
          onClose={() => setSettings({...settings, isOsaiEnabled: false})}
        />
      )}

      {showSettings && (
        <SettingsDialog 
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setShowSettings(false)}
          onPurgeMemory={(p) => addLog(`[PURGE] Memória limpa.`)}
        />
      )}

      <style>{`
        .large-text-active .text-[10px] { font-size: 12px; }
        .large-text-active .text-[11px] { font-size: 14px; }
        .large-text-active .text-[9px] { font-size: 11px; }
        .large-text-active .text-xs { font-size: 0.875rem; }
        .large-text-active .text-sm { font-size: 1rem; }
      `}</style>
    </div>
  );
};

const PermissionBox = ({ icon: Icon, active, label, fontSizeClass }: any) => (
    <div className={`p-4 rounded-3xl flex flex-col items-center justify-center border transition-all ${active ? 'bg-white/5 border-emerald-500/30 text-emerald-400 shadow-[0_5px_15px_rgba(0,0,0,0.2)]' : 'bg-black/40 border-white/5 text-slate-700'}`}>
        <Icon className="w-5 h-5 mb-1.5" />
        <span className="text-[8px] font-black uppercase tracking-widest text-center">{label}</span>
    </div>
);

const StatusRow = ({ label, value, color, fontSizeClass }: any) => (
    <div className={`flex justify-between items-center ${fontSizeClass} font-bold`}>
        <span className="text-slate-500 uppercase tracking-tighter">{label}</span>
        <span className={color}>{value}</span>
    </div>
);

export default App;
