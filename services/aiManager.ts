
import { AIProvider, AIRequestParams, Suggestion, SupportedLanguage, CognitiveProfile, MemoryEntry, MemoryScope, AIStatus } from '../types';
import { geminiProviderInstance } from './geminiService';
import { audit } from './auditLog';

const MEMORY_STORAGE_KEY = 'osai_cognitive_memory_v3';

class AIManager {
  private static instance: AIManager;
  private providers: AIProvider[] = [geminiProviderInstance];
  private sessionMemory: MemoryEntry[] = [];
  private taskMemory: MemoryEntry[] = [];
  private cognitiveMemory: MemoryEntry[] = [];
  
  private constructor() {
    this.loadCognitiveMemory();
    this.autoCleanupOldData();
  }

  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  private loadCognitiveMemory() {
    try {
      const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (saved) {
        this.cognitiveMemory = JSON.parse(saved);
      }
    } catch (e) { console.error("Falha ao carregar memória", e); }
  }

  private saveCognitiveMemory() {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.cognitiveMemory));
    } catch (e) { console.error("Falha ao salvar memória", e); }
  }

  private autoCleanupOldData() {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const originalCount = this.cognitiveMemory.length;
    this.cognitiveMemory = this.cognitiveMemory.filter(m => (now - m.timestamp) < THIRTY_DAYS_MS);
    if (this.cognitiveMemory.length < originalCount) {
      this.saveCognitiveMemory();
      audit.log('SYSTEM', AIStatus.IDLE, `Limpeza: ${originalCount - this.cognitiveMemory.length} removidos.`);
    }
  }

  public getGreeting(lang: SupportedLanguage): string {
    const greetings: Record<string, string> = {
      'pt-BR': 'Sim? Olá! Como posso ajudar?',
      'en-US': 'Yes? Hello! How can I help?',
      'es-ES': '¿Sí? ¡Hola! ¿En qué puedo ayudar?',
      'fr-FR': 'Oui? Bonjour! Comment puis-je vous aider?',
      'de-DE': 'Ja? Hallo! Wie kann ich helfen?',
      'it-IT': 'Sì? Ciao! Come posso aiutarla?',
      'zh-CN': '您好？有什么我可以帮您的？',
      'ja-JP': 'はい、何かお手伝いしましょうか？'
    };
    return greetings[lang] || greetings['pt-BR'];
  }

  public updateMemory(role: 'user' | 'ai' | 'system', content: string, scope: MemoryScope = MemoryScope.SESSION) {
    const entry: MemoryEntry = { role, content, timestamp: Date.now(), scope };
    if (scope === MemoryScope.SESSION) {
      this.sessionMemory.push(entry);
      if (this.sessionMemory.length > 30) this.sessionMemory.shift();
    } else if (scope === MemoryScope.COGNITIVE) {
      this.cognitiveMemory.push(entry);
      this.saveCognitiveMemory();
    }
  }

  public async getSuggestion(params: Omit<AIRequestParams, 'sessionMemory' | 'taskMemory' | 'cognitiveMemory'>): Promise<Suggestion | null> {
    const fullParams: AIRequestParams = {
      ...params,
      sessionMemory: [...this.sessionMemory],
      taskMemory: [...this.taskMemory],
      cognitiveMemory: [...this.cognitiveMemory]
    };

    const suggestion = await geminiProviderInstance.getSuggestion(fullParams);
    if (suggestion) {
      this.updateMemory('user', params.context, MemoryScope.SESSION);
      this.updateMemory('ai', suggestion.description, MemoryScope.SESSION);
    }
    return suggestion;
  }

  public purgeMemory() {
    this.sessionMemory = [];
    this.cognitiveMemory = [];
    localStorage.removeItem(MEMORY_STORAGE_KEY);
    audit.log('SECURITY', AIStatus.IDLE, 'Memória Cognitiva limpa.');
  }
}

export const aiManager = AIManager.getInstance();
