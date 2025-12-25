import React from 'react';
import { AppSettings, SupportedLanguage, CognitiveProfile, PlatformType } from '../types';
import { platformManager } from '../services/platformManager';
import { X, Shield, Zap, Eye, Globe, Lock, MessageCircle, Activity, Keyboard, Layers, Type, AppWindow, Sun, MapPin, AlertTriangle, Users, History, Check, Mic, Phone, Volume2, VolumeX, Network, Layout, MousePointer2, FileText, Smartphone, AlertCircle, Trash2, Sliders } from 'lucide-react';

interface SettingsDialogProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
  onPurgeMemory: (period: 'today' | 'week' | 'month' | 'all') => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ settings, onUpdate, onClose, onPurgeMemory }) => {
  const platform = platformManager.getPlatform();
  const caps = platformManager.getCapabilities();

  const togglePolicy = (key: keyof AppSettings['policy']) => {
    onUpdate({
      ...settings,
      policy: { ...settings.policy, [key]: !settings.policy[key] }
    });
  };

  const updateData = (key: keyof AppSettings['data'], val: any) => {
    onUpdate({ ...settings, data: { ...settings.data, [key]: val } });
  };

  const updateUI = (key: keyof AppSettings['ui'], val: any) => {
    onUpdate({ ...settings, ui: { ...settings.ui, [key]: val } });
  };

  const updateProfile = (profile: CognitiveProfile) => {
    onUpdate({ ...settings, cognitiveProfile: profile });
  };

  const toggleMainSetting = (key: 'isAiEnabled' | 'isOsaiEnabled') => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col my-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 bg-blue-500/20 rounded-2xl">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-white tracking-tight uppercase text-lg">Orquestração Cognitiva</h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-black">{platform}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">OSAI CONTROL v5.5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 max-h-[75vh]">
          {/* Hardware Constraints Alert for iOS */}
          {platform === PlatformType.IOS && (
            <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-3xl flex gap-4 text-left">
               <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
               <div>
                  <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Restrições de Plataforma (iOS)</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed uppercase tracking-tight">O iOS restringe o uso do microfone em segundo plano e sobreposição de sistema fora do navegador. Mantenha o app em foco para melhor assistência.</p>
               </div>
            </div>
          )}

          {/* Master Controls Section */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Controles Principais</span>
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[32px] p-2 space-y-1">
              <PermissionRow 
                label="Processamento de IA Ativo" 
                desc="Ativa análise e sugestões automáticas" 
                active={settings.isAiEnabled} 
                onToggle={() => toggleMainSetting('isAiEnabled')} 
                icon={Zap} 
                color="text-yellow-400" 
              />
              <PermissionRow 
                label="Visibilidade do Overlay" 
                desc={caps.hasSystemOverlay ? "Janela flutuante sobre todo o sistema" : "Janela flutuante restrita ao App (iOS)"} 
                active={settings.isOsaiEnabled} 
                onToggle={() => toggleMainSetting('isOsaiEnabled')} 
                icon={Layout} 
                color="text-emerald-400"
                badge={!caps.hasSystemOverlay ? "RESTRICTED" : undefined}
              />
            </div>
          </section>

          {/* Cognitive Profile Section */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Users className="w-3.5 h-3.5" />
              <span>Perfil de Mediação</span>
            </h3>
            <div className="flex flex-col space-y-3">
              <ProfileButton 
                active={settings.cognitiveProfile === CognitiveProfile.NORMAL}
                onClick={() => updateProfile(CognitiveProfile.NORMAL)}
                icon={MessageCircle}
                title="1. MODO NORMAL (Reativo)"
                desc="IA reativa. Não sugere ações. Autonomia total do usuário."
                color="blue"
              />
              <ProfileButton 
                active={settings.cognitiveProfile === CognitiveProfile.ACTIVE}
                onClick={() => updateProfile(CognitiveProfile.ACTIVE)}
                icon={Activity}
                title="2. MODO ASSISTIVO (Proativo)"
                desc="IA sugere automações baseadas no contexto. Requer SIM."
                color="emerald"
              />
              <ProfileButton 
                active={settings.cognitiveProfile === CognitiveProfile.CRITICAL}
                onClick={() => updateProfile(CognitiveProfile.CRITICAL)}
                icon={ShieldAlert}
                title="3. MODO CRÍTICO (Protetivo)"
                desc="Segurança máxima. IA intervém em situações de risco."
                color="orange"
              />
            </div>
          </section>

          {/* Policy Section */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Privacidade e Segurança</span>
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[32px] p-2 space-y-1">
              <PermissionRow label="Escuta Ativa (Mic)" active={settings.policy.canListen} onToggle={() => togglePolicy('canListen')} icon={Mic} color="text-emerald-400" />
              <PermissionRow label="Escrita Assistida" active={settings.policy.canWrite} onToggle={() => togglePolicy('canWrite')} icon={Keyboard} color="text-blue-400" />
              <PermissionRow label="Visão do Sistema" active={settings.policy.canSee} onToggle={() => togglePolicy('canSee')} icon={Eye} color="text-purple-400" badge={!caps.hasSystemOverlay ? "ANDROID_ONLY" : undefined} />
              <PermissionRow label="Chamadas Emergência" active={settings.policy.canMakeCalls} onToggle={() => togglePolicy('canMakeCalls')} icon={Phone} color="text-red-400" />
            </div>
          </section>

          {/* Language Section */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Idioma da Interface</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => updateData('language', lang.code)}
                  className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${settings.data.language === lang.code ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}
                >
                  <span className="text-xs font-bold">{lang.label}</span>
                  <span className="text-lg">{lang.flag}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Advanced UI Section */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Customização do Overlay</span>
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Transparência</span>
                  <span className="text-blue-400">{Math.round(settings.ui.transparency * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.5" max="1" step="0.05" 
                  value={settings.ui.transparency} 
                  onChange={(e) => updateUI('transparency', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-black/40 rounded-full appearance-none"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Escala da UI</span>
                  <span className="text-blue-400">{Math.round(settings.ui.scale * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.8" max="1.2" step="0.05" 
                  value={settings.ui.scale} 
                  onChange={(e) => updateUI('scale', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-black/40 rounded-full appearance-none"
                />
              </div>
            </div>
          </section>

          {/* Purge Memory Section */}
          <section className="space-y-4 text-left pt-4">
            <div className="p-6 bg-red-600/5 border border-red-500/10 rounded-[40px] space-y-4">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Limpeza de Dados</h4>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">O OSAI armazena localmente um histórico de interações para melhorar a precisão cognitiva.</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                 <button onClick={() => onPurgeMemory('today')} className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black text-white uppercase border border-white/5">Hoje</button>
                 <button onClick={() => onPurgeMemory('all')} className="py-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-[9px] font-black text-red-400 uppercase border border-red-500/20">Tudo</button>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 flex justify-center">
            <button onClick={onClose} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">
              Salvar Alterações
            </button>
        </div>
      </div>
    </div>
  );
};

const PermissionRow = ({ label, desc, active, onToggle, icon: Icon, color, badge }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-[26px] transition-all">
    <div className="flex items-center space-x-4">
      <div className={`p-2.5 rounded-2xl bg-black/40 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-white uppercase tracking-tight">{label}</span>
          {badge && <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded-[4px] text-[7px] font-black uppercase tracking-tighter">{badge}</span>}
        </div>
        {desc && <p className="text-[9px] text-slate-500 font-bold tracking-tight mt-0.5 uppercase">{desc}</p>}
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${active ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

const ProfileButton = ({ active, onClick, icon: Icon, title, desc, color }: any) => {
  const colors = {
    blue: active ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10',
    emerald: active ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10',
    orange: active ? 'bg-orange-600 text-white shadow-orange-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
  };

  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-[32px] border transition-all text-left flex gap-4 items-start ${colors[color as keyof typeof colors]}`}
    >
      <div className={`p-3 rounded-2xl bg-black/20 ${active ? 'text-white' : 'text-slate-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black uppercase tracking-widest">{title}</span>
        <span className="text-[10px] font-bold opacity-60 mt-1 leading-relaxed">{desc}</span>
      </div>
      {active && <Check className="w-4 h-4 ml-auto shrink-0 mt-1" />}
    </button>
  );
};

const ShieldAlert = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="M12 8v4"/>
    <path d="M12 16h.01"/>
  </svg>
);