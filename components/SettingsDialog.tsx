
import React from 'react';
import { AppSettings, SupportedLanguage, CognitiveProfile } from '../types';
import { X, Shield, Zap, Eye, Globe, Lock, MessageCircle, Activity, Keyboard, Layers, Type, AppWindow, Sun, MapPin, AlertTriangle, Users, History, Check, Mic, Phone, Volume2, VolumeX, Network, Layout, MousePointer2, FileText, Smartphone } from 'lucide-react';

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
              <h2 className="font-black text-white tracking-tight uppercase text-lg">Orquestração Cognitiva</h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">OSAI CONTROL v5.5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 max-h-[75vh]">
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
                desc="Mantém a janela do assistente visível" 
                active={settings.isOsaiEnabled} 
                onToggle={() => toggleMainSetting('isOsaiEnabled')} 
                icon={Layout} 
                color="text-emerald-400" 
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
                desc="IA sugere passos e aguarda consentimento explícito."
                color="emerald"
              />
              <ProfileButton 
                active={settings.cognitiveProfile === CognitiveProfile.CRITICAL}
                onClick={() => updateProfile(CognitiveProfile.CRITICAL)}
                icon={AlertTriangle}
                title="3. MODO CRÍTICO (Prioridade)"
                desc="Foco em acessibilidade e monitoramento de emergência."
                color="orange"
              />
            </div>
          </section>

          {/* Detailed Permissions */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Permissões de Segurança</span>
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[32px] p-2 space-y-1">
              <PermissionRow label="Microfone" desc="Captura de comandos por voz" active={settings.policy.canListen} onToggle={() => togglePolicy('canListen')} icon={Mic} color="text-red-400" />
              <PermissionRow label="Visão de Tela" desc="Leitura OCR e contexto visual" active={settings.policy.canReadScreen} onToggle={() => togglePolicy('canReadScreen')} icon={Eye} color="text-purple-400" />
              <PermissionRow label="Acesso à Rede" desc="Permite IA buscar dados externos" active={settings.policy.canAccessNetwork} onToggle={() => togglePolicy('canAccessNetwork')} icon={Network} color="text-blue-500" />
              <PermissionRow label="Chamadas" desc="Permite sugerir discagem" active={settings.policy.canMakeCalls} onToggle={() => togglePolicy('canMakeCalls')} icon={Phone} color="text-emerald-500" />
              <PermissionRow label="Escrita/Teclado" desc="Permite IA preencher campos" active={settings.policy.canWrite} onToggle={() => togglePolicy('canWrite')} icon={Keyboard} color="text-orange-400" />
              <PermissionRow label="Arquivos" desc="Permite leitura de documentos" active={settings.policy.canReadFiles} onToggle={() => togglePolicy('canReadFiles')} icon={FileText} color="text-amber-500" />
            </div>
          </section>

          {/* Settings Section */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Idioma e Resposta</span>
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[32px] p-4 space-y-4">
              <PermissionRow label="Sintetizador de Voz" desc="IA responde falando" active={settings.data.isTtsEnabled} onToggle={() => updateData('isTtsEnabled', !settings.data.isTtsEnabled)} icon={Volume2} color="text-blue-400" />
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateData('language', lang.code)}
                    className={`p-3 rounded-2xl border transition-all flex items-center space-x-3 ${settings.data.language === lang.code ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-[10px] font-bold text-white uppercase">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Memory Management */}
          <section className="space-y-4 bg-red-600/5 p-6 rounded-[32px] border border-red-500/10 text-left">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] flex items-center space-x-2">
              <History className="w-3.5 h-3.5" />
              <span>Gestão de Memória</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">A purga remove o contexto imediato da conversa, mas não altera as políticas de segurança.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => onPurgeMemory('all')} className="px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-95">
                Limpar Contexto
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ProfileButton = ({ active, onClick, icon: Icon, title, desc, color }: any) => {
  const activeStyles = {
    blue: 'bg-blue-600/20 border-blue-500/50 ring-blue-500/20 shadow-blue-500/10',
    emerald: 'bg-emerald-600/20 border-emerald-500/50 ring-emerald-500/20 shadow-emerald-500/10',
    orange: 'bg-orange-600/20 border-orange-500/50 ring-orange-500/20 shadow-orange-500/10'
  }[color as 'blue' | 'emerald' | 'orange'];

  const iconColors = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    orange: 'text-orange-400'
  }[color as 'blue' | 'emerald' | 'orange'];

  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-[32px] border transition-all text-left flex gap-4 items-start ${active ? `${activeStyles} ring-1 shadow-lg` : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'}`}
    >
      <Icon className={`w-6 h-6 ${iconColors} shrink-0 mt-1`} />
      <div>
        <div className="text-sm font-black text-white uppercase tracking-tighter">{title}</div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">{desc}</p>
      </div>
    </button>
  );
};

const PermissionRow = ({ label, desc, active, onToggle, icon: Icon, color }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-[28px] transition-all group">
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-black text-white uppercase tracking-tight">{label}</div>
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-tight">{desc}</div>
      </div>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${active ? 'bg-blue-600' : 'bg-white/10'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-all duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);
