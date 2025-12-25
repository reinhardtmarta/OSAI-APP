
export enum AIStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  ERROR = 'ERROR',
  CALLING = 'CALLING'
}

export enum AIMode {
  ACTIVE = 'ACTIVE', 
  PASSIVE = 'PASSIVE' 
}

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'zh-CN' | 'ja-JP';

export interface SecurityPolicy {
  blockDangerousKeywords: boolean;
  requireApproval: boolean;
  sandboxExecution: boolean;
  canSee: boolean;         
  canWrite: boolean;       
  canListen: boolean;      
  canReadFiles: boolean;   
  canAccessNetwork: boolean; 
  canManageApps: boolean;  
  canMakeCalls: boolean;
  canAccessContacts: boolean;
  canAccessLocation: boolean; // Added for location-based assistance
  canOverlay: boolean;      // Permission to stay on top of other apps
  canUseKeyboard: boolean;  // Permission to intercept or simulate keystrokes
  canReadScreen: boolean;   // Permission to analyze screen content
}

export interface UIConfig {
  transparency: number;
  scale: number;
  fontSize: 'normal' | 'large'; // Added font size option
}

export interface DataConfig {
  saveMemory: boolean;
  allowSuggestions: boolean;
  voiceWakeWord: boolean;
  language: SupportedLanguage; 
  showAiLog: boolean;
}

export interface Suggestion {
  id: string;
  action: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  context: string;
  type?: 'code' | 'system' | 'network' | 'emergency' | 'call'; 
}

export interface AppSettings {
  isOsaiEnabled: boolean;
  isAiEnabled: boolean;
  isAccessibilityMode: boolean; 
  mode: AIMode;
  policy: SecurityPolicy;
  ui: UIConfig;
  data: DataConfig;
}
