
import { Suggestion } from '../types';

const BANNED_KEYWORDS = [
  'rm -rf',
  'delete all',
  'format drive',
  'drop database',
  'password',
  'secret_key'
];

export const validateSuggestion = (suggestion: Suggestion): { safe: boolean; reason?: string } => {
  const content = (suggestion.action + ' ' + suggestion.description).toLowerCase();
  
  // Rule 1: Keyword Filtering
  for (const keyword of BANNED_KEYWORDS) {
    if (content.includes(keyword)) {
      return { safe: false, reason: `Policy violation: Dangerous keyword detected (${keyword})` };
    }
  }

  // Rule 2: Risk-based validation
  if (suggestion.riskLevel === 'HIGH') {
    return { safe: false, reason: 'Policy violation: Action exceeds autonomous risk threshold' };
  }

  // Rule 3: Sanity check for length
  if (suggestion.action.length < 5) {
    return { safe: false, reason: 'Policy violation: Action command is too short/ambiguous' };
  }

  return { safe: true };
};
