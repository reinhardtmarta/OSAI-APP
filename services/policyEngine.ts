
import { Suggestion, AppSettings, CognitiveProfile, SecurityPolicy } from '../types';

interface ValidationResult {
  allowed: boolean;
  reason?: string;
  requireDoubleConfirmation: boolean;
}

export class PolicyEngine {
  /**
   * Valida deterministicamente se uma sugestão da IA pode ser apresentada ao usuário.
   * Alinhado com a diretriz "OSAI is a doer": Segurança habilita a ação, não a impede.
   */
  public static validate(suggestion: Suggestion, settings: AppSettings): ValidationResult {
    const { cognitiveProfile, policy } = settings;

    // 1. Validação de Permissões de Hardware/Rede (Hard Limits)
    if (suggestion.type === 'network' && !policy.canAccessNetwork) {
      return { allowed: false, reason: "PERMISSION_DENIED: Acesso à rede desativado nas políticas de segurança.", requireDoubleConfirmation: false };
    }

    if (suggestion.type === 'call' && !policy.canMakeCalls) {
      return { allowed: false, reason: "PERMISSION_DENIED: Chamadas telefônicas desativadas nas políticas de segurança.", requireDoubleConfirmation: false };
    }

    // 2. Regras de Risco por Perfil
    // Em perfis não-críticos, bloqueamos apenas riscos extritamente altos sem contexto de emergência.
    if (suggestion.riskLevel === 'HIGH' && cognitiveProfile === CognitiveProfile.NORMAL && suggestion.intent !== 'EMERGENCY') {
      return { 
        allowed: false, 
        reason: `RISK_DENIED: Ações de alto risco requerem perfil Assistivo ou Crítico.`,
        requireDoubleConfirmation: false 
      };
    }

    // 3. Determinação de Confirmação Redundante
    // No Perfil Normal, quase tudo que é 'isSuggestion' exige confirmação clara.
    // No Perfil Crítico, apenas o que é realmente perigoso exige o passo extra.
    const needsExtraStep = (cognitiveProfile === CognitiveProfile.NORMAL && suggestion.riskLevel === 'MEDIUM') ||
                           (cognitiveProfile === CognitiveProfile.CRITICAL && suggestion.criticality === 'CRITICAL');

    return {
      allowed: true,
      requireDoubleConfirmation: needsExtraStep
    };
  }

  /**
   * Filtra entradas de voz sensíveis (interrupções rápidas determinísticas).
   */
  public static isHardInterrupt(transcript: string): boolean {
    const stopWords = ['cancelar', 'parar', 'stop', 'silenciar', 'kill', 'shutdown', 'abortar'];
    return stopWords.some(word => transcript.toLowerCase().trim() === word);
  }
}
