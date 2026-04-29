import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AiService, PackCreationData, GarantieCreationData } from '../../core/services/ai.service';

export interface FormSyncData {
  type: 'pack' | 'garantie' | 'produit';
  data: any;
  status: 'pending' | 'completed' | 'error';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiFormSyncService {
  private syncData$ = new BehaviorSubject<FormSyncData | null>(null);
  private isSyncing$ = new BehaviorSubject<boolean>(false);

  constructor(private aiService: AiService) {}

  // Observable streams
  get syncData(): Observable<FormSyncData | null> {
    return this.syncData$.asObservable();
  }

  get isSyncing(): Observable<boolean> {
    return this.isSyncing$.asObservable();
  }

  // Sync methods
  async syncPackFromPrompt(prompt: string): Promise<void> {
    this.isSyncing$.next(true);
    
    try {
      const response = await this.aiService.createPackFromPrompt(prompt).toPromise();
      
      if (response?.collected_data) {
        const syncData: FormSyncData = {
          type: 'pack',
          data: response.collected_data,
          status: 'completed',
          timestamp: new Date()
        };
        
        this.syncData$.next(syncData);
      } else {
        this.syncData$.next({
          type: 'pack',
          data: null,
          status: 'error',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Pack sync error:', error);
      this.syncData$.next({
        type: 'pack',
        data: null,
        status: 'error',
        timestamp: new Date()
      });
    } finally {
      this.isSyncing$.next(false);
    }
  }

  async syncGarantieFromPrompt(prompt: string): Promise<void> {
    this.isSyncing$.next(true);
    
    try {
      const response = await this.aiService.createGarantieFromPrompt(prompt).toPromise();
      
      if (response?.collected_data) {
        const syncData: FormSyncData = {
          type: 'garantie',
          data: response.collected_data,
          status: 'completed',
          timestamp: new Date()
        };
        
        this.syncData$.next(syncData);
      } else {
        this.syncData$.next({
          type: 'garantie',
          data: null,
          status: 'error',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Garantie sync error:', error);
      this.syncData$.next({
        type: 'garantie',
        data: null,
        status: 'error',
        timestamp: new Date()
      });
    } finally {
      this.isSyncing$.next(false);
    }
  }

  // Form data transformation
  transformPackToFormData(packData: PackCreationData): any {
    return {
      nom: packData.nom || '',
      description: packData.description || '',
      prix: packData.prix || 0,
      produitsAssocies: packData.produits || [],
      garantiesIncluses: packData.garanties || [],
      niveauCouverture: packData.niveauCouverture || 'STANDARD',
      statut: 'ACTIF'
    };
  }

  transformGarantieToFormData(garantieData: GarantieCreationData): any {
    return {
      nom: garantieData.nom || '',
      description: garantieData.description || '',
      type: garantieData.type || '',
      plafond: garantieData.plafond || 0,
      franchise: garantieData.franchise || 0,
      conditions: garantieData.conditions || [],
      statut: 'ACTIF'
    };
  }

  // Clear sync data
  clearSyncData(): void {
    this.syncData$.next(null);
  }

  // Validation methods
  validatePackData(data: PackCreationData): {valid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    if (!data.nom || data.nom.trim().length === 0) {
      errors.push('Le nom du pack est requis');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('La description du pack est requise');
    }
    
    if (!data.prix || data.prix <= 0) {
      errors.push('Le prix doit être supérieur à 0');
    }
    
    if (!data.produits || data.produits.length === 0) {
      errors.push('Au moins un produit doit être associé');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateGarantieData(data: GarantieCreationData): {valid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    if (!data.nom || data.nom.trim().length === 0) {
      errors.push('Le nom de la garantie est requis');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('La description de la garantie est requise');
    }
    
    if (!data.type || data.type.trim().length === 0) {
      errors.push('Le type de la garantie est requis');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
