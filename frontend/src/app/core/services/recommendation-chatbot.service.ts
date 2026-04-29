import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecommendationChatbotResponse {
  message: string;
  recommendations?: any[];
  packs?: any[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationChatbotService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<RecommendationChatbotResponse> {
    return this.http.post<RecommendationChatbotResponse>(`${this.apiUrl}/recommendation-chatbot`, { message });
  }

  getRecommendations(clientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recommendations/${clientId}`);
  }

  getPacksRecommendation(clientProfile: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/pack-recommendation`, clientProfile);
  }

  startConversation(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/start-conversation`, {});
  }

  formatHistory(messages: ChatMessage[]): string {
    return messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  }

  chat(message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat`, { message });
  }

  generateProfileSummary(data: any): string {
    return JSON.stringify(data);
  }

  getPackDetails(packId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/packs/${packId}`);
  }
}
