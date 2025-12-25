import { Suggestion, AIIntent, AIMode, CognitiveProfile, CriticalityLevel } from '../types';

const BANNED_KEYWORDS = [
  'rm -rf',
  'delete all',
  'format drive',
  'drop database',
  'password',
  'secret_key',
  'eval(',
  'exec('
];

/**
 * Validates if the user input is an explicit "YES" across all supported languages.
 * As per the Golden Rule, only an unambiguous affirmative is valid.
 */
export const isExplicitConsent = (text: string): boolean => {
  const normalized = text.trim().toLowerCase().replace(/[!.?]/g, '');
  
  const validAffirmatives = [
    'sim',      // pt-BR
    'yes',      // en-US
    'sí', 'si', // es-ES
    'oui',      // fr-FR
    'ja',       // de-DE
    'sì',       // it-IT
    '是', '对',  // zh-CN
    'はい'      // ja-JP
  ];

  return validAffirmatives.includes(normalized);
};

/**
 * Interruption commands that stop any active flow immediately.
 */
export const isInterruptionCommand = (text: string): boolean => {
  const normalized = text.trim().toLowerCase();
  const stopWords = ['cancelar', 'parar agora', 'silenciar', 'stop', 'cancel', 'parar'];
  return stopWords.some(word => normalized.includes(word));
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
      // Normal profile should never have suggestions that require action
      if (suggestion.isSuggestion) {
        return { safe: false, reason: 'Governance: Suggestion/Action logic forbidden in NORMAL profile.' };
      }
      break;

    case CognitiveProfile.ACTIVE:
      if (suggestion.riskLevel === 'HIGH' && suggestion.type === 'system') {
        return { safe: false, reason: 'Policy: Critical system changes require elevated profile.' };
      }
      break;

    case CognitiveProfile.CRITICAL:
      if (suggestion.criticality === 'CRITICAL' || suggestion.intent === 'EMERGENCY') {
        return { safe: true, needsDoubleConfirmation: true };
      }
      break;
  }

  if (suggestion.action.length < 3 && suggestion.isSuggestion) {
    return { safe: false, reason: 'Structural: AI response failed schema validation.' };
  }

  return { safe: true };
};