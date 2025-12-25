
export enum AIStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  COOLDOWN = 'COOLDOWN',
  ERROR = 'ERROR',
  CALLING = 'CALLING',
  SUSPENDED = 'SUSPENDED' // Estado de Kill Switch ou Erro Crítico
}

export enum ConsentState {
  IDLE = 'IDLE',
  INTENT_DETECTED = 'INTENT_DETECTED',
  ACTION_REQUIRES_CONFIRMATION = 'ACTION_REQUIRES_CONFIRMATION',
  WAITING_FOR_EXPLICIT_YES = 'WAITING_FOR_EXPLICIT_YES',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum AIMode {
  ACTIVE = 'ACTIVE', 
  PASSIVE = 'PASSIVE' 
}

export enum CognitiveProfile {
  NORMAL = 'NORMAL',
  ACTIVE = 'ACTIVE',
  CRITICAL = 'CRITICAL'
}

export type AIIntent = 'WRITING' | 'CODING' | 'ANALYSIS' | 'IDEATION' | 'SYSTEM' | 'EMERGENCY';
export type BlockType = 'TEXT' | 'CODE' | 'IDEA' | 'DRAFT' | 'SYSTEM_CMD';
export type CriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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
  canAccessLocation: boolean;
  canOverlay: boolean;      
  canUseKeyboard: boolean;  
  canReadScreen: boolean;   
}

export interface UIConfig {
  transparency: number;
  scale: number;
  fontSize: 'normal' | 'large';
}

export interface DataConfig {
  saveMemory: boolean;
  allowSuggestions: boolean;
  voiceWakeWord: boolean;
  language: SupportedLanguage; 
  showAiLog: boolean;
  isTtsEnabled: boolean;
}

export interface MemoryEntry {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  action: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  context: string;
  type?: 'code' | 'system' | 'network' | 'emergency' | 'call';
  intent?: AIIntent;
  blockType?: BlockType;
  reasoning?: string;
  appliedPolicy?: string;
  criticality?: CriticalityLevel;
  isSuggestion?: boolean;
}

export interface AppSettings {
  isOsaiEnabled: boolean;
  isAiEnabled: boolean;
  isAccessibilityMode: boolean; 
  mode: AIMode;
  cognitiveProfile: CognitiveProfile;
  policy: SecurityPolicy;
  ui: UIConfig;
  data: DataConfig;
}

export interface AuditEvent {
  timestamp: number;
  category: 'GOVERNANCE' | 'EXECUTION' | 'CONSENT' | 'SECURITY' | 'SYSTEM';
  state: AIStatus;
  message: string;
  data?: any;
}
