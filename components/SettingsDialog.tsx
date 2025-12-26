
import React, { useState } from 'react';
import { AppSettings, SupportedLanguage } from '../types';
import { 
  X, Shield, Mic, Globe, Volume2, 
  BookOpen, Lock, AlertCircle, Waves, Ear, ShieldAlert, Camera, MapPin, BellRing, Eye, CheckCircle2, RefreshCw, Languages
} from 'lucide-react';
import { Haptics } from '../services/haptics';
import { getTranslation, locales } from '../locales';

interface SettingsDialogProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onClose: () => void;
  onPurgeMemory: () => void;
  onClearLogs?: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ settings, onUpdate, onClose, onPurgeMemory, onClearLogs }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState<'IDLE' | 'CHECKING' | 'READY' | 'DENIED'>('IDLE');
  const t = getTranslation(settings.data.language);

  const togglePolicy = (k: keyof AppSettings['policy']) => {
    Haptics.light();
    onUpdate({ ...settings, policy: { ...settings.policy, [k]: !settings.policy[k] } });
  };

  const checkHardware = async () => {
    setHardwareStatus('CHECKING');
    Haptics.medium();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setHardwareStatus('READY');
      Haptics.success();
    } catch (e) {
      setHardwareStatus('DENIED');
      Haptics.error();
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    Haptics.medium();
    onUpdate({ ...settings, data: { ...settings.data, language: lang } });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="glass w-full max-w-2xl rounded-[48px] overflow-hidden flex flex-col border border-white/10 shadow-2xl max-h-[94vh] animate-in fade-in zoom-in-95">
        <div className="p-7 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Shield className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black uppercase tracking-[0.2em] text-sm text-white">{t.ui.settingsTitle}</h2>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.ui.settingsSub}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/50"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-10 custom-scrollbar">
          
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Languages size={12}/> {t.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(locales) as SupportedLanguage[]).map((lang) => (
                <button 
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-tight border transition-all ${
                    settings.data.language === lang 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {locales[lang].name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                 <Waves size={12}/> {t.ui.voiceSensors}
               </h3>
               <button 
                onClick={checkHardware} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${
                  hardwareStatus === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 
                  hardwareStatus === 'DENIED' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
               >
                 {hardwareStatus === 'CHECKING' && <RefreshCw size={10} className="animate-spin" />}
                 {hardwareStatus === 'READY' && <CheckCircle2 size={10} />}
                 {hardwareStatus === 'IDLE' ? t.ui.hardwareCheck : (t.ui[hardwareStatus.toLowerCase() as keyof typeof t.ui] || hardwareStatus)}
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <PermissionToggle 
                  label={t.permissions.aiMic.label} 
                  active={settings.policy.isAiMicrophoneEnabled} 
                  onToggle={() => togglePolicy('isAiMicrophoneEnabled')} 
                  icon={Ear} 
                  description={t.permissions.aiMic.desc}
               />
               <PermissionToggle 
                  label={t.permissions.userMic.label} 
                  active={settings.policy.isUserMicrophoneEnabled} 
                  onToggle={() => togglePolicy('isUserMicrophoneEnabled')} 
                  icon={Mic} 
                  description={t.permissions.userMic.desc}
               />
               <PermissionToggle 
                  label={t.permissions.passive.label} 
                  active={settings.policy.isPassiveListeningEnabled} 
                  onToggle={() => togglePolicy('isPassiveListeningEnabled')} 
                  icon={BellRing} 
                  description={t.permissions.passive.desc}
               />
               <PermissionToggle 
                  label={t.permissions.tts.label} 
                  active={settings.data.isTtsEnabled} 
                  onToggle={() => onUpdate({...settings, data: {...settings.data, isTtsEnabled: !settings.data.isTtsEnabled}})} 
                  icon={Volume2} 
                  description={t.permissions.tts.desc}
               />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12}/> {t.ui.deviceAccess}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <PermissionToggle 
                  label={t.permissions.camera.label} 
                  active={settings.policy.canSee} 
                  onToggle={() => togglePolicy('canSee')} 
                  icon={Camera} 
                  description={t.permissions.camera.desc}
               />
               <PermissionToggle 
                  label={t.permissions.location.label} 
                  active={settings.policy.canAccessLocation} 
                  onToggle={() => togglePolicy('canAccessLocation')} 
                  icon={MapPin} 
                  description={t.permissions.location.desc}
               />
               <PermissionToggle 
                  label={t.permissions.screen.label} 
                  active={settings.policy.canReadScreen} 
                  onToggle={() => togglePolicy('canReadScreen')} 
                  icon={Eye} 
                  description={t.permissions.screen.desc}
               />
               <PermissionToggle 
                  label={t.permissions.web.label} 
                  active={settings.policy.canAccessNetwork} 
                  onToggle={() => togglePolicy('canAccessNetwork')} 
                  icon={Globe} 
                  description={t.permissions.web.desc}
               />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={12}/> {t.ui.securityAccessibility}
            </h3>
            <div className="space-y-3">
               <PermissionToggle 
                  label={t.permissions.accessibility.label} 
                  active={settings.isAccessibilityMode} 
                  onToggle={() => setShowDisclaimer(!settings.isAccessibilityMode)} 
                  icon={BookOpen} 
                  description={t.permissions.accessibility.desc}
               />
            </div>
             
             {showDisclaimer && !settings.isAccessibilityMode && (
               <div className="p-7 bg-red-600/5 border-2 border-red-500/20 rounded-[40px] space-y-4 animate-in fade-in">
                 <div className="flex items-center gap-3 text-red-400 font-black text-[11px] uppercase tracking-widest">
                   <AlertCircle size={18} /> {t.ui.riskWarning}
                 </div>
                 <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                   {t.ui.riskDescription}
                 </p>
                 <button 
                  onClick={() => { onUpdate({...settings, isAccessibilityMode: true}); setShowDisclaimer(false); Haptics.heavy(); }} 
                  className="w-full py-5 bg-red-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95"
                 >
                   {t.ui.confirmTotalAccess}
                 </button>
               </div>
             )}
          </section>

          <section className="pt-6 border-t border-white/5 flex gap-4">
            <button onClick={() => { onPurgeMemory(); Haptics.error(); }} className="flex-1 py-5 bg-white/5 text-slate-400 rounded-3xl font-black text-[9px] uppercase tracking-widest border border-white/5 hover:bg-red-500/10 hover:text-red-400">
               {t.ui.clearMemory}
            </button>
            <button onClick={() => { if(onClearLogs) onClearLogs(); Haptics.light(); }} className="flex-1 py-5 bg-white/5 text-slate-400 rounded-3xl font-black text-[9px] uppercase tracking-widest border border-white/5 hover:bg-blue-500/10 hover:text-blue-400">
               {t.ui.clearLogs}
            </button>
          </section>
        </div>

        <div className="p-7 bg-black/60 border-t border-white/10">
          <button onClick={onClose} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95">
            {t.ui.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};

const PermissionToggle = ({ label, active, onToggle, icon: Icon, description }: any) => (
  <button onClick={onToggle} className={`group flex items-center justify-between p-5 rounded-[32px] border transition-all duration-300 ${active ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'}`}>
    <div className="flex items-center gap-4 text-left">
      <div className={`p-3 rounded-2xl ${active ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
        <Icon size={18} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase text-white tracking-tight">{label}</span>
        {description && <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter opacity-70">{description}</span>}
      </div>
    </div>
    <div className={`w-11 h-6 rounded-full relative transition-all duration-500 flex items-center px-1 ${active ? 'bg-blue-500' : 'bg-white/10'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);
