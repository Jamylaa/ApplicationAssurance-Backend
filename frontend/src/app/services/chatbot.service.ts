import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Garantie,
  Pack,
  Produit,
  PackGarantie,
  ApiResponse,
  PaginatedResponse
} from '../models/entities.model';

export interface ChatbotRequest {
  prompt: string;
}

export interface ChatbotResponse {
  success: boolean;
  action?: string;
  entity?: Garantie | Pack | Produit | PackGarantie;
  pack?: Pack;
  garanties?: Array<{ garantie: Garantie; packGarantie: PackGarantie }>;
  message?: string;
  id?: string;
  packId?: string;
  totalGaranties?: number;
  error?: string;
  details?: string;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly baseUrl = `${environment.apiProduit}`;

  constructor(private http: HttpClient) {}


  // Traitement principal du prompt (CREATE)
  processPrompt(prompt: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.baseUrl}/api/chatbot/process`, { prompt }).pipe(
      catchError(error => {
        console.error('Chatbot error:', error);
        return of({
          success: false,
          error: 'Erreur de communication avec le chatbot',
          details: error.error?.message || error.message
        });
      })
    );
  }

  // Health check
  healthCheck(): Observable<{ status: string; timestamp: number }> {
    return this.http.get<{ status: string; timestamp: number }>(`${this.baseUrl}/api/chatbot/health`).pipe(
      catchError(error => {
        return of({
          status: 'UNHEALTHY',
          timestamp: Date.now()
        });
      })
    );
  }

  // === OPÉRATIONS CRUD PURES ===

  // CREATE
  createGarantie(garantie: Garantie): Observable<Garantie> {
    return this.http.post<Garantie>(`${this.baseUrl}/api/garanties`, garantie);
  }

  createPack(pack: Pack): Observable<Pack> {
    return this.http.post<Pack>(`${this.baseUrl}/api/packs`, pack);
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/api/produits`, produit);
  }

  createPackGarantie(packGarantie: PackGarantie): Observable<PackGarantie> {
    return this.http.post<PackGarantie>(`${this.baseUrl}/api/pack-configuration`, packGarantie);
  }

  // READ
  getAllGaranties(): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.baseUrl}/api/garanties`);
  }

  getGarantieById(id: string): Observable<Garantie> {
    return this.http.get<Garantie>(`${this.baseUrl}/api/garanties/${id}`);
  }

  getAllPacks(): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.baseUrl}/api/packs`);
  }

  getPackById(id: string): Observable<Pack> {
    return this.http.get<Pack>(`${this.baseUrl}/api/packs/${id}`);
  }

  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/api/produits`);
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/api/produits/${id}`);
  }

  getPackGaranties(packId: string): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(`${this.baseUrl}/api/pack-configuration/${packId}/garanties`);
  }

  // UPDATE
  updateGarantie(id: string, garantie: Garantie): Observable<Garantie> {
    return this.http.put<Garantie>(`${this.baseUrl}/api/garanties/${id}`, garantie);
  }

  updatePack(id: string, pack: Pack): Observable<Pack> {
    return this.http.put<Pack>(`${this.baseUrl}/api/packs/${id}`, pack);
  }

  updateProduit(id: string, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/api/produits/${id}`, produit);
  }

  updatePackGarantie(packId: string, packGarantieId: string, packGarantie: PackGarantie): Observable<PackGarantie> {
    return this.http.put<PackGarantie>(`${this.baseUrl}/api/pack-configuration/${packId}/garanties/${packGarantieId}`, packGarantie);
  }

  // DELETE
  deleteGarantie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/garanties/${id}`);
  }

  deletePack(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/packs/${id}`);
  }

  deleteProduit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/produits/${id}`);
  }

  deletePackGarantie(packId: string, packGarantieId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/pack-configuration/${packId}/garanties/${packGarantieId}`);
  }

  // Formater une entité pour l'affichage
  formatEntityForDisplay(response: ChatbotResponse): string {
    let display = '\n\nEntité créée:\n';

    // Gérer les packs avec garanties multiples
    if (response.pack && response.garanties) {
      display += `📦 Pack: ${response.pack.nomPack}\n`;
      display += `- Description: ${response.pack.description || 'N/A'}\n`;
      display += `- Produit: ${response.pack.nomProduit || 'N/A'}\n`;
      display += `- Prix: ${response.pack.prixMensuel}€/mois\n`;
      display += `- Niveau: ${response.pack.niveauCouverture}\n`;
      display += `- Couverture: ${response.pack.couvertureGeographique}\n`;
      display += `- Âges: ${response.pack.ageMinimum}-${response.pack.ageMaximum} ans\n`;
      display += `- Types clients: ${response.pack.typeClients?.join(', ') || 'N/A'}\n`;
      display += `- Ancienneté: ${response.pack.ancienneteContratMois} mois\n`;
      display += `- Durée: ${response.pack.dureeMinContrat}-${response.pack.dureeMaxContrat} mois\n`;
      display += `- Statut: ${response.pack.statut}\n\n`;
      
      display += `🛡️ Garanties (${response.totalGaranties}):\n`;
      response.garanties.forEach((g, index) => {
        display += `  ${index + 1}. ${g.garantie.nomGarantie}\n`;
        display += `     - Type: ${g.garantie.typeGarantie}\n`;
        display += `     - Description: ${g.garantie.description || 'N/A'}\n`;
        display += `     - Taux: ${(g.garantie.tauxRemboursement * 100).toFixed(0)}%\n`;
        display += `     - Type montant: ${g.garantie.typeMontant}\n`;
        display += `     - Type plafond: ${g.garantie.typePlafond}\n`;
        display += `     - Plafonds: Annuel ${g.garantie.plafondAnnuel}€ | Mensuel ${g.garantie.plafondMensuel}€ | Par acte ${g.garantie.plafondParActe}€\n`;
        display += `     - Franchise: ${g.garantie.franchise}€\n`;
        display += `     - Coût moyen/sinistre: ${g.garantie.coutMoyenParSinistre}€\n`;
        display += `     - Durée contrat: ${g.garantie.dureeMinContrat}-${g.garantie.dureeMaxContrat} mois\n`;
        display += `     - Résiliable annuellement: ${g.garantie.resiliableAnnuellement ? 'Oui' : 'Non'}\n`;
        display += `     - Créé par: ${g.garantie.creePar}\n`;
        display += `     - Priorité pack: ${g.packGarantie.priorite}\n`;
        display += `     - Optionnelle: ${g.packGarantie.optionnelle ? 'Oui' : 'Non'}\n`;
        display += `     - Supplément prix: ${g.packGarantie.supplementPrix}€\n`;
        display += `     - Délai carence: ${g.packGarantie.delaiCarence} jours\n`;
        display += `     - Type montant pack: ${g.packGarantie.typeMontant}\n`;
        display += `     - Actif: ${g.packGarantie.actif ? 'Oui' : 'Non'}\n`;
      });
    }
    // Gérer les entités simples
    else if (response.entity) {
      const entity = response.entity;
      if ('idGarantie' in entity) {
        const garantie = entity as Garantie;
        display += `🛡️ Garantie: ${garantie.nomGarantie}\n`;
        display += `- Description: ${garantie.description || 'N/A'}\n`;
        display += `- Type: ${garantie.typeGarantie}\n`;
        display += `- Statut: ${garantie.statut}\n`;
        display += `- Taux remboursement: ${(garantie.tauxRemboursement * 100).toFixed(0)}%\n`;
        display += `- Type montant: ${garantie.typeMontant}\n`;
        display += `- Type plafond: ${garantie.typePlafond}\n`;
        display += `- Plafonds:\n`;
        display += `  • Annuel: ${garantie.plafondAnnuel}€\n`;
        display += `  • Mensuel: ${garantie.plafondMensuel}€\n`;
        display += `  • Par acte: ${garantie.plafondParActe}€\n`;
        display += `- Franchise: ${garantie.franchise}€\n`;
        display += `- Coût moyen par sinistre: ${garantie.coutMoyenParSinistre}€\n`;
        display += `- Durée contrat: ${garantie.dureeMinContrat}-${garantie.dureeMaxContrat} mois\n`;
        display += `- Résiliable annuellement: ${garantie.resiliableAnnuellement ? 'Oui' : 'Non'}\n`;
        display += `- Créé par: ${garantie.creePar}\n`;
        display += `- Date création: ${garantie.dateCreation ? new Date(garantie.dateCreation).toLocaleString() : 'N/A'}\n`;
        if (garantie.dateDesactivation) {
          display += `- Date désactivation: ${new Date(garantie.dateDesactivation).toLocaleString()}\n`;
        }
      } else if ('idPack' in entity) {
        const pack = entity as Pack;
        display += `📦 Pack: ${pack.nomPack}\n`;
        display += `- Description: ${pack.description || 'N/A'}\n`;
        display += `- Produit: ${pack.nomProduit || 'N/A'}\n`;
        display += `- Prix: ${pack.prixMensuel}€/mois\n`;
        display += `- Niveau: ${pack.niveauCouverture}\n`;
        display += `- Couverture géographique: ${pack.couvertureGeographique}\n`;
        display += `- Âges: ${pack.ageMinimum}-${pack.ageMaximum} ans\n`;
        display += `- Types clients: ${pack.typeClients?.join(', ') || 'N/A'}\n`;
        display += `- Ancienneté contrat: ${pack.ancienneteContratMois} mois\n`;
        display += `- Durée contrat: ${pack.dureeMinContrat}-${pack.dureeMaxContrat} mois\n`;
        display += `- Statut: ${pack.statut}\n`;
        display += `- Date création: ${pack.dateCreation ? new Date(pack.dateCreation).toLocaleString() : 'N/A'}\n`;
      } else if ('idProduit' in entity) {
        const produit = entity as Produit;
        display += `🏢 Produit: ${produit.nomProduit}\n`;
        display += `- Description: ${produit.description || 'N/A'}\n`;
        display += `- Type: ${produit.typeProduit}\n`;
        display += `- Statut: ${produit.statut}\n`;
        display += `- Date création: ${produit.dateCreation ? new Date(produit.dateCreation).toLocaleString() : 'N/A'}\n`;
        display += `- Date modification: ${produit.dateModification ? new Date(produit.dateModification).toLocaleString() : 'N/A'}\n`;
      } else if ('idPackGarantie' in entity) {
        const packGarantie = entity as PackGarantie;
        display += `🔗 Pack-Garantie: ${packGarantie.nomGarantie}\n`;
        display += `- Pack ID: ${packGarantie.packId}\n`;
        display += `- Garantie ID: ${packGarantie.garantieId}\n`;
        display += `- Taux remboursement: ${(packGarantie.tauxRemboursement * 100).toFixed(0)}%\n`;
        display += `- Plafond: ${packGarantie.plafond}€\n`;
        display += `- Franchise: ${packGarantie.franchise}€\n`;
        display += `- Type montant: ${packGarantie.typeMontant}\n`;
        display += `- Délai carence: ${packGarantie.delaiCarence} jours\n`;
        display += `- Priorité: ${packGarantie.priorite}\n`;
        display += `- Actif: ${packGarantie.actif ? 'Oui' : 'Non'}\n`;
        display += `- Optionnelle: ${packGarantie.optionnelle ? 'Oui' : 'Non'}\n`;
        display += `- Supplément prix: ${packGarantie.supplementPrix}€\n`;
        display += `- Date activation: ${packGarantie.dateActivation ? new Date(packGarantie.dateActivation).toLocaleString() : 'N/A'}\n`;
        if (packGarantie.dateDesactivation) {
          display += `- Date désactivation: ${new Date(packGarantie.dateDesactivation).toLocaleString()}\n`;
        }
      }
    }

    return display;
  }

  // Valider une entité
  validateEntity(entity: any, type: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'garantie':
        if (!entity.nomGarantie || entity.nomGarantie.trim() === '') {
          errors.push('Le nom de la garantie est requis');
        }
        if (!entity.typeGarantie) {
          errors.push('Le type de garantie est requis');
        }
        if (entity.tauxRemboursement < 0 || entity.tauxRemboursement > 1) {
          errors.push('Le taux de remboursement doit être entre 0 et 1');
        }
        break;

      case 'pack':
        if (!entity.nomPack || entity.nomPack.trim() === '') {
          errors.push('Le nom du pack est requis');
        }
        if (entity.prixMensuel <= 0) {
          errors.push('Le prix mensuel doit être positif');
        }
        break;

      case 'produit':
        if (!entity.nomProduit || entity.nomProduit.trim() === '') {
          errors.push('Le nom du produit est requis');
        }
        if (!entity.typeProduit) {
          errors.push('Le type de produit est requis');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
