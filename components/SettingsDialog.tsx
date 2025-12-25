
import React, { useState } from 'react';
import { AppSettings, AIMode, SupportedLanguage } from '../types';
import { X, Shield, Zap, Eye, Mic, Globe, Accessibility, Languages, Lock, CheckCircle2, Users, Radio, MessageCircle, Activity, History, Keyboard, Layers, Type, AppWindow, Sun, MapPin } from 'lucide-react';

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
  const [requestingMic, setRequestingMic] = useState(false);

  const togglePolicy = (key: keyof AppSettings['policy']) => {
    onUpdate({
      ...settings,
      policy: { ...settings.policy, [key]: !settings.policy[key] }
    });
  };

  const updateData = (key: any, val: any) => {
    onUpdate({ ...settings, data: { ...settings.data, [key]: val } });
  };

  const updateUI = (key: keyof AppSettings['ui'], val: any) => {
    onUpdate({ ...settings, ui: { ...settings.ui, [key]: val } });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col my-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 rounded-2xl">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="font-black text-white tracking-tight uppercase text-lg">Centro de Controle</h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Kernel OSAI v5.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Active Intel */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Inteligência Ativa</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onUpdate({...settings, mode: AIMode.PASSIVE})}
                className={`p-4 rounded-3xl border transition-all text-left ${settings.mode === AIMode.PASSIVE ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-white/5 border-white/5'}`}
              >
                <MessageCircle className={`w-5 h-5 mb-3 ${settings.mode === AIMode.PASSIVE ? 'text-blue-400' : 'text-slate-500'}`} />
                <div className="text-sm font-black text-white">Modo Passivo</div>
                <p className="text-[10px] text-slate-500 mt-1">A IA responde a comandos específicos.</p>
              </button>

              <button 
                onClick={() => onUpdate({...settings, mode: AIMode.ACTIVE})}
                className={`p-4 rounded-3xl border transition-all text-left ${settings.mode === AIMode.ACTIVE ? 'bg-emerald-600/20 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-white/5 border-white/5'}`}
              >
                <Activity className={`w-5 h-5 mb-3 ${settings.mode === AIMode.ACTIVE ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="text-sm font-black text-white">Modo Ativo</div>
                <p className="text-[10px] text-slate-500 mt-1">Assistência contínua proativa.</p>
              </button>
            </div>
          </section>

          {/* Interface Visual Settings */}
          <section className="space-y-6 bg-white/5 p-6 rounded-[32px] border border-white/5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Sun className="w-3.5 h-3.5 text-orange-400" />
              <span>Aparência da Interface</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-tight">Tamanho da Fonte</span>
                </div>
                <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => updateUI('fontSize', 'normal')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.ui.fontSize === 'normal' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Normal
                  </button>
                  <button 
                    onClick={() => updateUI('fontSize', 'large')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.ui.fontSize === 'large' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Grande
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-tight">Transparência do Overlay</span>
                  </div>
                  <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                    {Math.round(settings.ui.transparency * 100)}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.ui.transparency}
                  onChange={(e) => updateUI('transparency', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all hover:accent-blue-400"
                />
              </div>
            </div>
          </section>

          {/* System Permissions */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Acessos de Sistema</span>
            </h3>
            <div className="bg-white/5 border border-white/5 rounded-[32px] p-2 space-y-1">
              <PermissionRow label="Internet" desc="Busca de dados externos" active={settings.policy.canAccessNetwork} onToggle={() => togglePolicy('canAccessNetwork')} icon={Globe} color="text-blue-400" />
              <PermissionRow label="Visão de Tela" desc="IA interpreta o que você vê" active={settings.policy.canReadScreen} onToggle={() => togglePolicy('canReadScreen')} icon={Eye} color="text-purple-400" />
              <PermissionRow label="Uso de Aplicativos" desc="Permitir IA usar apps em seu nome" active={settings.policy.canManageApps} onToggle={() => togglePolicy('canManageApps')} icon={AppWindow} color="text-pink-400" />
              <PermissionRow label="Localização" desc="Assistência baseada em GPS (H.I.L)" active={settings.policy.canAccessLocation} onToggle={() => togglePolicy('canAccessLocation')} icon={MapPin} color="text-emerald-400" />
              <PermissionRow label="Controle de Escrita" desc="IA digita e preenche campos" active={settings.policy.canUseKeyboard} onToggle={() => togglePolicy('canUseKeyboard')} icon={Keyboard} color="text-emerald-400" />
              <PermissionRow label="Sempre no Topo" desc="Overlay fixo sobre outros apps" active={settings.policy.canOverlay} onToggle={() => togglePolicy('canOverlay')} icon={Layers} color="text-indigo-400" />
              <PermissionRow label="Contatos" desc="Ligar para ajuda ou conhecidos" active={settings.policy.canAccessContacts} onToggle={() => togglePolicy('canAccessContacts')} icon={Users} color="text-orange-400" />
            </div>
          </section>

          {/* Language Selection */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Languages className="w-3.5 h-3.5" />
              <span>Idioma</span>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateData('language', lang.code)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1.5 ${
                    settings.data.language === lang.code ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">{lang.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2 px-1">
              <Accessibility className="w-3.5 h-3.5" />
              <span>Protocolos</span>
            </h3>
            <div className="space-y-2">
              <PermissionRow label="Protocolo H.I.L" desc="Ajuda prioritária para deficientes" active={settings.isAccessibilityMode} onToggle={() => onUpdate({...settings, isAccessibilityMode: !settings.isAccessibilityMode})} icon={Accessibility} color="text-orange-400" />
              <PermissionRow label="Monitor de IA" desc="Exibir logs em tempo real no dashboard" active={settings.data.showAiLog} onToggle={() => updateData('showAiLog', !settings.data.showAiLog)} icon={History} color="text-blue-400" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const PermissionRow = ({ label, desc, active, onToggle, icon: Icon, color }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
    <div className="flex items-center space-x-3">
      <div className={`p-2.5 rounded-xl bg-black/40 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-black text-white tracking-tight">{label}</div>
        <div className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</div>
      </div>
    </div>
    <button onClick={onToggle} className={`w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner ${active ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${active ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);
