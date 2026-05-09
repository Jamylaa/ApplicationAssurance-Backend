import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GestionProduitService } from './gestion-produit.service';
import {
  Garantie,
  Pack,
  Produit,
  PackGarantie,
  ApiResponse,
  PaginatedResponse,
  TypeProduit,
  TypeGarantie,
  NiveauCouverture,
  TypeClient,
  Statut,
  TypeMontant,
  CouvertureGeographique,
  TypePlafond
} from '../models/entities.model';

export enum ChatbotIntent {
  CREATE_PRODUIT = 'CREATE_PRODUIT',
  CREATE_GARANTIE = 'CREATE_GARANTIE',
  CREATE_PACK = 'CREATE_PACK',
  CONFIGURE_PACK = 'CONFIGURE_PACK',
  CREATE_PACK_WITH_GARANTIES = 'CREATE_PACK_WITH_GARANTIES',
  UPDATE_PRODUIT = 'UPDATE_PRODUIT',
  UPDATE_GARANTIE = 'UPDATE_GARANTIE',
  UPDATE_PACK = 'UPDATE_PACK',
  DELETE_PRODUIT = 'DELETE_PRODUIT',
  DELETE_GARANTIE = 'DELETE_GARANTIE',
  DELETE_PACK = 'DELETE_PACK',
  LIST_PRODUITS = 'LIST_PRODUITS',
  LIST_GARANTIES = 'LIST_GARANTIES',
  LIST_PACKS = 'LIST_PACKS',
  RECOMMENDATION = 'RECOMMENDATION',
  HELP = 'HELP',
  UNKNOWN = 'UNKNOWN'
}

export interface ChatbotRequest {
  prompt: string;
  context?: {
    previousIntents?: ChatbotIntent[];
    entities?: any;
  };
}

export interface ChatbotResponse {
  success: boolean;
  intent: ChatbotIntent;
  confidence: number;
  message: string;
  data?: {
    produit?: Produit;
    garantie?: Garantie;
    pack?: Pack;
    packGarantie?: PackGarantie;
    produits?: Produit[];
    garanties?: Garantie[];
    packs?: Pack[];
    packWithGaranties?: {
      pack: Pack;
      garanties: Array<{ garantie: Garantie; packGarantie: PackGarantie }>;
    };
    recommendations?: any[];
  };
  validation?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  actions?: Array<{
    type: 'CREATE' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'LIST';
    label: string;
    data?: any;
    route?: string[];
  }>;
  error?: string;
  timestamp: number;
}

export interface IntentDetection {
  intent: ChatbotIntent;
  confidence: number;
  entities: {
    type?: string;
    name?: string;
    description?: string;
    features?: string[];
    price?: number;
    coverage?: string;
    duration?: number;
    id?: string;
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly baseUrl = `${environment.apiProduit}`;

  constructor(
    private http: HttpClient,
    private gestionProduitService: GestionProduitService
  ) {}


  // TRAITEMENT PRINCIPAL DU CHATBOT
  processPrompt(request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.detectIntent(request.prompt).pipe(
      switchMap(detection => {
        const response: ChatbotResponse = {
          success: true,
          intent: detection.intent,
          confidence: detection.confidence,
          message: this.generateResponseMessage(detection),
          timestamp: Date.now()
        };

        // Traiter selon l'intention détectée
        switch (detection.intent) {
          case ChatbotIntent.CREATE_PRODUIT:
            return this.handleCreateProduit(detection, request);
          case ChatbotIntent.CREATE_GARANTIE:
            return this.handleCreateGarantie(detection, request);
          case ChatbotIntent.CREATE_PACK:
            return this.handleCreatePack(detection, request);
          case ChatbotIntent.CONFIGURE_PACK:
          case ChatbotIntent.CREATE_PACK_WITH_GARANTIES:
            return this.handleCreatePackWithGaranties(detection, request);
          case ChatbotIntent.UPDATE_PRODUIT:
            return this.handleUpdateProduit(detection, request);
          case ChatbotIntent.UPDATE_GARANTIE:
            return this.handleUpdateGarantie(detection, request);
          case ChatbotIntent.UPDATE_PACK:
            return this.handleUpdatePack(detection, request);
          case ChatbotIntent.DELETE_PRODUIT:
            return this.handleDeleteProduit(detection, request);
          case ChatbotIntent.DELETE_GARANTIE:
            return this.handleDeleteGarantie(detection, request);
          case ChatbotIntent.DELETE_PACK:
            return this.handleDeletePack(detection, request);
          case ChatbotIntent.LIST_PRODUITS:
            return this.handleListProduits(detection, request);
          case ChatbotIntent.LIST_GARANTIES:
            return this.handleListGaranties(detection, request);
          case ChatbotIntent.LIST_PACKS:
            return this.handleListPacks(detection, request);
          case ChatbotIntent.RECOMMENDATION:
            return this.handleRecommendation(detection, request);
          case ChatbotIntent.HELP:
            return this.handleHelp(detection, request);
          default:
            return of({
              ...response,
              success: false,
              message: "Je n'ai pas compris votre demande. Pouvez-vous reformuler ?\n\nJe peux vous aider à :\n- Créer, modifier, supprimer des produits d'assurance\n- Créer, modifier, supprimer des garanties\n- Créer, modifier, supprimer des packs\n- Configurer des packs avec garanties\n- Lister les entités\n- Obtenir des recommandations"
            });
        }
      }),
      catchError(error => {
        return of({
          success: false,
          intent: ChatbotIntent.UNKNOWN,
          confidence: 0,
          message: 'Erreur de communication avec le chatbot',
          error: error.error?.message || error.message,
          timestamp: Date.now()
        });
      })
    );
  }

  // APPEL BACKEND POUR LE TRAITEMENT IA
  callBackend(prompt: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.baseUrl}/chatbot/process`, {
      prompt: prompt
    }).pipe(
      catchError(error => {
        return of({
          success: false,
          intent: ChatbotIntent.UNKNOWN,
          confidence: 0,
          message: 'Erreur de communication avec le backend IA',
          error: error.error?.message || error.message,
          timestamp: Date.now()
        });
      })
    );
  }

  // DÉTECTION D'INTENTION AUTOMATIQUE
  private detectIntent(prompt: string): Observable<IntentDetection> {
    const intentPatterns = {
      [ChatbotIntent.CREATE_PRODUIT]: [
        /créer.*produit/i,
        /nouveau.*produit/i,
        /ajouter.*produit/i,
        /produit.*assurance/i,
        /création.*produit/i
      ],
      [ChatbotIntent.CREATE_GARANTIE]: [
        /créer.*garant/i,
        /nouvelle.*garant/i,
        /ajouter.*garant/i,
        /garant.*hospitalisation/i,
        /garant.*santé/i,
        /remboursement/i,
        /couverture/i
      ],
      [ChatbotIntent.CREATE_PACK]: [
        /créer.*pack/i,
        /nouveau.*pack/i,
        /ajouter.*pack/i,
        /pack.*santé/i,
        /formule/i,
        /offre/i
      ],
      [ChatbotIntent.CONFIGURE_PACK]: [
        /configurer.*pack/i,
        /ajouter.*garant.*pack/i,
        /pack.*avec.*garant/i,
        /composer.*pack/i
      ],
      [ChatbotIntent.CREATE_PACK_WITH_GARANTIES]: [
        /créer.*pack.*avec.*garant/i,
        /pack.*garanties.*multiples/i,
        /formule.*complète/i,
        /offre.*garanties/i
      ],
      [ChatbotIntent.UPDATE_PRODUIT]: [
        /modifier.*produit/i,
        /mettre.*jour.*produit/i,
        /changer.*produit/i,
        /actualiser.*produit/i
      ],
      [ChatbotIntent.UPDATE_GARANTIE]: [
        /modifier.*garant/i,
        /mettre.*jour.*garant/i,
        /changer.*garant/i,
        /actualiser.*garant/i
      ],
      [ChatbotIntent.UPDATE_PACK]: [
        /modifier.*pack/i,
        /mettre.*jour.*pack/i,
        /changer.*pack/i,
        /actualiser.*pack/i
      ],
      [ChatbotIntent.DELETE_PRODUIT]: [
        /supprimer.*produit/i,
        /effacer.*produit/i,
        /retirer.*produit/i
      ],
      [ChatbotIntent.DELETE_GARANTIE]: [
        /supprimer.*garant/i,
        /effacer.*garant/i,
        /retirer.*garant/i
      ],
      [ChatbotIntent.DELETE_PACK]: [
        /supprimer.*pack/i,
        /effacer.*pack/i,
        /retirer.*pack/i
      ],
      [ChatbotIntent.LIST_PRODUITS]: [
        /lister.*produit/i,
        /voir.*produit/i,
        /afficher.*produit/i,
        /produits.*disponibles/i
      ],
      [ChatbotIntent.LIST_GARANTIES]: [
        /lister.*garant/i,
        /voir.*garant/i,
        /afficher.*garant/i,
        /garanties.*disponibles/i
      ],
      [ChatbotIntent.LIST_PACKS]: [
        /lister.*pack/i,
        /voir.*pack/i,
        /afficher.*pack/i,
        /packs.*disponibles/i
      ],
      [ChatbotIntent.RECOMMENDATION]: [
        /recommand/i,
        /suggest/i,
        /conseil/i,
        /meilleur/i,
        /choisir/i,
        /quel.*produit/i,
        /quelle.*garant/i
      ],
      [ChatbotIntent.HELP]: [
        /aide/i,
        /help/i,
        /comment/i,
        /expliquer/i,
        /fonctionnement/i
      ]
    };

    let bestMatch: { intent: ChatbotIntent; confidence: number } = {
      intent: ChatbotIntent.UNKNOWN,
      confidence: 0
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(prompt)) {
          const confidence = this.calculateConfidence(prompt, pattern);
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent: intent as ChatbotIntent, confidence };
          }
        }
      }
    }

    return of({
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      entities: this.extractEntities(prompt, bestMatch.intent)
    });
  }

  // Health check
  healthCheck(): Observable<{ status: string; timestamp: number }> {
    return this.http.get<{ status: string; timestamp: number }>(`${this.baseUrl}/chatbot/health`).pipe(
      catchError(error => {
        return of({
          status: 'UNHEALTHY',
          timestamp: Date.now()
        });
      })
    );
  }

  // UTILISATION DES SERVICES CRUD EXISTANTS
  
  // Produits
  createProduit(produit: Produit): Observable<Produit> {
    return this.gestionProduitService.createProduit(produit);
  }

  updateProduit(id: string, produit: Produit): Observable<Produit> {
    return this.gestionProduitService.updateProduit(id, produit);
  }

  deleteProduit(id: string): Observable<void> {
    return this.gestionProduitService.deleteProduit(id);
  }

  getProduitById(id: string): Observable<Produit> {
    return this.gestionProduitService.getProduitById(id);
  }

  getAllProduits(): Observable<Produit[]> {
    return this.gestionProduitService.getAllProduits();
  }

  // Garanties
  createGarantie(garantie: Garantie): Observable<Garantie> {
    return this.gestionProduitService.createGarantie(garantie);
  }

  updateGarantie(id: string, garantie: Garantie): Observable<Garantie> {
    return this.gestionProduitService.updateGarantie(id, garantie);
  }

  deleteGarantie(id: string): Observable<void> {
    return this.gestionProduitService.deleteGarantie(id);
  }

  getGarantieById(id: string): Observable<Garantie> {
    return this.gestionProduitService.getGarantieById(id);
  }

  getAllGaranties(): Observable<Garantie[]> {
    return this.gestionProduitService.getAllGaranties();
  }

  // Packs
  createPack(pack: Pack): Observable<Pack> {
    return this.gestionProduitService.createPack(pack);
  }

  updatePack(id: string, pack: Pack): Observable<Pack> {
    return this.gestionProduitService.updatePack(id, pack);
  }

  deletePack(id: string): Observable<void> {
    return this.gestionProduitService.deletePack(id);
  }

  getPackById(id: string): Observable<Pack> {
    return this.gestionProduitService.getPackById(id);
  }

  getAllPacks(): Observable<Pack[]> {
    return this.gestionProduitService.getAllPacks();
  }

  // Configuration des packs
  createPackGarantie(packGarantie: PackGarantie): Observable<PackGarantie> {
    return this.gestionProduitService.ajouterGarantieAuPack(
      packGarantie.packId,
      packGarantie.garantieId,
      packGarantie
    );
  }

  getPackGaranties(packId: string): Observable<PackGarantie[]> {
    return this.gestionProduitService.getGarantiesDuPack(packId);
  }

  // MÉTHODES PRIVÉES DE TRAITEMENT
  
  private calculateConfidence(prompt: string, pattern: RegExp): number {
    const matches = prompt.match(pattern);
    if (!matches) return 0;

    const matchLength = matches[0].length;
    const promptLength = prompt.length;
    return Math.min(matchLength / promptLength * 2, 0.95);
  }

  private extractEntities(prompt: string, intent: ChatbotIntent): any {
    const entities: any = {};

    // Extraire les montants
    const priceMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*€/i);
    if (priceMatch) {
      entities.price = parseFloat(priceMatch[1].replace(',', '.'));
    }

    // Extraire les pourcentages
    const percentMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*%/i);
    if (percentMatch) {
      entities.percentage = parseFloat(percentMatch[1].replace(',', '.'));
    }

    // Extraire les durées
    const durationMatch = prompt.match(/(\d+)\s*(?:mois|ans)/i);
    if (durationMatch) {
      entities.duration = parseInt(durationMatch[1]);
    }

    // Extraire les IDs pour les opérations update/delete
    const idMatch = prompt.match(/id\s*[:\s]+([a-zA-Z0-9-]+)/i);
    if (idMatch) {
      entities.id = idMatch[1];
    }

    // Extraire les noms
    const nameMatch = prompt.match(/nommé?["\s]+([^".,;!?]+)/i);
    if (nameMatch) {
      entities.name = nameMatch[1].trim();
    }

    // Extraire les descriptions
    const descMatch = prompt.match(/description["\s]+([^".,;!?]+)/i);
    if (descMatch) {
      entities.description = descMatch[1].trim();
    }

    return entities;
  }

  private generateResponseMessage(detection: IntentDetection): string {
    const messages = {
      [ChatbotIntent.CREATE_PRODUIT]: "Je vais vous aider à créer un nouveau produit d'assurance.",
      [ChatbotIntent.CREATE_GARANTIE]: "Je vais vous aider à créer une nouvelle garantie.",
      [ChatbotIntent.CREATE_PACK]: "Je vais vous aider à créer un nouveau pack d'assurance.",
      [ChatbotIntent.CONFIGURE_PACK]: "Je vais vous aider à configurer un pack avec des garanties.",
      [ChatbotIntent.CREATE_PACK_WITH_GARANTIES]: "Je vais vous aider à créer un pack complet avec plusieurs garanties.",
      [ChatbotIntent.UPDATE_PRODUIT]: "Je vais vous aider à modifier un produit d'assurance.",
      [ChatbotIntent.UPDATE_GARANTIE]: "Je vais vous aider à modifier une garantie.",
      [ChatbotIntent.UPDATE_PACK]: "Je vais vous aider à modifier un pack d'assurance.",
      [ChatbotIntent.DELETE_PRODUIT]: "Je vais vous aider à supprimer un produit d'assurance.",
      [ChatbotIntent.DELETE_GARANTIE]: "Je vais vous aider à supprimer une garantie.",
      [ChatbotIntent.DELETE_PACK]: "Je vais vous aider à supprimer un pack d'assurance.",
      [ChatbotIntent.LIST_PRODUITS]: "Je vais afficher la liste des produits d'assurance.",
      [ChatbotIntent.LIST_GARANTIES]: "Je vais afficher la liste des garanties.",
      [ChatbotIntent.LIST_PACKS]: "Je vais afficher la liste des packs.",
      [ChatbotIntent.RECOMMENDATION]: "Je vais vous fournir des recommandations personnalisées.",
      [ChatbotIntent.HELP]: "Voici comment je peux vous aider...",
      [ChatbotIntent.UNKNOWN]: "Je n'ai pas compris votre demande."
    };

    return messages[detection.intent] || messages[ChatbotIntent.UNKNOWN];
  }

  // HANDLERS POUR CHAQUE INTENTION
  
  private handleCreateProduit(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    const produit: Produit = {
      idProduit: '',
      nomProduit: detection.entities.name || 'Nouveau Produit',
      description: detection.entities.description || 'Description à compléter',
      typeProduit: TypeProduit.SANTE,
      statut: Statut.ACTIF,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    return this.createProduit(produit).pipe(
      map(createdProduit => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `✅ Produit d'assurance créé avec succès : ${createdProduit.nomProduit}`,
        data: { produit: createdProduit },
        validation: this.validateProduit(produit),
        actions: [
          {
            type: 'CREATE' as const,
            label: 'Voir le produit',
            route: ['/produits', createdProduit.idProduit]
          }
        ],
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la création du produit',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleCreateGarantie(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    const garantie: Garantie = {
      idGarantie: '',
      nomGarantie: detection.entities.name || 'Nouvelle Garantie',
      description: detection.entities.description || 'Description à compléter',
      typeGarantie: TypeGarantie.HOSPITALISATION,
      tauxRemboursement: detection.entities['percentage'] ? detection.entities['percentage'] / 100 : 0.8,
      typeMontant: TypeMontant.FORFAIT,
      typePlafond: TypePlafond.ANNUEL,
      plafondAnnuel: 10000,
      plafondMensuel: 1000,
      plafondParActe: 500,
      franchise: 50,
      coutMoyenParSinistre: 200,
      dureeMinContrat: 12,
      dureeMaxContrat: 60,
      resiliableAnnuellement: true,
      creePar: 'system',
      statut: Statut.ACTIF,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    return this.createGarantie(garantie).pipe(
      map(createdGarantie => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `✅ Garantie créée avec succès : ${createdGarantie.nomGarantie}`,
        data: { garantie: createdGarantie },
        validation: this.validateGarantie(garantie),
        actions: [
          {
            type: 'CREATE' as const,
            label: 'Voir la garantie',
            route: ['/garanties', createdGarantie.idGarantie]
          }
        ],
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la création de la garantie',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleCreatePack(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    const pack: Pack = {
      idPack: '',
      nomPack: detection.entities.name || 'Nouveau Pack',
      description: detection.entities.description || 'Description à compléter',
      produitId: '',
      nomProduit: 'Produit par défaut',
      ageMinimum: 18,
      ageMaximum: 65,
      typeClients: [TypeClient.INDIVIDUEL],
      ancienneteContratMois: 0,
      couvertureGeographique: CouvertureGeographique.NATIONAL,
      prixMensuel: detection.entities.price || 50,
      dureeMinContrat: 12,
      dureeMaxContrat: 60,
      niveauCouverture: NiveauCouverture.BASIC,
      statut: Statut.ACTIF,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    return this.createPack(pack).pipe(
      map(createdPack => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `✅ Pack d'assurance créé avec succès : ${createdPack.nomPack}`,
        data: { pack: createdPack },
        validation: this.validatePack(pack),
        actions: [
          {
            type: 'CREATE' as const,
            label: 'Voir le pack',
            route: ['/packs', createdPack.idPack]
          }
        ],
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la création du pack',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleCreatePackWithGaranties(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    return of({
      success: true,
      intent: detection.intent,
      confidence: detection.confidence,
      message: "Je vais créer un pack complet avec plusieurs garanties.\n\nCette fonctionnalité nécessitera plus de détails pour configurer chaque garantie.",
      data: {
        packWithGaranties: {
          pack: {
            idPack: '',
            nomPack: detection.entities.name || 'Pack Complet',
            description: detection.entities.description || 'Pack avec garanties multiples',
            produitId: '',
            nomProduit: 'Produit par défaut',
            ageMinimum: 18,
            ageMaximum: 65,
            typeClients: [TypeClient.INDIVIDUEL],
            ancienneteContratMois: 0,
            couvertureGeographique: CouvertureGeographique.NATIONAL,
            prixMensuel: detection.entities.price || 100,
            dureeMinContrat: 12,
            dureeMaxContrat: 60,
            niveauCouverture: NiveauCouverture.PREMIUM,
            statut: Statut.ACTIF,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString()
          } as Pack,
          garanties: []
        }
      },
      validation: { valid: true, errors: [], warnings: ['Configuration détaillée requise'] },
      actions: [
        {
          type: 'NAVIGATE' as const,
          label: 'Configurer le pack en détail',
          route: ['/packs/add']
        }
      ],
      timestamp: Date.now()
    });
  }

  private handleUpdateProduit(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    if (!detection.entities.id) {
      return of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ ID du produit requis pour la modification',
        timestamp: Date.now()
      });
    }

    return this.getProduitById(detection.entities.id).pipe(
      switchMap(produit => {
        const updatedProduit = {
          ...produit,
          nomProduit: detection.entities.name || produit.nomProduit,
          description: detection.entities.description || produit.description,
          dateModification: new Date().toISOString()
        };

        return this.updateProduit(detection.entities.id!, updatedProduit).pipe(
          map(result => ({
            success: true,
            intent: detection.intent,
            confidence: detection.confidence,
            message: `✅ Produit modifié avec succès : ${result.nomProduit}`,
            data: { produit: result },
            timestamp: Date.now()
          }))
        );
      }),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la modification du produit',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleUpdateGarantie(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    if (!detection.entities.id) {
      return of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ ID de la garantie requis pour la modification',
        timestamp: Date.now()
      });
    }

    return this.getGarantieById(detection.entities.id).pipe(
      switchMap(garantie => {
        const updatedGarantie = {
          ...garantie,
          nomGarantie: detection.entities.name || garantie.nomGarantie,
          description: detection.entities.description || garantie.description,
          tauxRemboursement: detection.entities['percentage'] ? detection.entities['percentage'] / 100 : garantie.tauxRemboursement,
          dateModification: new Date().toISOString()
        };

        return this.updateGarantie(detection.entities.id!, updatedGarantie).pipe(
          map(result => ({
            success: true,
            intent: detection.intent,
            confidence: detection.confidence,
            message: `✅ Garantie modifiée avec succès : ${result.nomGarantie}`,
            data: { garantie: result },
            timestamp: Date.now()
          }))
        );
      }),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la modification de la garantie',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleUpdatePack(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    if (!detection.entities.id) {
      return of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ ID du pack requis pour la modification',
        timestamp: Date.now()
      });
    }

    return this.getPackById(detection.entities.id).pipe(
      switchMap(pack => {
        const updatedPack = {
          ...pack,
          nomPack: detection.entities.name || pack.nomPack,
          description: detection.entities.description || pack.description,
          prixMensuel: detection.entities.price || pack.prixMensuel,
          dateModification: new Date().toISOString()
        };

        return this.updatePack(detection.entities.id!, updatedPack).pipe(
          map(result => ({
            success: true,
            intent: detection.intent,
            confidence: detection.confidence,
            message: `✅ Pack modifié avec succès : ${result.nomPack}`,
            data: { pack: result },
            timestamp: Date.now()
          }))
        );
      }),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la modification du pack',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleDeleteProduit(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    if (!detection.entities.id) {
      return of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ ID du produit requis pour la suppression',
        timestamp: Date.now()
      });
    }

    return this.deleteProduit(detection.entities.id!).pipe(
      map(() => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `✅ Produit supprimé avec succès (ID: ${detection.entities.id})`,
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la suppression du produit',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleDeleteGarantie(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    if (!detection.entities.id) {
      return of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ ID de la garantie requis pour la suppression',
        timestamp: Date.now()
      });
    }

    return this.deleteGarantie(detection.entities.id!).pipe(
      map(() => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `✅ Garantie supprimée avec succès (ID: ${detection.entities.id})`,
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la suppression de la garantie',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleDeletePack(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    if (!detection.entities.id) {
      return of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ ID du pack requis pour la suppression',
        timestamp: Date.now()
      });
    }

    return this.deletePack(detection.entities.id!).pipe(
      map(() => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `✅ Pack supprimé avec succès (ID: ${detection.entities.id})`,
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la suppression du pack',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleListProduits(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.getAllProduits().pipe(
      map(produits => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `📋 Liste des produits d'assurance (${produits.length} trouvés)`,
        data: { produits },
        actions: [
          {
            type: 'LIST' as const,
            label: 'Voir tous les produits',
            route: ['/produits']
          }
        ],
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la récupération des produits',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleListGaranties(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.getAllGaranties().pipe(
      map(garanties => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `📋 Liste des garanties (${garanties.length} trouvées)`,
        data: { garanties },
        actions: [
          {
            type: 'LIST' as const,
            label: 'Voir toutes les garanties',
            route: ['/garanties']
          }
        ],
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la récupération des garanties',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleListPacks(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.getAllPacks().pipe(
      map(packs => ({
        success: true,
        intent: detection.intent,
        confidence: detection.confidence,
        message: `📋 Liste des packs d'assurance (${packs.length} trouvés)`,
        data: { packs },
        actions: [
          {
            type: 'LIST' as const,
            label: 'Voir tous les packs',
            route: ['/packs']
          }
        ],
        timestamp: Date.now()
      })),
      catchError(error => of({
        success: false,
        intent: detection.intent,
        confidence: detection.confidence,
        message: '❌ Erreur lors de la récupération des packs',
        error: error.error?.message || error.message,
        timestamp: Date.now()
      }))
    );
  }

  private handleRecommendation(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    return of({
      success: true,
      intent: detection.intent,
      confidence: detection.confidence,
      message: "Je vais analyser vos besoins et vous fournir des recommandations personnalisées.",
      data: {
        recommendations: [
          {
            type: 'PACK',
            title: 'Pack Santé Premium',
            description: 'Couverture complète avec garanties étendues',
            price: 89.99,
            features: ['Hospitalisation', 'Médecine générale', 'Spécialistes', 'Médicaments']
          },
          {
            type: 'GARANTIE',
            title: 'Garantie Hospitalisation Plus',
            description: 'Remboursement à 90% des frais hospitaliers',
            coverage: 0.9,
            features: ['Chambre privée', 'Honoraires médicaux', 'Médicaments']
          }
        ]
      },
      timestamp: Date.now()
    });
  }

  private handleHelp(detection: IntentDetection, request: ChatbotRequest): Observable<ChatbotResponse> {
    return of({
      success: true,
      intent: detection.intent,
      confidence: detection.confidence,
      message: `Assistant IA Assurance

Je suis votre assistant intelligent pour gérer produits, garanties, packs et configurations d'assurance.

Fonctionnalités disponibles :
✅ Création de produits, garanties, packs
✅ Modification des entités existantes
✅ Suppression d'entités
✅ Listing des données
✅ Configuration des packs
✅ Recommandations intelligentes

Comment m'utiliser :
- Soyez précis dans votre demande
- Mentionnez les caractéristiques souhaitées (prix, couverture, durée)
- Pour les modifications/suppressions, précisez l'ID

Exemples :
- "Crée une garantie hospitalisation avec 90% de remboursement"
- "Je veux un pack santé à 50€ par mois"
- "Modifie le produit id: abc123 nommé 'Nouveau nom'"
- "Supprime la garantie id: xyz789"
- "Liste tous les produits"
- "Recommande-moi le meilleur produit pour une famille"

Comment puis-je vous aider aujourd'hui ?`,
      timestamp: Date.now()
    });
  }

  // MÉTHODES DE VALIDATION
  private validateProduit(produit: Produit): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!produit.nomProduit || produit.nomProduit.trim() === '') {
      errors.push('Le nom du produit est requis');
    }
    if (!produit.typeProduit) {
      errors.push('Le type de produit est requis');
    }
    if (!produit.description) {
      warnings.push('La description est recommandée');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateGarantie(garantie: Garantie): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!garantie.nomGarantie || garantie.nomGarantie.trim() === '') {
      errors.push('Le nom de la garantie est requis');
    }
    if (!garantie.typeGarantie) {
      errors.push('Le type de garantie est requis');
    }
    if (garantie.tauxRemboursement < 0 || garantie.tauxRemboursement > 1) {
      errors.push('Le taux de remboursement doit être entre 0 et 1');
    }
    if (!garantie.description) {
      warnings.push('La description est recommandée');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validatePack(pack: Pack): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!pack.nomPack || pack.nomPack.trim() === '') {
      errors.push('Le nom du pack est requis');
    }
    if (pack.prixMensuel <= 0) {
      errors.push('Le prix mensuel doit être positif');
    }
    if (!pack.description) {
      warnings.push('La description est recommandée');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
