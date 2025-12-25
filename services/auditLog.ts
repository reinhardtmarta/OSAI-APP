
import { AuditEvent, AIStatus } from '../types';

class AuditManager {
  private static instance: AuditManager;
  private logs: AuditEvent[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  public static getInstance(): AuditManager {
    if (!AuditManager.instance) {
      AuditManager.instance = new AuditManager();
    }
    return AuditManager.instance;
  }

  public log(category: AuditEvent['category'], state: AIStatus, message: string, data?: any) {
    const event: AuditEvent = {
      timestamp: Date.now(),
      category,
      state,
      message,
      data
    };
    
    this.logs.push(event);
    if (this.logs.length > this.MAX_LOGS) this.logs.shift();
    
    // In production, this would be sent to a write-only immutable database/buffer
    console.debug(`[AUDIT][${category}] ${message}`, data || '');
  }

  public getLogs(): AuditEvent[] {
    return [...this.logs];
  }
}

export const audit = AuditManager.getInstance();
