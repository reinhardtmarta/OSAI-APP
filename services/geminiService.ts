
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, SupportedLanguage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING, description: 'A short, executable command or specific step (e.g., "Ligar para Polícia", "Abrir WhatsApp", "Fechar Instagram", "Sair do YouTube", "Digitar [Texto]", "Ler Tela")' },
    description: { type: Type.STRING, description: 'The assistant message or reasoning' },
    riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'Risk level of the action' },
    type: { type: Type.STRING, enum: ['system', 'network', 'emergency', 'call'], description: 'The domain of the suggestion' }
  },
  required: ['action', 'description', 'riskLevel', 'type']
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

export interface CapabilityFlags {
  hasContactAccess: boolean;
  hasInternetAccess: boolean;
  hasScreenAccess: boolean;
  hasKeyboardAccess: boolean;
  hasAppManagement: boolean;
  hasLocationAccess: boolean; // Added for location access flag
}

export const getSuggestion = async (
  context: string, 
  isAccessibilityMode: boolean = false, 
  lang: SupportedLanguage = 'pt-BR',
  capabilities: CapabilityFlags
): Promise<Suggestion | null> => {
  try {
    const languageName = LANGUAGE_MAP[lang];
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Contexto do Sistema Atual: ${context}. Por favor, forneça assistência ativa. 
      ${isAccessibilityMode ? 'MODO ACESSIBILIDADE ATIVO: Priorize ajuda de emergência, localização atual para resgate e comandos simplificados.' : 'MODO PRODUTIVIDADE: Ajude na navegação e automação.'} 
      Capacidades e Permissões Atuais:
      - Acesso a Contatos: ${capabilities.hasContactAccess ? 'SIM' : 'NÃO'}.
      - Acesso à Internet: ${capabilities.hasInternetAccess ? 'SIM' : 'NÃO'}.
      - Leitura de Tela (OCR/Visual): ${capabilities.hasScreenAccess ? 'SIM' : 'NÃO'}.
      - Controle de Teclado/Input: ${capabilities.hasKeyboardAccess ? 'SIM' : 'NÃO'}.
      - Gerenciamento/Uso de Apps: ${capabilities.hasAppManagement ? 'SIM' : 'NÃO'}.
      - Localização por GPS: ${capabilities.hasLocationAccess ? 'SIM' : 'NÃO'}.
      IDIOMA DE RESPOSTA: ${languageName}.`,
      config: {
        systemInstruction: `Você é o OSAI, um assistente de IA proativo integrado em nível de sistema.
        Sua função é assistir o usuário em TODOS os aplicativos.
        Seu nome é OSAI. Você deve atender e responder SEMPRE que o usuário disser seu nome, independentemente do idioma que ele esteja falando ou do idioma configurado no sistema.
        Responda SEMPRE em ${languageName}, a menos que o usuário peça explicitamente para mudar.
        
        REGRAS DE PERMISSÃO:
        1. Se o usuário solicitar algo que exija uma permissão marcada como "NÃO":
           - Informe que a funcionalidade depende da ativação da permissão.
           - Retorne no campo 'action' o texto "Habilitar [Nome da Permissão]".
        2. Se tiver as permissões de Gerenciamento de Apps (hasAppManagement: SIM):
           - Você PODE sugerir abrir, fechar, sair ou alternar entre aplicativos.
        3. Se tiver acesso à localização (hasLocationAccess: SIM) e estiver no MODO ACESSIBILIDADE:
           - Em emergências, inclua informações de localização ou sugira compartilhar a localização com contatos de confiança.
        
        No MODO ATIVO, você deve sugerir ações baseadas no que está acontecendo (contexto), agindo como um copiloto do dispositivo.`,
        responseMimeType: 'application/json',
        responseSchema: SUGGESTION_SCHEMA,
      }
    });

    const data = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      context,
      ...data
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
