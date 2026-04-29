import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AiChatRequest {
  message: string;
  conversation_history?: Array<{role: string, content: string}>;
  mode?: 'recommendation' | 'admin' | 'creation';
  client_id?: string;
  session_id?: string;
}

export interface AiChatResponse {
  response: string;
  next_field?: string;
  progress?: number;
  is_complete: boolean;
  collected_data?: any;
  suggestions?: string[];
  error?: string;
}

export interface PackCreationData {
  nom: string;
  description: string;
  prix: number;
  produits: string[];
  garanties: string[];
  niveauCouverture?: string;
}

export interface GarantieCreationData {
  nom: string;
  description: string;
  type: string;
  plafond?: number;
  franchise?: number;
  conditions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private baseUrl = environment.apiUrl.ai;
  private currentSessionData = new BehaviorSubject<any>(null);
  private isProcessing = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  // Observable streams
  get sessionData$() {
    return this.currentSessionData.asObservable();
  }

  get isProcessing$() {
    return this.isProcessing.asObservable();
  }

  // Chat endpoints
  chat(request: AiChatRequest): Observable<AiChatResponse> {
    this.isProcessing.next(true);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(request.session_id && { 'X-Session-Id': request.session_id })
    });

    return this.http.post<AiChatResponse>(`${this.baseUrl}/chat`, request, { headers }).pipe(
      tap(response => {
        if (response.collected_data) {
          this.currentSessionData.next(response.collected_data);
        }
      }),
      catchError(error => this.handleError(error)),
      tap(() => this.isProcessing.next(false))
    );
  }

  // Recommendation specific endpoints
  startRecommendationChat(clientId?: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.baseUrl}/recommendation-chat/start`, 
      { client_id: clientId }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  sendRecommendationMessage(request: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.baseUrl}/recommendation-chat`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Admin specific endpoints
  startAdminChat(): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.baseUrl}/admin-chat/start`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  sendAdminMessage(request: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.baseUrl}/admin-chat`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  resetAdminChat(): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${this.baseUrl}/admin-chat/reset`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Pack creation endpoint
  createPackFromPrompt(prompt: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.baseUrl}/pack-chatbot/create`, { prompt }).pipe(
      map(response => {
        // Try to extract structured data from response
        if (response.is_complete && response.response) {
          try {
            const structuredData = this.extractPackData(response.response);
            return {
              ...response,
              collected_data: structuredData
            };
          } catch (e) {
            // If parsing fails, return original response
            return response;
          }
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Garantie creation endpoint
  createGarantieFromPrompt(prompt: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.baseUrl}/garantie-chatbot/create`, { prompt }).pipe(
      map(response => {
        // Try to extract structured data from response
        if (response.is_complete && response.response) {
          try {
            const structuredData = this.extractGarantieData(response.response);
            return {
              ...response,
              collected_data: structuredData
            };
          } catch (e) {
            // If parsing fails, return original response
            return response;
          }
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Utility methods
  private extractPackData(response: string): PackCreationData {
    // This is a simplified extraction - in production, you'd use more sophisticated parsing
    const lines = response.split('\n');
    const data: Partial<PackCreationData> = {
      produits: [],
      garanties: []
    };

    lines.forEach(line => {
      if (line.includes('Nom:') || line.includes('nom:')) {
        data.nom = line.split(':')[1]?.trim();
      } else if (line.includes('Description:') || line.includes('description:')) {
        data.description = line.split(':')[1]?.trim();
      } else if (line.includes('Prix:') || line.includes('prix:')) {
        const price = parseFloat(line.split(':')[1]?.trim());
        if (!isNaN(price)) data.prix = price;
      } else if (line.includes('Produit:') || line.includes('produit:')) {
        const produit = line.split(':')[1]?.trim();
        if (produit) data.produits?.push(produit);
      } else if (line.includes('Garantie:') || line.includes('garantie:')) {
        const garantie = line.split(':')[1]?.trim();
        if (garantie) data.garanties?.push(garantie);
      }
    });

    return data as PackCreationData;
  }

  private extractGarantieData(response: string): GarantieCreationData {
    const lines = response.split('\n');
    const data: Partial<GarantieCreationData> = {
      conditions: []
    };

    lines.forEach(line => {
      if (line.includes('Nom:') || line.includes('nom:')) {
        data.nom = line.split(':')[1]?.trim();
      } else if (line.includes('Description:') || line.includes('description:')) {
        data.description = line.split(':')[1]?.trim();
      } else if (line.includes('Type:') || line.includes('type:')) {
        data.type = line.split(':')[1]?.trim();
      } else if (line.includes('Plafond:') || line.includes('plafond:')) {
        const plafond = parseFloat(line.split(':')[1]?.trim());
        if (!isNaN(plafond)) data.plafond = plafond;
      } else if (line.includes('Franchise:') || line.includes('franchise:')) {
        const franchise = parseFloat(line.split(':')[1]?.trim());
        if (!isNaN(franchise)) data.franchise = franchise;
      }
    });

    return data as GarantieCreationData;
  }

  private handleError(error: any): Observable<never> {
    console.error('AI Service Error:', error);
    
    let errorMessage = 'Une erreur est survenue lors de la communication avec le service IA';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.status === 0) {
      errorMessage = 'Service IA indisponible - vérifiez que le serveur est en cours d\'exécution';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur IA - veuillez réessayer plus tard';
    } else if (error.status === 400) {
      errorMessage = 'Requête invalide - vérifiez les données envoyées';
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      originalError: error
    }));
  }

  // Session management
  updateSessionData(data: any): void {
    this.currentSessionData.next(data);
  }

  clearSessionData(): void {
    this.currentSessionData.next(null);
  }

  // Validation helpers
  validateChatRequest(request: AiChatRequest): {valid: boolean, error?: string} {
    if (!request.message || request.message.trim().length === 0) {
      return { valid: false, error: 'Le message ne peut pas être vide' };
    }

    if (request.message.length > 2000) {
      return { valid: false, error: 'Le message est trop long (maximum 2000 caractères)' };
    }

    if (request.mode && !['recommendation', 'admin', 'creation'].includes(request.mode)) {
      return { valid: false, error: 'Mode invalide' };
    }

    return { valid: true };
  }
}
