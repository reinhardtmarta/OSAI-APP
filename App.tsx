
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

const SETTINGS_KEY = 'osai_user_settings_v33';

const DEFAULT_SETTINGS: AppSettings = {
  isOsaiEnabled: true,
  isAiEnabled: true,
  isAccessibilityMode: false,
  mode: AIMode.ACTIVE, // Default to Active for faster proactivity
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
    language: 'en-US', // FORCED DEFAULT TO ENGLISH
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
  const lastMsgRef = useRef<string>('');
  const [status, setStatus] = useState<AIStatus>(navigator.onLine ? AIStatus.IDLE : AIStatus.OFFLINE);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const needsDoubleConfirmRef = useRef(false);
  
  const t = getTranslation(settings.data.language);

  const addLog = useCallback((msg: string, type: 'info' | 'error' | 'success' | 'task' = 'info') => {
    if (msg === lastMsgRef.current) return;
    lastMsgRef.current = msg;
    const prefix = { info: '•', error: '!', success: '✓', task: '>>' }[type];
    const timestamp = new Date().toLocaleTimeString(settings.data.language, { hour12: false });
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${prefix} ${msg}`]);
  }, [settings.data.language]);

  const handleAnalyze = async (customPrompt?: string) => {
    if (status === AIStatus.OFFLINE) return;
    setStatus(AIStatus.ANALYZING);
    
    try {
      const suggestion = await aiManager.getSuggestion({
        context: customPrompt || "Idle check.",
        profile: settings.cognitiveProfile,
        lang: settings.data.language,
        policy: settings.policy
      });
      
      if (suggestion) {
        const mustDoubleConfirm = settings.policy.isCriticalAssistiveMode || 
                             suggestion.riskLevel === 'MEDIUM' || 
                             suggestion.riskLevel === 'HIGH';

        needsDoubleConfirmRef.current = mustDoubleConfirm;
        setStatus(suggestion.isSuggestion ? AIStatus.READY : AIStatus.IDLE);
        setCurrentSuggestion(suggestion);
        addLog(`Cognitive result received`, 'info');
      }
    } catch (err) {
      setStatus(AIStatus.ERROR);
      addLog(`Bus Fault: Logic Engine Unreachable`, "error");
    }
  };

  const handleApprove = async () => {
    if (!currentSuggestion) return;
    setStatus(AIStatus.EXECUTING);
    addLog(`Executing Action: ${currentSuggestion.action}`, 'task');
    Haptics.success();
    setStatus(AIStatus.IDLE);
    setCurrentSuggestion(null);
  };

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  if (isBooting) return <BootSequence lang={settings.data.language} onComplete={() => { setIsBooting(false); addLog("OSAI Core Online", "success"); }} />;

  return (
    <div className="fixed inset-0 bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden flex flex-col font-sans">
      <header className="h-24 border-b border-white/5 glass px-8 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative group cursor-pointer">
            <Cpu className="text-blue-400 w-6 h-6 animate-float" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-[14px] tracking-[0.3em] text-white uppercase">{t.ui.coreTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} className="text-emerald-500" /> {t.ui.systemActive}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Language</span>
             <span className="text-[11px] font-bold text-blue-400">{t.name}</span>
          </div>
          <button 
            onClick={() => { setShowSettings(true); Haptics.light(); }} 
            className="p-4 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all active:scale-90 shadow-xl"
          >
            <Settings size={22} className="text-slate-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatusCard label={t.ui.statusCardCore} value="ONLINE" icon={Zap} color="text-emerald-400" sub={t.ui.latency} />
          <StatusCard label={t.ui.statusCardMemory} value={t.ui.ready.split('/')[0]} icon={Layers} color="text-blue-400" sub={t.ui.localCognition} />
        </div>

        <div className="glass rounded-[48px] p-8 border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Activity size={120} className="text-blue-500" />
          </div>
          <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3">
            <Activity size={14} className="text-blue-500" /> {t.ui.monitorTitle}
          </h2>
          <Terminal logs={logs} title={t.ui.systemLogs} waitingMessage={t.ui.waitingPulse} />
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
        onDeny={() => { setStatus(AIStatus.IDLE); setCurrentSuggestion(null); Haptics.error(); addLog("Action Interrupted", "info"); }} 
        onAnalyze={handleAnalyze} 
        onUpdatePolicy={(k, v) => setSettings(s => ({...s, policy: {...s.policy, [k]: v}}))} 
        onLog={addLog}
        onClose={() => {}}
      />

      {showSettings && (
        <SettingsDialog 
          settings={settings} 
          onUpdate={setSettings} 
          onClose={() => setShowSettings(false)} 
          onPurgeMemory={() => { aiManager.purgeMemory(); addLog("Cognitive Cache Cleared", "error"); }} 
          onClearLogs={() => setLogs([])} 
        />
      )}
    </div>
  );
};

const StatusCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className="p-6 glass rounded-[40px] border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all">
    <div className={`p-3 w-fit rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
      <span className="text-2xl font-black text-white leading-tight mt-1">{value}</span>
      <span className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-tighter">{sub}</span>
    </div>
  </div>
);

export default App;
