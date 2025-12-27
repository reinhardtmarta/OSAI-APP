
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, SupportedLanguage, MemoryEntry, AIProvider, AIRequestParams } from '../types';
import { activeTools } from './tools/activeFunctions';
import { OSAI_KNOWLEDGE } from '../knowledge/osaiKnowledge';
import { APP_INTERACTION_KNOWLEDGE } from '../knowledge/appInteractionKnowledge';
import { GOOGLE_SEARCH_KNOWLEDGE } from '../knowledge/googleSearchKnowledge';
import { WRITING_PROXY_KNOWLEDGE } from '../knowledge/writingProxyKnowledge';

const SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING, description: 'Action: "WRITE_TO_APP", "READ_SCREEN", "OPEN_APP", "CLICK_ELEMENT", "TYPE_CONTENT", "COMMUNICATE", "TOOL_CALL"' },
    payload: { type: Type.STRING, description: 'Extra data or tool arguments' },
    description: { type: Type.STRING, description: 'User-facing response.' },
    riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    type: { type: Type.STRING, enum: ['system', 'network', 'tool_call', 'communication'] },
    intent: { type: Type.STRING },
    reasoning: { type: Type.STRING, description: 'INTERNAL THOUGHTS: Why am I doing this? Did I ask for permission to write yet?' },
    isSuggestion: { type: Type.BOOLEAN },
    steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Planned execution steps' }
  },
  required: ['action', 'description', 'riskLevel', 'type', 'intent', 'reasoning', 'isSuggestion', 'steps']
};

export class GeminiProvider implements AIProvider {
  public readonly id = 'google-gemini-3-flash';
  public readonly name = 'Google Gemini 3 Flash';

  public async getSuggestion(params: AIRequestParams): Promise<Suggestion | null> {
    const { context, lang, policy } = params;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const knowledgeBase = `
      IDENTITY: ${OSAI_KNOWLEDGE.identity}
      WRITING PROTOCOL: ${WRITING_PROXY_KNOWLEDGE.core_protocol.join(' | ')}
      APP INTERACTION: ${APP_INTERACTION_KNOWLEDGE.interaction_logic.join(' | ')}
      SCREEN VISION: ${APP_INTERACTION_KNOWLEDGE.text_recognition.join(' | ')}
    `;

    const systemInstruction = `You are OSAI, a high-level Cognitive System Assistant.
    
    CRITICAL PROTOCOL FOR WRITING:
    1. If the user asks to write/send a message/email:
       - DO NOT TYPE YET. 
       - STEP 1: Ask "What would you like me to write?" or ask for missing details (tone, recipient).
       - STEP 2: Provide a DRAFT in the 'description' field.
       - STEP 3: Ask "May I open the app and type this for you?".
       - STEP 4: Only use 'TYPE_CONTENT' action AFTER the user gives explicit confirmation to "do it" or "write it".
    
    CRITICAL PROTOCOL FOR SCREEN READING:
    - You can read everything on the screen using 'READ_SCREEN'. 
    - If the user asks "what am I looking at?" or "summarize this screen", execute 'READ_SCREEN'.
    
    BEHAVIOR:
    - Current Language: ${lang} (Default to English if not specified).
    - Be proactive but always respect the confirmation barrier for writing.
    - If a required app isn't open, suggest using 'OPEN_APP' first.
    
    KNOWLEDGE:
    ${knowledgeBase}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: context }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: SUGGESTION_SCHEMA,
          tools: [{ functionDeclarations: activeTools }, { googleSearch: {} }],
        }
      });

      const text = response.text;
      if (!text) return null;

      const baseSuggestion = JSON.parse(text);
      return { 
        id: 'osai-' + Date.now(), 
        context, 
        ...baseSuggestion,
        toolCalls: response.functionCalls
      };
    } catch (e) { 
      console.error("Gemini Provider Error:", e);
      return null; 
    }
  }
}

export const geminiProviderInstance = new GeminiProvider();
