
import { Suggestion, AppSettings, CognitiveProfile, SecurityPolicy } from '../types';

interface ValidationResult {
  allowed: boolean;
  reason?: string;
  requireDoubleConfirmation: boolean;
}

export class PolicyEngine {
  /**
   * Valida deterministicamente se uma sugestão da IA pode ser apresentada ao usuário.
   */
  public static validate(suggestion: Suggestion, settings: AppSettings): ValidationResult {
    const { cognitiveProfile, policy } = settings;

    // 1. Regra de Ouro: Perfil Normal não permite sugestões de ação.
    if (cognitiveProfile === CognitiveProfile.NORMAL && suggestion.isSuggestion) {
      return { 
        allowed: false, 
        reason: "POLICY_VIOLATION: Sugestões de ação proibidas para Perfil Normal.",
        requireDoubleConfirmation: false
      };
    }

    // 2. Validação de Permissões de Hardware/Rede
    if (suggestion.type === 'network' && !policy.canAccessNetwork) {
      return { allowed: false, reason: "PERMISSION_DENIED: Acesso à rede desativado.", requireDoubleConfirmation: false };
    }

    if (suggestion.type === 'call' && !policy.canMakeCalls) {
      return { allowed: false, reason: "PERMISSION_DENIED: Chamadas telefônicas desativadas.", requireDoubleConfirmation: false };
    }

    // 3. Regras de Risco por Perfil
    if (suggestion.riskLevel === 'HIGH' && cognitiveProfile !== CognitiveProfile.CRITICAL) {
      return { 
        allowed: false, 
        reason: `RISK_DENIED: Ação de alto risco bloqueada para perfil ${cognitiveProfile}.`,
        requireDoubleConfirmation: false 
      };
    }

    // 4. Determinação de Confirmação Redundante (Modo Crítico)
    const needsExtraStep = cognitiveProfile === CognitiveProfile.CRITICAL && 
                           (suggestion.intent === 'EMERGENCY' || suggestion.riskLevel === 'MEDIUM');

    return {
      allowed: true,
      requireDoubleConfirmation: needsExtraStep
    };
  }

  /**
   * Filtra entradas de voz sensíveis (interrupções rápidas determinísticas).
   */
  public static isHardInterrupt(transcript: string): boolean {
    const stopWords = ['cancelar', 'parar', 'stop', 'silenciar', 'kill', 'shutdown'];
    return stopWords.some(word => transcript.toLowerCase().trim() === word);
  }
}
