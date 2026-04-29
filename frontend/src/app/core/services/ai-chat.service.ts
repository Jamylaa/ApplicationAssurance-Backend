import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  is_complete: boolean;
  suggestions?: string[];
  error?: string;
}

export interface RecommendationRequest {
  message: string;
  conversation_history?: ChatMessage[];
  client_id?: string;
}

export interface AdminChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  mode: 'creation' | 'modification';
  session_id?: string;
}

export interface PackCreationRequest {
  prompt: string;
}

export interface GarantieCreationRequest {
  prompt: string;
}

export interface ChatSession {
  id: string;
  type: 'recommendation' | 'admin' | 'pack' | 'garantie';
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private readonly aiServiceUrl = 'http://localhost:5000/api';
  private currentSessionId = new BehaviorSubject<string>('default_user');
  private currentSession = new BehaviorSubject<ChatSession | null>(null);

  constructor(private http: HttpClient) {}

  // Session management
  getCurrentSessionId(): Observable<string> {
    return this.currentSessionId.asObservable();
  }

  setCurrentSessionId(sessionId: string): void {
    this.currentSessionId.next(sessionId);
  }

  getCurrentSession(): Observable<ChatSession | null> {
    return this.currentSession.asObservable();
  }

  setCurrentSession(session: ChatSession): void {
    this.currentSession.next(session);
  }

  // Recommendation Chat
  startRecommendationChat(): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/recommendation-chat/start`, {});
  }

  sendRecommendationMessage(request: RecommendationRequest): Observable<ChatResponse> {
    const headers = this.getHeadersWithSession();
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/recommendation-chat`, request, { headers });
  }

  // Admin Chat
  startAdminChat(): Observable<ChatResponse> {
    const headers = this.getHeadersWithSession();
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/admin-chat/start`, {}, { headers });
  }

  resetAdminChat(): Observable<{ status: string; message: string }> {
    const headers = this.getHeadersWithSession();
    return this.http.post<{ status: string; message: string }>(`${this.aiServiceUrl}/admin-chat/reset`, {}, { headers });
  }

  sendAdminMessage(request: AdminChatRequest): Observable<ChatResponse> {
    const headers = this.getHeadersWithSession();
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/admin-chat`, request, { headers });
  }

  // Single Prompt Chatbots
  createProductFromPrompt(prompt: string): Observable<ChatResponse> {
    const request = { prompt };
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/product-chatbot/create`, request);
  }

  createPackFromPrompt(prompt: string): Observable<ChatResponse> {
    const request: PackCreationRequest = { prompt };
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/pack-chatbot/create`, request);
  }

  createGarantieFromPrompt(prompt: string): Observable<ChatResponse> {
    const request: GarantieCreationRequest = { prompt };
    return this.http.post<ChatResponse>(`${this.aiServiceUrl}/garantie-chatbot/create`, request);
  }

  // Health Check
  healthCheck(): Observable<{
    service: string;
    status: string;
    services: {
      recommendation: string;
      admin: string;
      'pack-chatbot': string;
      'garantie-chatbot': string;
    };
  }> {
    return this.http.get<any>(`${this.aiServiceUrl}/health`);
  }

  // Utility methods
  private getHeadersWithSession(): HttpHeaders {
    const sessionId = this.currentSessionId.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId
    });
  }

  // Session helpers
  createNewSession(type: 'recommendation' | 'admin' | 'pack' | 'garantie'): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      type,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.setCurrentSessionId(sessionId);
    this.setCurrentSession(session);
    
    return session;
  }

  addMessageToSession(message: string, isUser: boolean): void {
    const currentSession = this.currentSession.value;
    if (currentSession) {
      const newMessage: ChatMessage = {
        message,
        isUser,
        timestamp: new Date()
      };
      
      currentSession.messages.push(newMessage);
      currentSession.lastActivity = new Date();
      this.setCurrentSession({ ...currentSession });
    }
  }

  clearCurrentSession(): void {
    this.currentSession.next(null);
    this.currentSessionId.next('default_user');
  }

  // Conversation history helpers
  getConversationHistory(): ChatMessage[] {
    return this.currentSession.value?.messages || [];
  }

  formatConversationHistoryForAPI(): any[] {
    return this.getConversationHistory().map(msg => ({
      message: msg.message,
      is_user: msg.isUser,
      timestamp: msg.timestamp
    }));
  }

  // Error handling
  handleChatError(error: any): ChatResponse {
    console.error('Chat service error:', error);
    return {
      response: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
      is_complete: false,
      error: error?.message || 'Erreur inconnue'
    };
  }

  // Validation helpers
  validatePrompt(prompt: string): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Le message ne peut pas être vide' };
    }
    
    if (prompt.length > 2000) {
      return { valid: false, error: 'Le message est trop long (maximum 2000 caractères)' };
    }
    
    return { valid: true };
  }

  validateAdminRequest(request: AdminChatRequest): { valid: boolean; error?: string } {
    const promptValidation = this.validatePrompt(request.message);
    if (!promptValidation.valid) {
      return promptValidation;
    }
    
    if (!['creation', 'modification'].includes(request.mode)) {
      return { valid: false, error: 'Le mode doit être "creation" ou "modification"' };
    }
    
    return { valid: true };
  }
}
