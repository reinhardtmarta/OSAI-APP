
import React from 'react';
import { AppSettings } from '../types';
import { 
  X, Shield, Mic, Globe, Volume2, AlertCircle, Ear, Eye, LayoutGrid, TerminalSquare
} from 'lucide-react';
import { Haptics } from '../services/haptics';
import { getTranslation } from '../locales';

interface SettingsDialogProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onClose: () => void;
  onPurgeMemory: () => void;
  onClearLogs?: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ settings, onUpdate, onClose, onPurgeMemory, onClearLogs }) => {
  const t = getTranslation(settings.data.language);

  const togglePolicy = (k: keyof AppSettings['policy']) => {
    Haptics.light();
    onUpdate({ ...settings, policy: { ...settings.policy, [k]: !settings.policy[k] } });
  };

  const updateData = (k: keyof AppSettings['data'], v: any) => {
    Haptics.light();
    onUpdate({ ...settings, data: { ...settings.data, [k]: v } });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="glass w-full max-w-2xl rounded-[48px] overflow-hidden flex flex-col border border-white/10 shadow-2xl max-h-[94vh]">
        <div className="p-7 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl"><Shield className="text-blue-400 w-6 h-6" /></div>
            <div>
              <h2 className="font-black uppercase tracking-[0.2em] text-sm text-white">{t.ui.settingsTitle}</h2>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Operational Panel</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-white/50"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-8 custom-scrollbar">
          
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Response Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <PermissionToggle 
                  label="Voice (TTS)" active={settings.data.isTtsEnabled} 
                  onToggle={() => updateData('isTtsEnabled', !settings.data.isTtsEnabled)} icon={Volume2} 
                  description="AI will speak responses aloud."
               />
               <PermissionToggle 
                  label="Microphone" active={settings.policy.isUserMicrophoneEnabled} 
                  onToggle={() => togglePolicy('isUserMicrophoneEnabled')} icon={Mic} 
                  description="Enable manual voice commands."
               />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Access Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <PermissionToggle 
                  label="Screen Reading (OCR)" active={settings.policy.canReadScreen} 
                  onToggle={() => togglePolicy('canReadScreen')} icon={Eye} 
                  description="Visual analysis of what you see."
               />
               <PermissionToggle 
                  label="Open Applications" active={settings.policy.fullAppControl} 
                  onToggle={() => togglePolicy('fullAppControl')} icon={LayoutGrid} 
                  description="Allow AI to launch other apps."
               />
               <PermissionToggle 
                  label="Assisted Typing" active={settings.policy.canOverlay} 
                  onToggle={() => togglePolicy('canOverlay')} icon={TerminalSquare} 
                  description="Allow AI to write for you."
               />
               <PermissionToggle 
                  label="Web Search" active={settings.policy.canAccessNetwork} 
                  onToggle={() => togglePolicy('canAccessNetwork')} icon={Globe} 
                  description="Real-time information searches."
               />
            </div>
          </section>

          <section className="p-6 bg-red-500/5 border border-red-500/10 rounded-[32px] space-y-4">
             <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Security</h3>
             <button onClick={() => { onPurgeMemory(); Haptics.heavy(); }} className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase">Purge Cognitive Memory</button>
          </section>
        </div>

        <div className="p-7 bg-black/60 border-t border-white/10">
          <button onClick={onClose} className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] uppercase text-xs tracking-[0.4em]">
            Save and Synchronize
          </button>
        </div>
      </div>
    </div>
  );
};

const PermissionToggle = ({ label, active, onToggle, icon: Icon, description }: any) => (
  <button onClick={onToggle} className={`flex items-center justify-between p-5 rounded-[32px] border transition-all ${active ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5'}`}>
    <div className="flex items-center gap-4 text-left">
      <div className={`p-3 rounded-2xl ${active ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}><Icon size={18} /></div>
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase text-white tracking-tight">{label}</span>
        {description && <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{description}</span>}
      </div>
    </div>
    <div className={`w-11 h-6 rounded-full relative flex items-center px-1 ${active ? 'bg-blue-500' : 'bg-white/10'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);