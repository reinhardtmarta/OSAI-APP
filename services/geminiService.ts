
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, SupportedLanguage, MemoryEntry, AIProvider, AIRequestParams, MemoryScope } from '../types';

const SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING, description: 'Executable action ("WRITE_TO_APP", "READ_SCREEN", "COMMUNICATE", "CALL")' },
    payload: { type: Type.STRING, description: 'Data for action' },
    description: { type: Type.STRING, description: 'Direct and friendly response to user in the specific language' },
    riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    type: { type: Type.STRING, enum: ['system', 'network', 'emergency', 'call', 'research', 'communication'] },
    intent: { type: Type.STRING, enum: ['WRITING', 'CODING', 'ANALYSIS', 'IDEATION', 'SYSTEM', 'EMERGENCY', 'LEARNING', 'WEB_SEARCH'] },
    blockType: { type: Type.STRING, enum: ['TEXT', 'CODE', 'IDEA', 'DRAFT', 'SYSTEM_CMD'] },
    criticality: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    reasoning: { type: Type.STRING },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    isSuggestion: { type: Type.BOOLEAN },
    isTaskComplete: { type: Type.BOOLEAN },
    safetyAnalysis: { type: Type.STRING },
    isSafetyVerified: { type: Type.BOOLEAN },
    interactionBarrier: { type: Type.STRING, enum: ['CAPTCHA', 'PAYWALL', 'NONE'] }
  },
  required: ['action', 'description', 'riskLevel', 'type', 'intent', 'blockType', 'criticality', 'reasoning', 'steps', 'isSuggestion', 'isTaskComplete', 'safetyAnalysis', 'isSafetyVerified', 'interactionBarrier']
};

export class GeminiProvider implements AIProvider {
  public readonly id = 'google-gemini-3-pro';
  public readonly name = 'Google Gemini 3 Pro';

  public async getSuggestion(params: AIRequestParams): Promise<Suggestion | null> {
    const { context, lang, sessionMemory, policy } = params;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are OSAI-CORE, a proactive accessibility assistant.
    TARGET LANGUAGE: ${lang}
    STRICT RULE: You MUST speak and respond ONLY in ${lang}.
    DO NOT use English if the language is ${lang}.
    
    POLICIES:
    1. ACCESSIBILITY: Be highly descriptive for the specific locale: ${lang}.
    2. CONFIRMATION: Set 'isSuggestion: true' for actions that change system state.
    3. STYLE: Maintain a helpful persona aligned with ${lang} cultural norms.
    4. If the user input is in another language, translate your intent back to ${lang} before responding.
    5. Ensure the 'description' field is perfectly translated to ${lang}.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: `System Context: Language is ${lang}. Memory follows.` }] },
          { role: 'user', parts: [{ text: `Memory: ${JSON.stringify(sessionMemory.slice(-6))}` }] },
          { role: 'user', parts: [{ text: context }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: SUGGESTION_SCHEMA,
          tools: policy.canAccessNetwork ? [{ googleSearch: {} }] : []
        }
      });

      const text = response.text;
      if (!text) return null;
      return { id: 'osai-' + Date.now(), context, ...JSON.parse(text) };
    } catch (e) { 
      console.error("Gemini Multi-lang Error:", e);
      return null; 
    }
  }
}

export const geminiProviderInstance = new GeminiProvider();
