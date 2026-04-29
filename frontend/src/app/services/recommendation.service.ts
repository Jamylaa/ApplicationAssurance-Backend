import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recommendation {
  id?: string;
  idUser: string;
  idProduit: string;
  score?: number;
  raisons?: string[];
  dateGeneration: Date;
  type: 'PRODUIT' | 'PACK' | 'GARANTIE';
}

export interface Questionnaire {
  id?: string;
  idUser: string;
  reponses: {
    question: string;
    reponse: string | number;
    poids?: number;
  }[];
  dateSoumission: Date;
  profil?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly apiUrl = 'http://localhost:9095';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Gestion des recommandations
  getAllRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/recommendations`, {
      headers: this.getAuthHeaders()
    });
  }

  getRecommendationsByUser(idUser: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/recommendations/user/${idUser}`, {
      headers: this.getAuthHeaders()
    });
  }

  getRecommendationsByProduit(idProduit: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/recommendations/produit/${idProduit}`, {
      headers: this.getAuthHeaders()
    });
  }

  generateRecommendations(idUser: string): Observable<Recommendation[]> {
    return this.http.post<Recommendation[]>(`${this.apiUrl}/recommendations/generate/${idUser}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  createRecommendation(recommendation: Recommendation): Observable<Recommendation> {
    return this.http.post<Recommendation>(`${this.apiUrl}/recommendations`, recommendation, {
      headers: this.getAuthHeaders()
    });
  }

  deleteRecommendation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recommendations/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Gestion des questionnaires
  getAllQuestionnaires(): Observable<Questionnaire[]> {
    return this.http.get<Questionnaire[]>(`${this.apiUrl}/questionnaires`, {
      headers: this.getAuthHeaders()
    });
  }

  getQuestionnaireByUser(idUser: string): Observable<Questionnaire[]> {
    return this.http.get<Questionnaire[]>(`${this.apiUrl}/questionnaires/user/${idUser}`, {
      headers: this.getAuthHeaders()
    });
  }

  submitQuestionnaire(questionnaire: Questionnaire): Observable<Questionnaire> {
    return this.http.post<Questionnaire>(`${this.apiUrl}/questionnaires`, questionnaire, {
      headers: this.getAuthHeaders()
    });
  }

  updateQuestionnaire(id: string, questionnaire: Questionnaire): Observable<Questionnaire> {
    return this.http.put<Questionnaire>(`${this.apiUrl}/questionnaires/${id}`, questionnaire, {
      headers: this.getAuthHeaders()
    });
  }

  deleteQuestionnaire(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/questionnaires/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Analyse et profil
  analyserProfil(idUser: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/analyse/profil/${idUser}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getProfilUser(idUser: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profil/${idUser}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Service AI externe (port 5000)
  getAIRecommendations(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:5000/recommend', data, {
      headers: this.getAuthHeaders()
    });
  }
}
