
import { Suggestion, AppSettings, CognitiveProfile, SecurityPolicy } from '../types';

interface ValidationResult {
  allowed: boolean;
  reason?: string;
  requireDoubleConfirmation: boolean;
}

export class PolicyEngine {
  /**
   * Expanded activation words and short phonemes for the supported languages.
   */
  public static readonly WAKE_WORDS = [
    'osai', 'ia', 'ai', 'hey osai', 'ok osai', 'o', 'ó', 'ô',
    'ki', '人工智能', '人工知能', 'intelligence artificielle', 'intelligenza artificiale',
    'ei', 'hey', 'olá', 'hello', 'hola', 'ciao', 'hi'
  ];

  /**
   * Sensitive detection: Checks if the transcript contains or starts with triggers.
   */
  public static detectWakeWord(transcript: string): boolean {
    const normalized = transcript.toLowerCase().trim();
    
    // Special treatment for the short trigger "O" / "Ó"
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
      return { allowed: false, reason: "Network access disabled.", requireDoubleConfirmation: false };
    }
    if (suggestion.type === 'call' && !policy.canMakeCalls) {
      return { allowed: false, reason: "Calls restricted.", requireDoubleConfirmation: false };
    }

    if (suggestion.riskLevel === 'HIGH' && cognitiveProfile === CognitiveProfile.NORMAL) {
      return { 
        allowed: false, 
        reason: "High risk detected in Normal profile.",
        requireDoubleConfirmation: false 
      };
    }

    // If Critical Assistive Mode is on, EVERY action requires double confirmation.
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