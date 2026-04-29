import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api-config';

export interface AdminChatMessage {
  id?: string;
  text: string;
  sender: 'user' | 'ai';
  time: Date;
}

export interface AdminChatResponse {
  response: string;
  progress?: number;
  is_complete?: boolean;
  collected_data?: Record<string, any>;
}

export interface AdminChatRequest {
  message: string;
  conversation_history?: string[];
  mode: 'creation' | 'modification';
}

@Injectable({
  providedIn: 'root'
})
export class AdminChatbotService {
  private readonly aiServiceUrl = API_CONFIG.ai;

  constructor(private http: HttpClient) {}

  startConversation(): Observable<AdminChatResponse> {
    return this.http.post<AdminChatResponse>(`${this.aiServiceUrl}/admin-chat/start`, {}, { headers: this.getJsonHeaders() });
  }

  chat(request: AdminChatRequest): Observable<AdminChatResponse> {
    return this.http.post<AdminChatResponse>(`${this.aiServiceUrl}/admin-chat`, request, { headers: this.getJsonHeaders() });
  }

  formatHistory(messages: AdminChatMessage[]): string[] {
    return messages.map((message) => `${message.sender === 'user' ? 'User' : 'AI'}: ${message.text}`);
  }

  generateCreationSummary(collectedData: Record<string, any>, currentEntityType: string): string {
    if (!currentEntityType || !collectedData) {
      return 'Aucune information de création disponible pour le moment.';
    }

    const summaryParts: string[] = [];
    summaryParts.push(`Type d'entité: ${currentEntityType}`);

    Object.entries(collectedData).forEach(([key, value]) => {
      summaryParts.push(`${key}: ${value}`);
    });

    return summaryParts.join(', ');
  }

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}
