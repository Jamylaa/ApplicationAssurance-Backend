import { TypeProduit, TypeGarantie, Statut } from '../../models/entities.model';

 // Utilitaire pour mapper les valeurs d'énumération incohérentes entre le frontend et le backend
 
export class EnumMapperUtil {
  
  // Mapping pour TypeProduit
  private static readonly TYPE_PRODUIT_MAPPING: { [key: string]: TypeProduit } = {
   // 'SANTE': TypeProduit.SANTE,      // Backend 'Sante' -> Frontend 'SANTE'
    'SANTE': TypeProduit.SANTE,     // Valeur standard
    'HABITATION': TypeProduit.HABITATION,
    'AUTO': TypeProduit.AUTO,
    'EPARGNE': TypeProduit.EPARGNE,
    'VIE': TypeProduit.VIE
  };

  // Mapping pour TypeGarantie
  private static readonly TYPE_GARANTIE_MAPPING: { [key: string]: TypeGarantie } = {
    'HOSPITALISATION': TypeGarantie.HOSPITALISATION,
    'DENTAIRE': TypeGarantie.DENTAIRE,
    'OPTIQUE': TypeGarantie.OPTIQUE,
    'CONSULTATION': TypeGarantie.CONSULTATION
  };

  // Mapping pour Statut
  private static readonly STATUT_MAPPING: { [key: string]: Statut } = {
    'ACTIF': Statut.ACTIF,
    'INACTIF': Statut.INACTIF,
    'EN_ATTENTE': Statut.EN_ATTENTE,
    'SUSPENDU': Statut.SUSPENDU,
    'RESILIE': Statut.RESILIE,
    'EXPIRE': Statut.EXPIRE
  };

  
   //Mappe une valeur de TypeProduit du backend vers le frontend
   
  static mapTypeProduit(value: any): TypeProduit {
    if (!value) return TypeProduit.SANTE; // Valeur par défaut
    
    const stringValue = String(value).trim();
    return this.TYPE_PRODUIT_MAPPING[stringValue] || TypeProduit.SANTE;
  }


   // Mappe une valeur de TypeGarantie du backend vers le frontend
   
  static mapTypeGarantie(value: any): TypeGarantie {
    if (!value) return TypeGarantie.HOSPITALISATION; // Valeur par défaut
    
    const stringValue = String(value).trim();
    return this.TYPE_GARANTIE_MAPPING[stringValue] || TypeGarantie.HOSPITALISATION;
  }

  /**
   * Mappe une valeur de Statut du backend vers le frontend
   */
  static mapStatut(value: any): Statut {
    if (!value) return Statut.ACTIF; // Valeur par défaut
    
    const stringValue = String(value).trim();
    return this.STATUT_MAPPING[stringValue] || Statut.ACTIF;
  }

  /**
   * Nettoie et mappe un objet produit complet
   */
  static mapProduit(produit: any): any {
    if (!produit) return produit;
    
    return {
      ...produit,
      typeProduit: this.mapTypeProduit(produit.typeProduit),
      statut: this.mapStatut(produit.statut)
    };
  }

  /**
   * Nettoie et mappe un objet garantie complet
   */
  static mapGarantie(garantie: any): any {
    if (!garantie) return garantie;
    
    return {
      ...garantie,
      typeGarantie: this.mapTypeGarantie(garantie.typeGarantie),
      statut: this.mapStatut(garantie.statut)
    };
  }

  /**
   * Nettoie et mappe un tableau d'objets
   */
  static mapArray<T>(items: any[], mapper: (item: any) => T): T[] {
    if (!Array.isArray(items)) return items;
    return items.map(item => mapper(item));
  }

  /**
   * Mappe une réponse API complète
   */
  static mapApiResponse(response: any): any {
    if (!response) return response;
    
    // Si c'est un tableau
    if (Array.isArray(response)) {
      return this.mapArray(response, (item) => this.mapProduit(item));
    }
    
    // Si c'est un objet avec des propriétés spécifiques
    if (response.content && Array.isArray(response.content)) {
      return {
        ...response,
        content: this.mapArray(response.content, (item) => this.mapProduit(item))
      };
    }
    
    // Si c'est un seul objet
    if (response.idProduit || response.nomProduit) {
      return this.mapProduit(response);
    }
    
    if (response.idGarantie || response.nomGarantie) {
      return this.mapGarantie(response);
    }
    
    return response;
  }
}
