// Enums correspondant aux entités Java
export enum TypeProduit {
  SANTE = 'SANTE',
  HABITATION = 'HABITATION',
  AUTO = 'AUTO',
  EPARGNE = 'EPARGNE',
  VIE = 'VIE'
}

export enum TypeClient {
  INDIVIDUEL = 'INDIVIDUEL',
  FAMILLE = 'FAMILLE',
  ENFANT = 'ENFANT',
  SENIOR = 'SENIOR',
  ENTREPRISE = 'ENTREPRISE',
  ETUDIANT = 'ETUDIANT'
}

export enum NiveauCouverture {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  GOLD = 'GOLD'
}

export enum TypeGarantie {
  HOSPITALISATION = 'HOSPITALISATION',
  DENTAIRE = 'DENTAIRE',
  OPTIQUE = 'OPTIQUE',
  CONSULTATION = 'CONSULTATION'}

// Constantes pour les valeurs des enums - compatibilité avec les composants
export const BASE_CALCUL_VALUES = ['FORFAIT_FIXE', 'FRAIS_REELS', 'POURCENTAGE_PLAFOND', 'TARIF_CONVENTIONNE','BASE_REMBOURSEMENT_SECU'];

export enum Statut {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  EN_ATTENTE = 'EN_ATTENTE',
  SUSPENDU = 'SUSPENDU',
  RESILIE = 'RESILIE',
  EXPIRE = 'EXPIRE'
}

export enum TypeMontant {
  FORFAIT = 'FORFAIT',
  FRAIS_REELS = 'FRAIS_REELS',
  TARIF_CONVENTIONNE = 'TARIF_CONVENTIONNE'
}

export enum TypePlafond {
  PAR_ACTE = 'PAR_ACTE',
  ANNUEL = 'ANNUEL',
  MENSUEL = 'MENSUEL',
  PAR_SOINS = 'PAR_SOINS',
  GLOBAL = 'GLOBAL'
}

export enum CouvertureGeographique {
  LOCAL = 'LOCAL',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
  UE = 'UE',
  MAGHREB = 'MAGHREB'
}


// Entité Produit - Alignée exactement avec le backend Java
export interface Produit {
  idProduit: string;
  nomProduit: string;
  description: string;
  typeProduit: TypeProduit;
  statut: Statut;
  dateCreation: string;
  dateModification: string;
  
  // Additional properties for frontend business logic
  ageMin?: number;
  ageMax?: number;
  maladieChroniqueAutorisee?: boolean;
  diabetiqueAutorise?: boolean;
  actif?: boolean;
  prixBase?: number;
  packs?: Pack[];
}

// Entité Pack - Alignée exactement avec le backend Java
export interface Pack {
  idPack: string;
  nomPack: string;
  description: string;
  produitId: string;
  nomProduit: string; 
  ageMinimum: number;
  ageMaximum: number;
  typeClients: TypeClient[];
  ancienneteContratMois: number;
  couvertureGeographique: CouvertureGeographique;
  prixMensuel: number;
  dureeMinContrat: number;
  dureeMaxContrat: number;
  niveauCouverture: NiveauCouverture;
  statut: Statut;
  dateCreation: string;
  dateModification: string;
}

// Entité Garantie - Alignée exactement avec le backend Java
export interface Garantie {
  idGarantie: string;
  nomGarantie: string;
  description: string;
  statut: Statut;
  typeGarantie: TypeGarantie;
  tauxRemboursement: number;
  typeMontant: TypeMontant;
  typePlafond: TypePlafond;
  plafondAnnuel: number;
  plafondMensuel: number;
  plafondParActe: number;
  franchise: number;
  coutMoyenParSinistre: number;
  dureeMinContrat: number;
  dureeMaxContrat: number;
  resiliableAnnuellement: boolean;
  creePar: string;
  dateCreation: string;
  dateModification: string;
  dateDesactivation?: string;
}

// Entité associée PackGarantie - Basée sur le backend Java (alignée avec gestionProduit backend)
export interface PackGarantie {
  idPackGarantie: string;
  packId: string;
  garantieId: string;
  nomGarantie: string;
  tauxRemboursement: number;
  plafond: number;
  franchise: number;
  typeMontant: TypeMontant;
  delaiCarence: number; // en jours/mois
  priorite: number;
  actif: boolean;
  dateActivation: string;
  dateDesactivation?: string;
  optionnelle: boolean;
  supplementPrix: number;
  
  // Champs optionnels pour composition frontend
  // garantie?: Garantie;
  // conditionsSpeciales?: string[];
  // tauxCouvertureSpecifique?: number;
  
  // Champs legacy pour compatibilité
  // idPack?: string;
  // idGarantie?: string;
  // plafondAnnuel?: number;
  // plafondParActe?: number;
  // plafondSpecifique?: number;
  // dateCreation?: string;
  // dateModification?: string;
  // estOptionnelle?: boolean;
  // prixAdditionnel?: number;
  // conditionsSpecifiques?: string[];
}

// export interface Couverture {
//   idCouverture: string;
//   nom: string;
//   description: string;
//   tauxCouverture: number;
//   plafond: number;
//   franchise: number;
//   conditions?: string[];
// }

// export interface PlafondLimite {
//   idPlafond: string;
//   type: string;
//   valeur: number;
//   periode: string;
//   unite: string;
// }

export interface ConditionEligibilite {
  idCondition: string;
  ageMinimum?: number;
  ageMaximum?: number;
  typeClient?: TypeClient;
  ancienneteContratMois?: number;
  exclusionMaladiesChroniques?: boolean;
  conditionsMedicales: string[];
  exclusions: string[];
  documentsRequis: string[];
}

export interface EligibiliteResultat {
  eligible: boolean;
  erreurs: string[];
}

// export interface EligibiliteValidationRequest {
//   produitId: string;
//   packId?: string;
//   garantieIds?: string[];
//   clientId?: string;
// }

// export interface RegleCalculGarantie {
//   idRegle: string;
//   formuleRemboursement?: string;
//   baseCalcul?: string;
//   cumulAutresGarantiesAutorise?: boolean;
//   prioriteGarantie?: number;
//   descriptionRegle?: string;
//   typeCalcul: string;
//   formule: string;
//   parametres: Record<string, any>;
 // }

// export interface Exclusion {
//   idExclusion: string;
//   description: string;
//   type: string;
//   conditions: string[];
// }

// Interface pour les exclusions structurées
// export interface ExclusionsStructure {
//   maladiesExclues: string[];
//   actesNonRemboursables: string[];
//   depassementsNonPrisEnCharge: string[];
//   soinsEtrangerExclus: string[];
//   autresExclusions: string[];
// }

// Interfaces pour les requêtes et réponses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Interfaces pour les filtres
export interface ProduitFilter {
  typeProduit?: TypeProduit;
  actif?: boolean;
  categorie?: string;
  prixMin?: number;
  prixMax?: number;
  ageMin?: number;
  ageMax?: number;
  maladieChroniqueAutorisee?: boolean;
  diabetiqueAutorisee?: boolean;
  searchTerm?: string;
}

export interface ProduitForm {
  nomProduit: string;
  description: string;
  typeProduit: TypeProduit | string;
  categorie?: string;
  ageMin?: number;
  ageMax?: number;
  maladieChroniqueAutorisee?: boolean;
  diabetiqueAutorisee?: boolean;
  diabetiqueAutorise?: boolean;
  actif?: boolean;
  prixBase?: number;
  garanties?: Garantie[];
}

export interface ProduitStatistics {
  produitId: string;
  nombrePacks: number;
  nombrePacksActifs: number;
  nombreGaranties: number;
  nombreSouscriptions: number;
  prixMoyenPacks: number;
  niveauPopularite: number;
  chiffreAffairesMensuel?: number;
  chiffreAffairesAnnuel?: number;
}

export interface PackFilter {
  produitId?: string;
  niveauCouverture?: NiveauCouverture;
  actif?: boolean;
  prixMin?: number;
  prixMax?: number;
  dureeMin?: number;
  dureeMax?: number;
  searchTerm?: string;
}

export interface GarantieFilter {
  typeGarantie?: TypeGarantie;
  statut?: Statut;
  searchTerm?: string;
}

// Fonctions utilitaires
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND'
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-TN');
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('fr-TN');
}

export function getProduitTypeLabel(type: TypeProduit): string {
  const labels: Record<TypeProduit, string> = {
    [TypeProduit.SANTE]: 'Santé',
    [TypeProduit.AUTO]: 'Auto',
    [TypeProduit.HABITATION]: 'Habitation',
    [TypeProduit.EPARGNE]: 'Épargne',
    [TypeProduit.VIE]: 'Vie'
  };
  return labels[type] || type;
}

// export function getNiveauCouvertureLabel(niveau: NiveauCouverture): string {
//   const labels: Record<NiveauCouverture, string> = {
//     [NiveauCouverture.ECONOMIQUE]: 'Économique',
//     [NiveauCouverture.STANDARD]: 'Standard',
//     [NiveauCouverture.PREMIUM]: 'Premium',
//     [NiveauCouverture.LUXE]: 'Luxe'
//   };
//   return labels[niveau] || niveau;
// }

export function getStatutLabel(statut: Statut): string {
  const labels: Record<Statut, string> = {
    [Statut.ACTIF]: 'Actif',
    [Statut.INACTIF]: 'Inactif',
    [Statut.EN_ATTENTE]: 'En attente',
    [Statut.SUSPENDU]: 'Suspendu',
    [Statut.RESILIE]: 'Résilié',
    [Statut.EXPIRE]: 'Expiré'
  };
  return labels[statut] || statut;
}

// export function getTypeActeMedicalLabel(type: TypeActeMedical): string {
//   const labels: Record<TypeActeMedical, string> = {
//     [TypeActeMedical.CONSULTATION]: 'Consultation',
//     [TypeActeMedical.HOSPITALISATION]: 'Hospitalisation',
//     [TypeActeMedical.MEDICAMENT]: 'Médicament',
//     [TypeActeMedical.EXAMEN]: 'Examen',
//     [TypeActeMedical.SOINS_DENTAIRES]: 'Soins dentaires',
//     [TypeActeMedical.OPTIQUE]: 'Optique',
//     [TypeActeMedical.MATERNITE]: 'Maternité',
//     [TypeActeMedical.PREVENTION]: 'Prévention'
//   };
//   return labels[type] || type;
// }

// export function getStatusColor(statut: StatutGarantie): string {
//   const colors: Record<StatutGarantie, string> = {
//     [StatutGarantie.EN_ATTENTE]: 'warning',
//     [StatutGarantie.ACTIVE]: 'success',
//     [StatutGarantie.SUSPENDUE]: 'warning',
//     [StatutGarantie.RESILIEE]: 'danger',
//     [StatutGarantie.EXPIREE]: 'secondary'
//   };
//   return colors[statut] || 'info';
// }

// export function getNiveauCouvertureColor(niveau: NiveauCouverture): string {
//   const colors: Record<NiveauCouverture, string> = {
//     [NiveauCouverture.ECONOMIQUE]: 'secondary',
//     [NiveauCouverture.STANDARD]: 'info',
//     [NiveauCouverture.PREMIUM]: 'warning',
//     [NiveauCouverture.LUXE]: 'success'
//   };
//   return colors[niveau] || 'info';
// }

export function isEligibleForPack(pack: Pack, age: number, hasMaladieChronique: boolean, isDiabetique: boolean): boolean {
  if ((pack.ageMinimum && age < pack.ageMinimum) || (pack.ageMaximum && age > pack.ageMaximum)) {
    return false;
  }
  
  // Note: maladieChroniqueAutorisee and diabetiqueAutorisee removed from backend
  // These checks should be moved to business logic layer if needed
  
  return true;
}

export function calculatePackPrice(pack: Pack, options: { garantiesOptionnelles: string[] } = { garantiesOptionnelles: [] }): number {
  // Simplified pricing based on base pack price
  // Note: garanties field removed from backend, pricing logic should be updated
  return pack.prixMensuel;
}

export function getGarantiesIncluses(pack: Pack): PackGarantie[] {
  // Note: garanties field removed from backend
  // This function should be updated to fetch from PackGarantie service
  return [];
}

export function getGarantiesOptionnelles(pack: Pack): PackGarantie[] {
  // Note: garanties field removed from backend
  // This function should be updated to fetch from PackGarantie service
  return [];
}

export function validateProduit(produit: Partial<Produit>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!produit.nomProduit || produit.nomProduit.trim().length === 0) {
    errors.push('Le nom du produit est obligatoire');
  }
  
  if (!produit.description || produit.description.trim().length === 0) {
    errors.push('La description est obligatoire');
  }
  
  if (!produit.typeProduit) {
    errors.push('Le type de produit est obligatoire');
  }
  
  // Note: ageMin and ageMax removed from backend
  // Age validation should be moved to Pack level if needed
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePack(pack: Partial<Pack>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!pack.nomPack || pack.nomPack.trim().length === 0) {
    errors.push('Le nom du pack est obligatoire');
  }
  
  if (!pack.description || pack.description.trim().length === 0) {
    errors.push('La description est obligatoire');
  }
  
  if (!pack.produitId || pack.produitId.trim().length === 0) {
    errors.push('L\'identifiant du produit est obligatoire');
  }
  
  if (pack.prixMensuel !== undefined && pack.prixMensuel < 0) {
    errors.push('Le prix mensuel ne peut pas être négatif');
  }
  
  if (pack.dureeMinContrat !== undefined && pack.dureeMinContrat < 1) {
    errors.push('La durée minimale doit être d\'au moins 1 mois');
  }
  
  if (pack.dureeMaxContrat !== undefined && pack.dureeMaxContrat < 1) {
    errors.push('La durée maximale doit être d\'au moins 1 mois');
  }
  
  if (pack.dureeMinContrat !== undefined && pack.dureeMaxContrat !== undefined && 
      pack.dureeMinContrat > pack.dureeMaxContrat) {
    errors.push('La durée minimale doit être inférieure à la durée maximale');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateGarantie(garantie: Partial<Garantie>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!garantie.nomGarantie || garantie.nomGarantie.trim().length === 0) {
    errors.push('Le nom de la garantie est obligatoire');
  }
  
  if (!garantie.description || garantie.description.trim().length === 0) {
    errors.push('La description est obligatoire');
  }
  
  if (!garantie.typeGarantie) {
    errors.push('Le type de garantie est obligatoire');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
