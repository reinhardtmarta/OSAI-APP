import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, SupportedLanguage, MemoryEntry, AIIntent, BlockType, CognitiveProfile, CriticalityLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let sessionMemory: MemoryEntry[] = [];
const MAX_MEMORY_SIZE = 8; 

const SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING, description: 'Comando executável curto (apenas se permitido pelo perfil)' },
    description: { type: Type.STRING, description: 'Resposta textual ou pergunta de confirmação' },
    riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    type: { type: Type.STRING, enum: ['system', 'network', 'emergency', 'call'] },
    intent: { type: Type.STRING, enum: ['WRITING', 'CODING', 'ANALYSIS', 'IDEATION', 'SYSTEM', 'EMERGENCY'] },
    blockType: { type: Type.STRING, enum: ['TEXT', 'CODE', 'IDEA', 'DRAFT', 'SYSTEM_CMD'] },
    criticality: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    reasoning: { type: Type.STRING, description: 'Explicação cognitiva interna' },
    appliedPolicy: { type: Type.STRING, description: 'Referência de política aplicada' },
    isSuggestion: { type: Type.BOOLEAN, description: 'True apenas se solicitar permissão para AGIR no sistema' }
  },
  required: ['action', 'description', 'riskLevel', 'type', 'intent', 'blockType', 'criticality', 'reasoning', 'isSuggestion']
};

const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'it-IT': 'Italiano',
  'zh-CN': 'Chinese (Simplified)',
  'ja-JP': 'Japanese'
};

const MODE_GREETINGS: Record<CognitiveProfile, Record<SupportedLanguage, string>> = {
  [CognitiveProfile.NORMAL]: {
    'pt-BR': 'O OSAI está ouvindo. O que você precisa?',
    'en-US': 'OSAI is listening. What do you need?',
    'es-ES': 'OSAI está ouvindo. ¿Qué necesitas?',
    'fr-FR': 'OSAI est à l\'écoute. De quoi avez-vous besoin ?',
    'de-DE': 'OSAI hört zu. Was benötigen Sie?',
    'it-IT': 'OSAI è in ascolto. Di cosa hai bisogno?',
    'zh-CN': 'OSAI正在聆听。你需要什么？',
    'ja-JP': 'OSAIが聞いています。何が必要ですか？'
  },
  [CognitiveProfile.ACTIVE]: {
    'pt-BR': 'OSAI ativo. Como posso te ajudar agora?',
    'en-US': 'OSAI active. How can I help you now?',
    'es-ES': 'OSAI activo. ¿Cómo posso ayudarte ahora?',
    'fr-FR': 'OSAI actif. Comment puis-je vous aider maintenant ?',
    'de-DE': 'OSAI aktiv. Wie kann ich Ihnen agora helfen?',
    'it-IT': 'OSAI attivo. Come posso aiutarti ora?',
    'zh-CN': 'OSAI已激活。我现在该如何帮助你？',
    'ja-JP': 'OSAIアクティブ。今、どのようにお手伝いできますか？'
  },
  [CognitiveProfile.CRITICAL]: {
    'pt-BR': 'OSAI em prontidão total. Diga o que você precisa.',
    'en-US': 'OSAI in full readiness. Tell me what you need.',
    'es-ES': 'OSAI en alerta total. Dime qué necesitas.',
    'fr-FR': 'OSAI en alerte totale. Dites-moi ce dont você precisa.',
    'de-DE': 'OSAI in voller Bereitschaft. Sagen Sie mir, was Sie brauchen.',
    'it-IT': 'OSAI in piena prontezza. Dimmi di cosa hai bisogno.',
    'zh-CN': 'OSAI处于待命状态。告诉我你需要什么。',
    'ja-JP': 'OSAI準備完了。必要なことを教えてください。'
  }
};

export const getGreeting = (lang: SupportedLanguage, profile: CognitiveProfile = CognitiveProfile.NORMAL) => 
  MODE_GREETINGS[profile][lang] || MODE_GREETINGS[profile]['pt-BR'];

const updateMemory = (role: 'user' | 'ai', content: string) => {
  sessionMemory.push({ role, content, timestamp: Date.now() });
  if (sessionMemory.length > MAX_MEMORY_SIZE) sessionMemory.shift();
};

const getMemoryContext = () => sessionMemory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

export const getSuggestion = async (
  context: string, 
  profile: CognitiveProfile = CognitiveProfile.NORMAL, 
  lang: SupportedLanguage = 'pt-BR',
  capabilities: any
): Promise<Suggestion | null> => {
  try {
    const languageName = LANGUAGE_MAP[lang];
    const memory = getMemoryContext();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `[SESSION_MEMORY]\n${memory}\n\n[USER_INPUT]\n${context}\n\n[USER_PROFILE]\n${profile}`,
      config: {
        systemInstruction: `Você é o OSAI-CORE, um assistente de interface passiva operando em ${languageName}.

        POLÍTICA DE COMUNICAÇÃO VS AÇÃO:
        1. COMUNICAÇÃO: Sempre ativa. Você deve responder com voz (sintetizada) e texto a qualquer interação direta. Ao ouvir seu nome "OSAI", responda imediatamente com uma saudação.
        2. AÇÃO: Proibida sem comando explícito. Você nunca executa mudanças no sistema, envia arquivos ou faz chamadas sem que o usuário aprove uma 'Suggestion' (isSuggestion: true).
        3. PERFIL NORMAL: Foco total em comunicação passiva. Nenhuma ação permitida.

        Se o usuário disser "OSAI", responda estritamente: "${getGreeting(lang, profile)}".
        Diferencie pedidos de informação (Comunicação) de pedidos de alteração (Ação).`,
        responseMimeType: 'application/json',
        responseSchema: SUGGESTION_SCHEMA,
      }
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    
    updateMemory('user', context);
    updateMemory('ai', data.description || '');

    const finalIsSuggestion = profile === CognitiveProfile.NORMAL ? false : data.isSuggestion;

    return { 
      id: Math.random().toString(36).substr(2, 9), 
      context, 
      ...data,
      isSuggestion: finalIsSuggestion
    };
  } catch (error) {
    console.error("OSAI-CORE Cognitive Error:", error);
    return null;
  }
};