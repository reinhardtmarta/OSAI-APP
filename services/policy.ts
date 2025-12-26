
import { Suggestion, AIIntent, AIMode, CognitiveProfile, CriticalityLevel } from '../types';

const BANNED_KEYWORDS = [
  'rm -rf',
  'format drive',
  'drop database',
  'password',
  'secret_key',
  'eval(',
  'exec('
];

/**
 * Validates if the user input is an explicit "YES" across all 8 supported languages.
 */
export const isExplicitConsent = (text: string): boolean => {
  const normalized = text.trim().toLowerCase().replace(/[!.?]/g, '');
  
  const validAffirmatives = [
    'sim', 'com certeza', 'claro', 'pode fazer', // pt-BR
    'yes', 'sure', 'do it', 'go ahead', 'yep',   // en-US
    'sí', 'si', 'claro', 'hazlo', 'dale',        // es-ES
    'oui', 'bien sûr', 'fais-le', 'd’accord',    // fr-FR
    'ja', 'sicher', 'mach es', 'gerne',          // de-DE
    'sì', 'certo', 'fallo', 'va bene',           // it-IT
    '是', '对', '好的', '执行', '没问题',          // zh-CN
    'はい', 'そう', 'やって', '了解', 'いいよ'     // ja-JP
  ];

  return validAffirmatives.includes(normalized);
};

/**
 * Validates if the user input is an explicit "NO" across all 8 supported languages.
 */
export const isExplicitDenial = (text: string): boolean => {
  const normalized = text.trim().toLowerCase().replace(/[!.?]/g, '');
  
  const validNegatives = [
    'não', 'nao', 'cancela', 'parar', 'esquece', // pt-BR
    'no', 'cancel', 'stop', 'forget it', 'nope', // en-US
    'no', 'cancela', 'parar', 'olvídalo',        // es-ES
    'non', 'annule', 'arrête', 'laisse tomber',  // fr-FR
    'nein', 'abbrechen', 'stopp', 'vergiss es',  // de-DE
    'no', 'annulla', 'fermati', 'lascia stare',  // it-IT
    '不', '不是', '取消', '停止', '算了吧',          // zh-CN
    'いいえ', 'だめ', '中止', 'キャンセル', 'やめて' // ja-JP
  ];

  return validNegatives.includes(normalized);
};

export const isInterruptionCommand = (text: string): boolean => {
  return isExplicitDenial(text);
};

export const classifyIntent = (content: string): AIIntent => {
  const c = content.toLowerCase();
  if (c.includes('emergency') || c.includes('socorro') || c.includes('help')) return 'EMERGENCY';
  if (c.includes('function') || c.includes('const ') || c.includes('=>')) return 'CODING';
  if (c.includes('analyze') || c.includes('por que') || c.includes('calculadora')) return 'ANALYSIS';
  if (c.includes('brainstorm') || c.includes('ideia')) return 'IDEATION';
  return 'WRITING';
};

export const validateSuggestion = (
  suggestion: Suggestion, 
  profile: CognitiveProfile
): { safe: boolean; reason?: string; needsDoubleConfirmation?: boolean } => {
  const content = (suggestion.action + ' ' + suggestion.description).toLowerCase();
  
  for (const keyword of BANNED_KEYWORDS) {
    if (content.includes(keyword)) {
      return { safe: false, reason: `Governance Block: Violation of safety protocol (Keyword: ${keyword})` };
    }
  }

  switch (profile) {
    case CognitiveProfile.NORMAL:
      if (suggestion.riskLevel === 'HIGH') {
        return { safe: false, reason: 'Governance: High risk actions are restricted in Normal mode.' };
      }
      break;
    case CognitiveProfile.ACTIVE:
      if (suggestion.riskLevel === 'HIGH' && suggestion.type === 'system') {
        return { safe: true, needsDoubleConfirmation: true };
      }
      break;
    case CognitiveProfile.CRITICAL:
      if (suggestion.criticality === 'CRITICAL' || suggestion.intent === 'EMERGENCY') {
        return { safe: true, needsDoubleConfirmation: true };
      }
      break;
  }

  if (suggestion.action.length < 2 && suggestion.isSuggestion) {
    return { safe: false, reason: 'Structural: AI response failed schema validation.' };
  }

  return { safe: true };
};
