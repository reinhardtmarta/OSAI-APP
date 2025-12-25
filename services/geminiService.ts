
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, SupportedLanguage, MemoryEntry, AIProvider, AIRequestParams, CognitiveProfile, MemoryScope } from '../types';

const SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING, description: 'Comando executável curto (apenas se permitido pelo perfil)' },
    description: { type: Type.STRING, description: 'Explicação do plano de ação ou pergunta de confirmação' },
    riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    type: { type: Type.STRING, enum: ['system', 'network', 'emergency', 'call', 'research'] },
    intent: { type: Type.STRING, enum: ['WRITING', 'CODING', 'ANALYSIS', 'IDEATION', 'SYSTEM', 'EMERGENCY'] },
    blockType: { type: Type.STRING, enum: ['TEXT', 'CODE', 'IDEA', 'DRAFT', 'SYSTEM_CMD'] },
    criticality: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    reasoning: { type: Type.STRING, description: 'Explicação cognitiva interna do planejamento' },
    appliedPolicy: { type: Type.STRING, description: 'Referência de política aplicada' },
    isSuggestion: { type: Type.BOOLEAN, description: 'True se você preparou uma ação que requer confirmação binária para ser executada' },
    isTaskComplete: { type: Type.BOOLEAN, description: 'True se esta resposta encerra a tarefa atual' }
  },
  required: ['action', 'description', 'riskLevel', 'type', 'intent', 'blockType', 'criticality', 'reasoning', 'isSuggestion', 'isTaskComplete']
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

export class GeminiProvider implements AIProvider {
  public readonly id = 'google-gemini-3-pro';
  public readonly name = 'Google Gemini 3 Pro';
  private ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  public async getSuggestion(params: AIRequestParams): Promise<Suggestion | null> {
    const { context, profile, lang, sessionMemory, taskMemory } = params;
    const languageName = LANGUAGE_MAP[lang];
    
    const sessionContextStr = sessionMemory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const taskContextStr = taskMemory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
[SESSION_CONTEXT] (Long-term history)
${sessionContextStr || 'None'}

[TASK_CONTEXT] (Current immediate objective)
${taskContextStr || 'None'}

[USER_INPUT]
${context}

[USER_PROFILE]
${profile}`,
        config: {
          systemInstruction: `Você é o OSAI-CORE, um motor de IA ASSISTIVA e EXECUTORA operando em ${languageName}.
          
          PRINCÍPIO FUNDAMENTAL: Você é um executor ("doer"). Use a MEMÓRIA apenas como suporte para manter o contexto, nunca como única base de decisão.

          SISTEMA DE MEMÓRIA:
          1. SESSION_CONTEXT: Histórico geral da conversa. Use para manter o tom e preferências globais.
          2. TASK_CONTEXT: Memória de curto prazo focada na tarefa atual. Limpe sua lógica assim que a tarefa for concluída.
          3. MEMÓRIA TEMPORÁRIA: Use o Task Context para lembrar detalhes específicos de um pedido complexo de múltiplos passos.

          DIRETRIZES DE COMPORTAMENTO:
          - Se o usuário pedir algo, use a memória para verificar se é a continuação de um passo anterior.
          - Quando a tarefa for finalizada, defina 'isTaskComplete: true'.
          - Antes de EXECUTAR qualquer ação no sistema, defina 'isSuggestion: true' e peça confirmação.
          - Seja conciso. Não deflexione. Safeties servem para habilitar a ação confirmada.`,
          responseMimeType: 'application/json',
          responseSchema: SUGGESTION_SCHEMA,
        }
      });

      const text = response.text || '{}';
      const data = JSON.parse(text);
      
      return { 
        id: Math.random().toString(36).substr(2, 9), 
        context, 
        ...data,
        providerId: this.id
      };
    } catch (error) {
      console.error(`[${this.id}] Cognitive Error:`, error);
      return null;
    }
  }
}

export const geminiProviderInstance = new GeminiProvider();
