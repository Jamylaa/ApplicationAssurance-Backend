import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GarantieChatbotResponse {
  success?: boolean;
  message: string;
  suggestions?: string[];
  garanties?: any[];
  garantie?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GarantieChatbotService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  askGarantieChatbot(question: string): Observable<GarantieChatbotResponse> {
    return this.http.post<GarantieChatbotResponse>(`${this.apiUrl}/garantie-chatbot`, { question });
  }

  getGarantieSuggestions(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/garantie-suggestions?q=${query}`);
  }
}
