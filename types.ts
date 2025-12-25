
export enum AIStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  COOLDOWN = 'COOLDOWN',
  ERROR = 'ERROR',
  CALLING = 'CALLING',
  SUSPENDED = 'SUSPENDED'
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

export enum PlatformType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB'
}

export interface PlatformCapabilities {
  hasSystemOverlay: boolean;      // True on Android, False on iOS
  hasBackgroundListening: boolean; // True on Android, Restricted on iOS
  hasHapticFeedback: boolean;
  hasHardwareIntegration: boolean;
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

export enum MemoryScope {
  SESSION = 'SESSION',
  TASK = 'TASK'
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
  type?: 'code' | 'system' | 'network' | 'emergency' | 'call' | 'research';
  intent?: AIIntent;
  blockType?: BlockType;
  reasoning?: string;
  appliedPolicy?: string;
  criticality?: CriticalityLevel;
  isSuggestion?: boolean;
  providerId?: string;
  isTaskComplete?: boolean; // New: indicates if this finishes the current task memory scope
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

export interface AIRequestParams {
  context: string;
  profile: CognitiveProfile;
  lang: SupportedLanguage;
  policy: SecurityPolicy;
  sessionMemory: MemoryEntry[];
  taskMemory: MemoryEntry[];
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  getSuggestion(params: AIRequestParams): Promise<Suggestion | null>;
}
