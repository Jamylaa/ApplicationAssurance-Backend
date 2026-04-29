import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionnaireResponse, RecommendationResult } from '../../models/recommendation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = environment.apiUrl.recommendation; // Endpoint backend Gateway
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  // Endpoint backend: /api/recommendations/evaluate
  evaluateQuestionnaire(questionnaire: QuestionnaireResponse): Observable<RecommendationResult> {
    return this.http.post<RecommendationResult>(`${this.apiUrl}/recommendations/evaluate`, questionnaire, this.httpOptions);
  }

  // Endpoint backend: /api/recommendations/{id}
  getRecommendationById(id: string): Observable<RecommendationResult> {
    return this.http.get<RecommendationResult>(`${this.apiUrl}/recommendations/${id}`);
  }

  // Endpoint backend: /api/recommendations/client/{clientId}
  getRecommendationsByClient(clientId: string): Observable<RecommendationResult[]> {
    return this.http.get<RecommendationResult[]>(`${this.apiUrl}/recommendations/client/${clientId}`);
  }

  // Endpoint backend: /api/recommendations/questionnaires/{clientId}
  getQuestionnairesByClient(clientId: string): Observable<QuestionnaireResponse[]> {
    return this.http.get<QuestionnaireResponse[]>(`${this.apiUrl}/recommendations/questionnaires/${clientId}`);
  }
}
