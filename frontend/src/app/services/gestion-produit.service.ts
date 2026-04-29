import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produit {
  id?: string;
  nom: string;
  description?: string;
  prix?: number;
  type?: string;
  dateCreation?: Date;
}

export interface Pack {
  id?: string;
  nom: string;
  description?: string;
  prix?: number;
  produits?: string[];
  dateCreation?: Date;
}

export interface Garantie {
  id?: string;
  nom: string;
  description?: string;
  couverture?: string;
  dateCreation?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GestionProduitService {
  private readonly apiUrl = 'http://localhost:9093';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Gestion des produits
  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits`, {
      headers: this.getAuthHeaders()
    });
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/produits`, produit, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduit(id: string, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/produits/${id}`, produit, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Gestion des packs
  getAllPacks(): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs`, {
      headers: this.getAuthHeaders()
    });
  }

  getPackById(id: string): Observable<Pack> {
    return this.http.get<Pack>(`${this.apiUrl}/packs/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createPack(pack: Pack): Observable<Pack> {
    return this.http.post<Pack>(`${this.apiUrl}/packs`, pack, {
      headers: this.getAuthHeaders()
    });
  }

  updatePack(id: string, pack: Pack): Observable<Pack> {
    return this.http.put<Pack>(`${this.apiUrl}/packs/${id}`, pack, {
      headers: this.getAuthHeaders()
    });
  }

  deletePack(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/packs/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Gestion des garanties
  getAllGaranties(): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties`, {
      headers: this.getAuthHeaders()
    });
  }

  getGarantieById(id: string): Observable<Garantie> {
    return this.http.get<Garantie>(`${this.apiUrl}/garanties/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createGarantie(garantie: Garantie): Observable<Garantie> {
    return this.http.post<Garantie>(`${this.apiUrl}/garanties`, garantie, {
      headers: this.getAuthHeaders()
    });
  }

  updateGarantie(id: string, garantie: Garantie): Observable<Garantie> {
    return this.http.put<Garantie>(`${this.apiUrl}/garanties/${id}`, garantie, {
      headers: this.getAuthHeaders()
    });
  }

  deleteGarantie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/garanties/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
