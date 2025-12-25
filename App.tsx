import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { OSAIOverlay } from './components/OSAIOverlay';
import { SettingsDialog } from './components/SettingsDialog';
import { AIStatus, Suggestion, AppSettings, AIMode, SupportedLanguage, CognitiveProfile, ConsentState } from './types';
import { getSuggestion } from './services/geminiService';
import { PolicyEngine } from './services/policyEngine';
import { audit } from './services/auditLog';
import { classifyIntent, isExplicitConsent } from './services/policy';
import { Settings, Power, Cpu, Shield, Mic, Activity, AlertOctagon, Info, Lock, ShieldAlert } from 'lucide-react';

const SETTINGS_KEY = 'osai_user_settings_v12_shielded';

const DEFAULT_SETTINGS: AppSettings = {
  isOsaiEnabled: true,
  isAiEnabled: true,
  isAccessibilityMode: true,
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
    canAccessNetwork: false,
    canManageApps: true,
    canMakeCalls: true,
    canAccessContacts: false,
    canAccessLocation: false, 
    canOverlay: true,      
    canUseKeyboard: true, 
    canReadScreen: true,  
  },
  ui: { transparency: 0.98, scale: 1.0, fontSize: 'normal' },
  data: {
    saveMemory: true,
    allowSuggestions: true, 
    voiceWakeWord: true,
    language: 'pt-BR',
    showAiLog: true,
    isTtsEnabled: true
  }
};

const PROFILE_INFO = {
  [CognitiveProfile.NORMAL]: {
    color: 'text-blue-400',
    bg: 'bg-blue-600/10 border-blue-500/20',
    desc: 'Modo Normal: IA reativa. Ações externas desativadas.',
    icon: Shield
  },
  [CognitiveProfile.ACTIVE]: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10 border-emerald-500/20',
    desc: 'Modo Assistivo: IA proativa. Sugestões exigem SIM.',
    icon: Activity
  },
  [CognitiveProfile.CRITICAL]: {
    color: 'text-orange-400',
    bg: 'bg-orange-600/10 border-orange-500/20',
    desc: 'Modo Crítico: IA protetiva. Prioridade Acessibilidade.',
    icon: ShieldAlert
  }
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [logs, setLogs] = useState<string[]>(["[OSAI] Kernel v5.5 Shielded iniciado."]);
  const [status, setStatus] = useState<AIStatus>(AIStatus.IDLE);
  const [consentState, setConsentState] = useState<ConsentState>(ConsentState.IDLE);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const timeoutIdRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const masterKill = useCallback(() => {
    setStatus(AIStatus.SUSPENDED);
    setConsentState(ConsentState.CANCELLED);
    setCurrentSuggestion(null);
    if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
    addLog("!!! KILL SWITCH ATIVADO - SISTEMA SUSPENSO !!!");
    audit.log('SECURITY', AIStatus.SUSPENDED, "Kill Switch acionado manualmente.");
    
    setTimeout(() => {
      setStatus(AIStatus.IDLE);
      setConsentState(ConsentState.IDLE);
      addLog("[SYSTEM] Cooldown finalizado. Modo Idle.");
    }, 5000);
  }, [addLog]);

  const handleUpdatePolicy = useCallback((key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      policy: { ...prev.policy, [key as keyof AppSettings['policy']]: value }
    }));
    addLog(`[POLICY] Hardware atualizado: ${key} = ${value}`);
  }, [addLog]);

  const handleDeny = useCallback((reason: string = "Cancelado pelo usuário.") => {
    audit.log('CONSENT', AIStatus.IDLE, `Ação rejeitada: ${reason}`);
    addLog(`[AUDIT] CANCELLED: ${reason}`);
    setConsentState(ConsentState.CANCELLED);
    setCurrentSuggestion(null);
    setStatus(AIStatus.IDLE);
    if (timeoutIdRef.current) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setTimeout(() => setConsentState(ConsentState.IDLE), 2000);
  }, [addLog]);

  const handleApprove = useCallback(async () => {
    if (!currentSuggestion || status === AIStatus.SUSPENDED) return;
    
    audit.log('EXECUTION', AIStatus.EXECUTING, `Confirmado: ${currentSuggestion.action}`);
    setConsentState(ConsentState.CONFIRMED);
    setStatus(AIStatus.EXECUTING);
    addLog(`[AUDIT] CONFIRMED: ${currentSuggestion.action}`);
    
    await new Promise(r => setTimeout(r, 1500));
    setStatus(AIStatus.COOLDOWN);
    addLog(`[SYSTEM] EXECUTED.`);
    
    setTimeout(() => {
      setStatus(AIStatus.IDLE);
      setConsentState(ConsentState.IDLE);
      setCurrentSuggestion(null);
    }, 2000);
  }, [currentSuggestion, status, addLog]);

  const handleAnalyze = async (customPrompt?: string) => {
    if (status === AIStatus.SUSPENDED || !settings.isAiEnabled) {
      if (!settings.isAiEnabled) addLog("[SYSTEM] IA de Ajuda desativada nas configurações.");
      return;
    }

    if (customPrompt && PolicyEngine.isHardInterrupt(customPrompt)) {
      masterKill();
      return;
    }

    if (consentState === ConsentState.WAITING_FOR_EXPLICIT_YES && customPrompt) {
      if (isExplicitConsent(customPrompt)) {
        await handleApprove();
        return;
      } else {
        handleDeny(`Não confirmado ("${customPrompt}").`);
        return;
      }
    }
    
    setStatus(AIStatus.ANALYZING);
    audit.log('SYSTEM', AIStatus.ANALYZING, `Iniciando análise: ${customPrompt || 'Repouso'}`);
    
    const suggestion = await getSuggestion(
      customPrompt || "Atividade em repouso.", 
      settings.cognitiveProfile, 
      settings.data.language,
      settings.policy
    );
    
    if (suggestion) {
      const policyResult = PolicyEngine.validate(suggestion, settings);
      
      if (!policyResult.allowed) {
        audit.log('GOVERNANCE', AIStatus.ERROR, `Bloqueio de Política: ${policyResult.reason}`);
        addLog(`[GOVERNANCE] BLOQUEADO: ${policyResult.reason}`);
        setStatus(AIStatus.ERROR);
        setConsentState(ConsentState.CANCELLED);
        setTimeout(() => setStatus(AIStatus.IDLE), 3000);
        return;
      }

      setStatus(AIStatus.READY);
      setCurrentSuggestion(suggestion);
      
      if (suggestion.isSuggestion) {
          setConsentState(ConsentState.WAITING_FOR_EXPLICIT_YES);
          audit.log('CONSENT', AIStatus.READY, `Aguardando confirmação para: ${suggestion.action}`);
          if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = window.setTimeout(() => {
            handleDeny("Timeout: Sem resposta.");
          }, 30000);
      } else {
          setConsentState(ConsentState.IDLE);
          setStatus(AIStatus.IDLE);
      }
    } else {
      setStatus(AIStatus.ERROR);
      setConsentState(ConsentState.IDLE);
    }
  };

  const currentProfileInfo = PROFILE_INFO[settings.cognitiveProfile];
  const ProfileIcon = currentProfileInfo.icon;

  return (
    <div className={`min-h-screen w-full flex flex-col bg-[#020617] font-sans transition-all duration-500 ${status === AIStatus.SUSPENDED ? 'grayscale contrast-125 brightness-75' : ''}`}>
      <header className="sticky top-0 h-16 border-b border-white/5 glass px-4 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${currentProfileInfo.bg.split(' ')[0].replace('/10', '')}`}>
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter">OSAI SHIELDED v5.5</h1>
            <div className="flex items-center space-x-1">
               <ProfileIcon className={`w-2.5 h-2.5 ${currentProfileInfo.color}`} />
               <span className={`text-[8px] font-bold uppercase ${currentProfileInfo.color}`}>{settings.cognitiveProfile} PROFILE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <button 
              onClick={masterKill} 
              className={`p-2.5 rounded-2xl text-white transition-all active:scale-90 shadow-lg ${status === AIStatus.SUSPENDED ? 'bg-red-900 animate-pulse' : 'bg-red-600 hover:bg-red-500'}`} 
              title="Kill Switch"
            >
               <AlertOctagon className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300">
               <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      <main className="flex-1 p-5 pb-32 flex flex-col space-y-6 max-w-lg mx-auto w-full">
        <div className={`p-4 rounded-[32px] border ${currentProfileInfo.bg} flex items-start space-x-4 animate-in fade-in slide-in-from-top-2`}>
           <div className={`p-2 rounded-xl bg-black/40 ${currentProfileInfo.color}`}>
              <Info className="w-4 h-4" />
           </div>
           <div>
              <p className="text-[10px] font-black text-white uppercase tracking-tight">{currentProfileInfo.desc}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest">Educação: Ações governadas por política estática.</p>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
            <PermissionBox icon={Shield} active={true} label="GOVERN" />
            <PermissionBox icon={Mic} active={settings.policy.canListen} label="VOICE" />
            <PermissionBox icon={status === AIStatus.SUSPENDED ? Lock : Activity} active={status !== AIStatus.SUSPENDED} label="STATUS" />
            <PermissionBox icon={ShieldAlert} active={consentState === ConsentState.WAITING_FOR_EXPLICIT_YES} label="POLICY" />
        </div>

        <div className="glass p-6 rounded-[32px] border border-white/10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Activity className="w-3 h-3" />
               <span>ESTADO DO SISTEMA</span>
            </h3>
            <div className="space-y-3">
                <StatusRow label="Estado Técnico" value={status} color={status === AIStatus.SUSPENDED ? 'text-red-500 font-black' : 'text-blue-400'} />
                <StatusRow label="Fluxo Ativo" value={consentState === ConsentState.IDLE ? "REPOUSO" : consentState} color="text-orange-400" />
                <StatusRow label="Governança" value="DETERMINÍSTICA" color="text-emerald-400" />
            </div>
        </div>

        <Terminal logs={logs} />
      </main>

      {/* REGRA ABSOLUTA: Overlay sempre visível enquanto o App estiver aberto.
          Removido o condicional settings.isOsaiEnabled para assegurar a janela flutuante como elemento fixo da UI. */}
      <OSAIOverlay 
        status={status} 
        suggestion={currentSuggestion} 
        mode={settings.mode}
        profile={settings.cognitiveProfile}
        ui={settings.ui}
        lang={settings.data.language}
        canWrite={settings.policy.canWrite}
        canListen={settings.policy.canListen}
        isTtsEnabled={settings.data.isTtsEnabled}
        isAccessibilityMode={settings.isAccessibilityMode}
        onApprove={handleApprove} 
        onDeny={handleDeny} 
        onAnalyze={handleAnalyze} 
        onUpdatePolicy={handleUpdatePolicy}
        onClose={() => { /* Overlay é estrutural e permanente */ }}
      />

      {showSettings && (
        <SettingsDialog 
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setShowSettings(false)}
          onPurgeMemory={() => addLog(`[MEMORY] Reset.`)}
        />
      )}
    </div>
  );
};

const PermissionBox = ({ icon: Icon, active, label }: any) => (
    <div className={`p-4 rounded-3xl flex flex-col items-center border transition-all ${active ? 'bg-white/5 border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5' : 'bg-black/40 border-white/5 text-slate-700'}`}>
        <Icon className="w-5 h-5 mb-1.5" />
        <span className="text-[8px] font-black">{label}</span>
    </div>
);

const StatusRow = ({ label, value, color }: any) => (
    <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-slate-500 uppercase tracking-tighter">{label}</span>
        <span className={`${color} tracking-tight`}>{value}</span>
    </div>
);

export default App;