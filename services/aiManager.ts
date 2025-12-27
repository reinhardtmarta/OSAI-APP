
import { AIProvider, AIRequestParams, Suggestion, SupportedLanguage, MemoryEntry, MemoryScope, AIStatus } from '../types';
import { geminiProviderInstance } from './geminiService';
import { audit } from './auditLog';

const MEMORY_STORAGE_KEY = 'osai_cognitive_memory_v3';

class AIManager {
  private static instance: AIManager;
  private sessionMemory: MemoryEntry[] = [];
  private cognitiveMemory: MemoryEntry[] = [];
  
  private constructor() {
    this.loadCognitiveMemory();
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
      if (saved) this.cognitiveMemory = JSON.parse(saved).slice(-20); // Keep only 20 most recent for speed
    } catch (e) {}
  }

  public getGreeting(lang: SupportedLanguage): string {
    const greetings: Record<string, string> = {
      'pt-BR': 'Sim? Como posso ajudar?',
      'en-US': 'Yes? How can I help?',
      'es-ES': '¿Sí? ¿Cómo ayudo?',
      'fr-FR': 'Oui? Comment aider?',
      'de-DE': 'Ja? Wie kann ich helfen?',
      'it-IT': 'Sì? Come aiutarla?',
      'zh-CN': '您好？我该如何帮您？',
      'ja-JP': 'はい、お手伝いしましょうか？'
    };
    // Default to English greeting
    return greetings[lang] || greetings['en-US'];
  }

  public updateMemory(role: 'user' | 'ai' | 'system', content: string, scope: MemoryScope = MemoryScope.SESSION) {
    const entry: MemoryEntry = { role, content, timestamp: Date.now(), scope };
    if (scope === MemoryScope.SESSION) {
      this.sessionMemory.push(entry);
      if (this.sessionMemory.length > 10) this.sessionMemory.shift();
    } else if (scope === MemoryScope.COGNITIVE) {
      this.cognitiveMemory.push(entry);
      if (this.cognitiveMemory.length > 20) this.cognitiveMemory.shift();
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.cognitiveMemory));
    }
  }

  public async getSuggestion(params: Omit<AIRequestParams, 'sessionMemory' | 'taskMemory' | 'cognitiveMemory'>): Promise<Suggestion | null> {
    const suggestion = await geminiProviderInstance.getSuggestion({
      ...params,
      sessionMemory: this.sessionMemory,
      taskMemory: [],
      cognitiveMemory: this.cognitiveMemory
    });
    
    if (suggestion) {
      this.updateMemory('user', params.context);
      this.updateMemory('ai', suggestion.description);
    }
    return suggestion;
  }

  public purgeMemory() {
    this.sessionMemory = [];
    this.cognitiveMemory = [];
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  }
}

export const aiManager = AIManager.getInstance();
