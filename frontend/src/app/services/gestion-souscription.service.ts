import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Souscription {
  id?: string;
  idUser: string;
  idProduit: string;
  idPack?: string;
  dateSouscription: Date;
  statut: 'EN_COURS' | 'VALIDEE' | 'ANNULEE' | 'EXPIREE';
  montant?: number;
  duree?: number;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface Contrat {
  id?: string;
  idSouscription: string;
  numeroContrat: string;
  dateSignature: Date;
  conditions?: string;
  statut: 'ACTIF' | 'SUSPENDU' | 'RESILIE';
}

@Injectable({
  providedIn: 'root'
})
export class GestionSouscriptionService {
  private readonly apiUrl = 'http://localhost:9094';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Gestion des souscriptions
  getAllSouscriptions(): Observable<Souscription[]> {
    return this.http.get<Souscription[]>(`${this.apiUrl}/souscriptions`, {
      headers: this.getAuthHeaders()
    });
  }

  getSouscriptionById(id: string): Observable<Souscription> {
    return this.http.get<Souscription>(`${this.apiUrl}/souscriptions/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getSouscriptionsByUser(idUser: string): Observable<Souscription[]> {
    return this.http.get<Souscription[]>(`${this.apiUrl}/souscriptions/user/${idUser}`, {
      headers: this.getAuthHeaders()
    });
  }

  getSouscriptionsByProduit(idProduit: string): Observable<Souscription[]> {
    return this.http.get<Souscription[]>(`${this.apiUrl}/souscriptions/produit/${idProduit}`, {
      headers: this.getAuthHeaders()
    });
  }

  createSouscription(souscription: Souscription): Observable<Souscription> {
    return this.http.post<Souscription>(`${this.apiUrl}/souscriptions`, souscription, {
      headers: this.getAuthHeaders()
    });
  }

  updateSouscription(id: string, souscription: Souscription): Observable<Souscription> {
    return this.http.put<Souscription>(`${this.apiUrl}/souscriptions/${id}`, souscription, {
      headers: this.getAuthHeaders()
    });
  }

  deleteSouscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/souscriptions/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  validerSouscription(id: string): Observable<Souscription> {
    return this.http.post<Souscription>(`${this.apiUrl}/souscriptions/${id}/valider`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  annulerSouscription(id: string): Observable<Souscription> {
    return this.http.post<Souscription>(`${this.apiUrl}/souscriptions/${id}/annuler`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Gestion des contrats
  getAllContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/contrats`, {
      headers: this.getAuthHeaders()
    });
  }

  getContratById(id: string): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.apiUrl}/contrats/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getContratsBySouscription(idSouscription: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/contrats/souscription/${idSouscription}`, {
      headers: this.getAuthHeaders()
    });
  }

  createContrat(contrat: Contrat): Observable<Contrat> {
    return this.http.post<Contrat>(`${this.apiUrl}/contrats`, contrat, {
      headers: this.getAuthHeaders()
    });
  }

  updateContrat(id: string, contrat: Contrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.apiUrl}/contrats/${id}`, contrat, {
      headers: this.getAuthHeaders()
    });
  }

  deleteContrat(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contrats/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
