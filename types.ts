
export enum AIStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  DOUBLE_CONFIRMATION = 'DOUBLE_CONFIRMATION',
  EXECUTING = 'EXECUTING',
  COOLDOWN = 'COOLDOWN',
  ERROR = 'ERROR',
  CALLING = 'CALLING',
  SUSPENDED = 'SUSPENDED',
  OFFLINE = 'OFFLINE',
  WAKE_WORD_DETECTED = 'WAKE_WORD_DETECTED'
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

export type AIIntent = 'WRITING' | 'CODING' | 'ANALYSIS' | 'IDEATION' | 'SYSTEM' | 'EMERGENCY' | 'LEARNING' | 'WEB_SEARCH' | 'SOCIAL_MEDIA' | 'MEDIA_CONTROL';

export type CriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export enum PlatformType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB'
}

export interface PlatformCapabilities {
  hasSystemOverlay: boolean;
  hasBackgroundListening: boolean;
  hasHapticFeedback: boolean;
  hasHardwareIntegration: boolean;
}

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
  fullAppControl?: boolean;
  isPassiveListeningEnabled: boolean;
  isAiMicrophoneEnabled: boolean;
  isUserMicrophoneEnabled: boolean;
  isCriticalAssistiveMode: boolean;
}

export interface UIConfig {
  transparency: number;
  scale: number;
  fontSize: 'normal' | 'large';
}

export interface DataConfig {
  saveMemory: boolean;
  adaptiveLearning: boolean; 
  learningLimitDays: number; 
  allowSuggestions: boolean;
  voiceWakeWord: boolean;
  language: SupportedLanguage; 
  showAiLog: boolean;
  isTtsEnabled: boolean;
}

export enum MemoryScope {
  SESSION = 'SESSION',
  TASK = 'TASK',
  COGNITIVE = 'COGNITIVE' 
}

export interface MemoryEntry {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  scope: MemoryScope;
  metadata?: any;
}

export interface Suggestion {
  id: string;
  action: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  context: string;
  type?: 'code' | 'system' | 'network' | 'emergency' | 'call' | 'research' | 'communication' | 'tool_call';
  intent?: AIIntent;
  criticality?: CriticalityLevel;
  reasoning?: string;
  steps?: string[];
  isSuggestion?: boolean;
  isTaskComplete?: boolean;
  safetyAnalysis?: string;
  isSafetyVerified?: boolean;
  payload?: string;
  interactionBarrier?: 'CAPTCHA' | 'PAYWALL' | 'NONE';
  groundingUrls?: {uri: string, title?: string}[];
  toolCalls?: any[];
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

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'zh-CN' | 'ja-JP';

export interface AIRequestParams {
  context: string;
  profile: CognitiveProfile;
  lang: SupportedLanguage;
  policy: SecurityPolicy;
  sessionMemory: MemoryEntry[];
  taskMemory: MemoryEntry[];
  cognitiveMemory: MemoryEntry[]; 
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  getSuggestion(params: AIRequestParams): Promise<Suggestion | null>;
}

export interface AuditEvent {
  timestamp: number;
  category: 'SECURITY' | 'SYSTEM' | 'PRIVACY' | 'TASK' | 'ERROR' | 'TOOL';
  state: AIStatus;
  message: string;
  data?: any;
}
