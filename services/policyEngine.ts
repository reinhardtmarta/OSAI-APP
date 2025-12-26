
import { Suggestion, AppSettings, CognitiveProfile, SecurityPolicy } from '../types';

interface ValidationResult {
  allowed: boolean;
  reason?: string;
  requireDoubleConfirmation: boolean;
}

export class PolicyEngine {
  /**
   * Palavras de ativação expandidas e fonemas curtos para os 8 idiomas.
   */
  public static readonly WAKE_WORDS = [
    'osai', 'ia', 'ai', 'hey osai', 'ok osai', 'o', 'ó', 'ô',
    'ki', '人工智能', '人工知能', 'intelligence artificielle', 'intelligenza artificiale',
    'ei', 'hey', 'olá', 'hello', 'hola', 'ciao', 'hi'
  ];

  /**
   * Detecção sensível: Verifica se a transcrição contém ou começa com gatilhos.
   */
  public static detectWakeWord(transcript: string): boolean {
    const normalized = transcript.toLowerCase().trim();
    
    // Tratamento especial para o gatilho curto "O" / "Ó"
    const shortTrigger = ['o', 'ó', 'ô', 'ia', 'ai'];
    if (shortTrigger.includes(normalized)) return true;
    
    return this.WAKE_WORDS.some(word => 
      normalized === word ||
      normalized.startsWith(word + ' ') || 
      normalized.includes(` ${word} `) ||
      normalized.endsWith(` ${word}`)
    );
  }

  public static validate(suggestion: Suggestion, settings: AppSettings): ValidationResult {
    const { cognitiveProfile, policy } = settings;

    if (suggestion.type === 'network' && !policy.canAccessNetwork) {
      return { allowed: false, reason: "Acesso à rede desativado.", requireDoubleConfirmation: false };
    }
    if (suggestion.type === 'call' && !policy.canMakeCalls) {
      return { allowed: false, reason: "Chamadas restritas.", requireDoubleConfirmation: false };
    }

    if (suggestion.riskLevel === 'HIGH' && cognitiveProfile === CognitiveProfile.NORMAL) {
      return { 
        allowed: false, 
        reason: "Risco alto detectado no perfil Normal.",
        requireDoubleConfirmation: false 
      };
    }

    // Se o Modo Assistivo Crítico estiver ligado, TODA ação requer confirmação dupla.
    const mustDoubleConfirm = policy.isCriticalAssistiveMode || 
                             suggestion.criticality === 'CRITICAL' || 
                             suggestion.riskLevel === 'MEDIUM' || 
                             suggestion.riskLevel === 'HIGH';

    return {
      allowed: true,
      requireDoubleConfirmation: mustDoubleConfirm
    };
  }
}
