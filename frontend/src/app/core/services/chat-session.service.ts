import { Injectable } from '@angular/core';
import { ChatSession } from '../../../core/services/ai-chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChatSessionService {
  private storageKey = 'unified_chat_sessions';

  saveSessions(sessions: ChatSession[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(sessions));
  }

  loadSessions(): ChatSession[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  clearSessions(): void {
    localStorage.removeItem(this.storageKey);
  }
}
