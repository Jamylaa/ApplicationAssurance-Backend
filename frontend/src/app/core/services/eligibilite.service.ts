import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConditionEligibilite, EligibiliteResultat } from '../../models/entities.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EligibiliteService {
  private baseUrl = environment.apiProduit + '/eligibilite';

  constructor(private http: HttpClient) {}

  /**
   * Valide les conditions d'éligibilité d'un pack par rapport à son produit
   */
  validerEligibilitePack(produit: any, pack: any): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/valider-pack`, { produit, pack });
  }

  /**
   * Valide les conditions d'éligibilité d'une garantie par rapport à son pack
   */
  validerEligibiliteGarantie(pack: any, garantie: any): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/valider-garantie`, { pack, garantie });
  }

  /**
   * Vérifie l'éligibilité complète d'un client
   */
  verifierEligibiliteClient(client: any, produit: any, pack: any, garanties: any[]): Observable<EligibiliteResultat> {
    return this.http.post<EligibiliteResultat>(`${this.baseUrl}/verifier-client`, { 
      client, produit, pack, garanties 
    });
  }

  /**
   * Crée des conditions d'éligibilité pour un pack basées sur celles du produit
   */
  creerConditionsPack(conditionsProduit: ConditionEligibilite): Observable<ConditionEligibilite> {
    return this.http.post<ConditionEligibilite>(`${this.baseUrl}/creer-conditions-pack`, conditionsProduit);
  }

  /**
   * Vérifie si les conditions sont compatibles (méthode utilitaire)
   */
  isConditionsCompatible(conditionsParent: ConditionEligibilite, conditionsEnfant: ConditionEligibilite): boolean {
    // Validation de l'âge
    if (conditionsEnfant.ageMinimum && conditionsParent.ageMinimum) {
      if (conditionsEnfant.ageMinimum < conditionsParent.ageMinimum) return false;
    }
    
    if (conditionsEnfant.ageMaximum && conditionsParent.ageMaximum) {
      if (conditionsEnfant.ageMaximum > conditionsParent.ageMaximum) return false;
    }

    // Validation des maladies chroniques
    if (conditionsEnfant.exclusionMaladiesChroniques && !conditionsParent.exclusionMaladiesChroniques) {
      return false;
    }

    // Validation de l'ancienneté
    if (conditionsEnfant.ancienneteContratMois && conditionsParent.ancienneteContratMois) {
      if (conditionsEnfant.ancienneteContratMois > conditionsParent.ancienneteContratMois) return false;
    }

    return true;
  }

  /**
   * Génère un message d'erreur d'incompatibilité
   */
  getErrorMessageIncompatibilite(type: 'pack' | 'garantie', details: string[]): string {
    const titre = type === 'pack' ? 'Pack' : 'Garantie';
    return `${titre} incompatible avec les conditions parentes:\n- ${details.join('\n- ')}`;
  }
}
