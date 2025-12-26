
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { OSAIOverlay } from './components/OSAIOverlay';
import { SettingsDialog } from './components/SettingsDialog';
import { BootSequence } from './components/BootSequence';
import { AIStatus, Suggestion, AppSettings, AIMode, SupportedLanguage, CognitiveProfile } from './types';
import { aiManager } from './services/aiManager';
import { PolicyEngine } from './services/policyEngine';
import { Haptics } from './services/haptics';
import { getTranslation } from './locales';
import { Settings, Cpu, ShieldCheck, Zap, Activity, Layers, Bell } from 'lucide-react';

const SETTINGS_KEY = 'osai_user_settings_v32';

const DEFAULT_SETTINGS: AppSettings = {
  isOsaiEnabled: true,
  isAiEnabled: true,
  isAccessibilityMode: false,
  mode: AIMode.PASSIVE,
  cognitiveProfile: CognitiveProfile.NORMAL,
  policy: {
    blockDangerousKeywords: true,
    requireApproval: true,
    sandboxExecution: true,
    canSee: true,
    canWrite: true,
    canListen: true, 
    canReadFiles: true,
    canAccessNetwork: true,
    canManageApps: true,
    canMakeCalls: true,
    canAccessContacts: true,
    canAccessLocation: false, 
    canOverlay: true,      
    canUseKeyboard: true, 
    canReadScreen: true,
    fullAppControl: true,
    isAiMicrophoneEnabled: false,
    isUserMicrophoneEnabled: true,
    isPassiveListeningEnabled: true,
    isCriticalAssistiveMode: false
  },
  ui: { transparency: 0.98, scale: 1.0, fontSize: 'normal' },
  data: {
    saveMemory: true,
    adaptiveLearning: true,
    learningLimitDays: 30,
    allowSuggestions: true, 
    voiceWakeWord: true,
    language: 'pt-BR',
    showAiLog: true,
    isTtsEnabled: true
  }
};

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<AIStatus>(navigator.onLine ? AIStatus.IDLE : AIStatus.OFFLINE);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const needsDoubleConfirmRef = useRef(false);
  
  const t = getTranslation(settings.data.language);

  const addLog = useCallback((msg: string, type: 'info' | 'error' | 'success' | 'task' = 'info') => {
    const prefix = { info: '•', error: '!', success: '✓', task: '>>' }[type];
    const timestamp = new Date().toLocaleTimeString(settings.data.language, { hour12: false });
    setLogs(prev => [...prev.slice(-99), `[${timestamp}] ${prefix} ${msg}`]);
  }, [settings.data.language]);

  useEffect(() => {
    const handleOnline = () => { setStatus(AIStatus.IDLE); addLog(t.ui.online, "success"); };
    const handleOffline = () => { setStatus(AIStatus.OFFLINE); addLog(t.ui.offline, "error"); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [t.ui.online, t.ui.offline, addLog]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleAnalyze = async (customPrompt?: string) => {
    if (status === AIStatus.OFFLINE) {
       addLog(t.ai.status.OFFLINE, "error");
       Haptics.error();
       return;
    }
    if (status === AIStatus.SUSPENDED || !settings.isAiEnabled) return;
    
    setStatus(AIStatus.ANALYZING);
    addLog(`${t.ui.reqCognitive}"${customPrompt}"`, 'info');
    
    try {
      const suggestion = await aiManager.getSuggestion({
        context: customPrompt || "Idle check.",
        profile: settings.cognitiveProfile,
        lang: settings.data.language,
        policy: settings.policy
      });
      
      if (suggestion) {
        const policyResult = PolicyEngine.validate(suggestion, settings);
        if (!policyResult.allowed) {
          addLog(`${t.ui.policyRejection}${policyResult.reason}`, 'error');
          setStatus(AIStatus.ERROR);
          Haptics.error();
          setTimeout(() => setStatus(AIStatus.IDLE), 3000);
          return;
        }
        
        needsDoubleConfirmRef.current = policyResult.requireDoubleConfirmation;
        setStatus(suggestion.isSuggestion ? AIStatus.READY : AIStatus.IDLE);
        setCurrentSuggestion(suggestion);
        if (suggestion.isSuggestion) Haptics.medium();
      } else {
        setStatus(AIStatus.ERROR);
        addLog(t.ui.malformed, "error");
        Haptics.error();
      }
    } catch (err) {
      setStatus(AIStatus.ERROR);
      addLog(`${t.ui.busFail}${err}`, "error");
      Haptics.error();
    }
  };

  const handleApprove = async () => {
    if (!currentSuggestion) return;

    if (status === AIStatus.READY && needsDoubleConfirmRef.current) {
      setStatus(AIStatus.DOUBLE_CONFIRMATION);
      addLog(t.ui.doubleConfirmReq, "info");
      Haptics.heavy();
      return;
    }

    setStatus(AIStatus.EXECUTING);
    addLog(`${t.ui.payload}${currentSuggestion.action}`, 'task');
    Haptics.medium();
    
    await new Promise(r => setTimeout(r, 1500));
    
    addLog(`${t.ui.success}${currentSuggestion.description.substring(0, 30)}...`, 'success');
    Haptics.success();
    setStatus(AIStatus.IDLE);
    setCurrentSuggestion(null);
  };

  const handleUpdatePolicy = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      policy: {
        ...prev.policy,
        [key]: value
      }
    }));
  };

  if (isBooting) return <BootSequence lang={settings.data.language} onComplete={() => { setIsBooting(false); Haptics.success(); }} />;

  return (
    <div className="fixed inset-0 bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden flex flex-col font-sans">
      <header className="h-20 border-b border-white/5 glass px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)] relative">
            <Cpu className="text-blue-400 w-5 h-5 animate-float" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-[12px] tracking-[0.2em] text-white">{t.ui.coreTitle}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={10} className="text-emerald-500" /> {t.ui.systemActive}
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 bg-white/5 rounded-2xl border border-white/10 relative">
            <Bell size={18} className="text-slate-400" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </button>
          <button 
            onClick={() => { setShowSettings(true); Haptics.light(); }} 
            className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-90"
          >
            <Settings size={20} className="text-slate-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <StatusCard label={t.ui.statusCardCore} value={t.ui.ready.split(' / ')[0]} icon={Zap} color="text-emerald-400" sub={t.ui.latency} />
          <StatusCard label={t.ui.statusCardMemory} value="84 MB" icon={Layers} color="text-blue-400" sub={t.ui.localCognition} />
        </div>

        <div className="glass rounded-[32px] p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> {t.ui.monitorTitle}
            </h2>
          </div>
          <Terminal logs={logs} title="SYSTEM LOGS" waitingMessage={t.ui.waitingPulse} />
        </div>

        <div className="py-10 flex flex-col items-center justify-center opacity-20 gap-4 pointer-events-none">
          <Cpu size={32} className="text-blue-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-blue-500">{t.ui.overlayActive}</span>
        </div>
      </main>

      <OSAIOverlay 
        status={status} 
        suggestion={currentSuggestion} 
        mode={settings.mode} 
        profile={settings.cognitiveProfile} 
        ui={settings.ui} 
        lang={settings.data.language} 
        canListen={settings.policy.canListen} 
        isPassiveListening={settings.policy.isPassiveListeningEnabled} 
        isAiMicEnabled={settings.policy.isAiMicrophoneEnabled}
        isUserMicEnabled={settings.policy.isUserMicrophoneEnabled}
        isTtsEnabled={settings.data.isTtsEnabled} 
        isAccessibilityMode={settings.isAccessibilityMode} 
        onApprove={handleApprove} 
        onDeny={() => { setStatus(AIStatus.IDLE); setCurrentSuggestion(null); Haptics.error(); }} 
        onAnalyze={handleAnalyze} 
        onUpdatePolicy={handleUpdatePolicy} 
        onClose={() => {}}
      />

      {showSettings && (
        <SettingsDialog 
          settings={settings} 
          onUpdate={setSettings} 
          onClose={() => setShowSettings(false)} 
          onPurgeMemory={() => aiManager.purgeMemory()} 
          onClearLogs={() => setLogs([])} 
        />
      )}
    </div>
  );
};

const StatusCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className="p-5 glass rounded-[32px] border border-white/5 flex flex-col gap-3 relative overflow-hidden group">
    <div className={`p-2 w-fit rounded-xl bg-white/5 ${color}`}><Icon size={16} /></div>
    <div className="flex flex-col">
      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
      <span className="text-lg font-extrabold text-white leading-tight">{value}</span>
      <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">{sub}</span>
    </div>
  </div>
);

export default App;
