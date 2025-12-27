
import { ptBR } from './pt-BR';
import { enUS } from './en-US';
import { esES } from './es-ES';
import { frFR } from './fr-FR';
import { deDE } from './de-DE';
import { itIT } from './it-IT';
import { zhCN } from './zh-CN';
import { jaJP } from './ja-JP';
import { SupportedLanguage } from '../types';

export const locales: Record<SupportedLanguage, any> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
  'fr-FR': frFR,
  'de-DE': deDE,
  'it-IT': itIT,
  'zh-CN': zhCN,
  'ja-JP': jaJP,
};

/**
 * Fallback to English (en-US) if language is not supported or missing.
 */
export const getTranslation = (lang: SupportedLanguage) => locales[lang] || enUS;
