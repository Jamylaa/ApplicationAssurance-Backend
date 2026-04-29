import { ApiResponse, PaginatedResponse } from './entities.model';

export interface SouscriptionRequest {
  clientId: string;
  packId: string;
  dateDebut: Date;
  dureeContrat: number;
  options?: any[];
}

export interface Contrat {
  idContrat: string;
  clientId: string;
  packId: string;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  montantMensuel: number;
  options?: any[];
  dateCreation: Date;
  dateModification: Date;
}

export interface Souscription {
  idSouscription: string;
  clientId: string;
  nomClient: string;
  packId: string;
  nomPack: string;
  produitId: string;
  nomProduit: string;
  dateDebut: string;
  dateFin: string;
  dateSignature?: string;
  statut: StatutSouscription;
  statutPaiement: StatutPaiement;
  primeMensuelle?: number;
  primeAnnuelle?: number;
  modePaiement: ModePaiement;
  frequencePaiement: FrequencePaiement;
  dateProchainPaiement?: string;
  beneficiaires?: Beneficiaire[];
  garantiesPersonnalisees?: GarantiePersonnalisee[];
  conditionsSpeciales?: string[];
  exclusionsSpeciales?: string[];
  franchise?: number;
  plafondAnnuel?: number;
  delaiCarence?: number;
  numeroPolice?: string;
  numeroContrat?: string;
  courtierId?: string;
  nomCourtier?: string;
  agentId?: string;
  nomAgent?: string;
  notes?: string;
  documents?: DocumentSouscription[];
  montantTotalCotisation?: number;
  dureeContratMois?: number;
  enCours?: boolean;
  dateCreation: string;
  dateModification: string;
  dateResiliation?: string;
  motifResiliation?: string;
}

export interface SouscriptionCreate {
  clientId: string;
  packId: string;
  dateDebut: string;
  dateFin: string;
  dateSignature?: string;
  modePaiement: ModePaiement;
  frequencePaiement: FrequencePaiement;
  beneficiaires?: BeneficiaireCreate[];
  garantiesPersonnalisees?: GarantiePersonnaliseeCreate[];
  conditionsSpeciales?: string[];
  exclusionsSpeciales?: string[];
  franchise?: number;
  plafondAnnuel?: number;
  delaiCarence?: number;
  courtierId?: string;
  agentId?: string;
  notes?: string;
  documents?: DocumentSouscriptionCreate[];
}

export interface SouscriptionUpdate {
  dateFin?: string;
  statut?: StatutSouscription;
  statutPaiement?: StatutPaiement;
  modePaiement?: ModePaiement;
  frequencePaiement?: FrequencePaiement;
  dateProchainPaiement?: string;
  beneficiaires?: BeneficiaireCreate[];
  garantiesPersonnalisees?: GarantiePersonnaliseeCreate[];
  conditionsSpeciales?: string[];
  exclusionsSpeciales?: string[];
  franchise?: number;
  plafondAnnuel?: number;
  delaiCarence?: number;
  courtierId?: string;
  agentId?: string;
  notes?: string;
  documents?: DocumentSouscriptionCreate[];
  documentsASupprimer?: string[];
  motifResiliation?: string;
}

export interface SouscriptionFilter {
  searchTerm?: string;
  clientId?: string;
  nomClient?: string;
  packId?: string;
  nomPack?: string;
  produitId?: string;
  nomProduit?: string;
  statut?: StatutSouscription;
  statutPaiement?: StatutPaiement;
  modePaiement?: ModePaiement;
  frequencePaiement?: FrequencePaiement;
  courtierId?: string;
  agentId?: string;
  dateDebutMin?: string;
  dateDebutMax?: string;
  dateFinMin?: string;
  dateFinMax?: string;
  primeMensuelleMin?: number;
  primeMensuelleMax?: number;
  primeAnnuelleMin?: number;
  primeAnnuelleMax?: number;
  dateCreationMin?: string;
  dateCreationMax?: string;
  enCours?: boolean;
  expirees?: boolean;
  resiliees?: boolean;
  produitIds?: string[];
  packIds?: string[];
  clientIds?: string[];
  nombreBeneficiairesMin?: number;
  nombreBeneficiairesMax?: number;
  avecDocuments?: boolean;
  avecGarantiesPersonnalisees?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

export interface Beneficiaire {
  idBeneficiaire?: string;
  nom?: string;
  prenom?: string;
  cin?: string;
  dateNaissance?: string;
  lienParente?: string;
  beneficiairePrincipal?: boolean;
}

export interface BeneficiaireCreate {
  nom?: string;
  prenom?: string;
  cin?: string;
  dateNaissance?: string;
  lienParente?: string;
  beneficiairePrincipal?: boolean;
}

export interface GarantiePersonnalisee {
  garantieId: string;
  nomGarantie?: string;
  plafondSpecifique?: number;
  tauxCouvertureSpecifique?: number;
  incluse?: boolean;
  optionnelle?: boolean;
  prixAdditionnel?: number;
}

export interface GarantiePersonnaliseeCreate {
  garantieId: string;
  nomGarantie?: string;
  plafondSpecifique?: number;
  tauxCouvertureSpecifique?: number;
  incluse?: boolean;
  optionnelle?: boolean;
  prixAdditionnel?: number;
}

export interface DocumentSouscription {
  idDocument?: string;
  typeDocument?: string;
  nomFichier?: string;
  urlFichier?: string;
  dateUpload?: string;
  statut?: string;
}

export interface DocumentSouscriptionCreate {
  typeDocument?: string;
  nomFichier?: string;
  urlFichier?: string;
  dateUpload?: string;
  statut?: string;
}

export enum StatutSouscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACTIVE = 'ACTIVE',
  SUSPENDUE = 'SUSPENDUE',
  RESILIEE = 'RESILIEE',
  EXPIREE = 'EXPIREE',
  ANNULEE = 'ANNULEE'
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  A_JOUR = 'A_JOUR',
  EN_RETARD = 'EN_RETARD',
  IMPAYE = 'IMPAYE',
  BLOQUE = 'BLOQUE'
}

export enum ModePaiement {
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  SEMESTRIEL = 'SEMESTRIEL',
  ANNUEL = 'ANNUEL'
}

export enum FrequencePaiement {
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  SEMESTRIEL = 'SEMESTRIEL',
  ANNUEL = 'ANNUEL'
}

export interface SouscriptionStatistics {
  totalSouscriptions: number;
  souscriptionsActives: number;
  souscriptionsEnAttente: number;
  souscriptionsSuspendues: number;
  souscriptionsResiliees: number;
  chiffreAffairesMensuel: number;
  chiffreAffairesAnnuel: number;
}

export interface EligibiliteResult {
  eligible: boolean;
  motifs: string[];
  conditions: string[];
}

export interface SouscriptionResponse extends ApiResponse<Souscription> {}
export interface SouscriptionListResponse extends ApiResponse<Souscription[]> {}
export interface SouscriptionPaginatedResponse extends ApiResponse<PaginatedResponse<Souscription>> {}
export interface SouscriptionStatisticsResponse extends ApiResponse<SouscriptionStatistics> {}
export interface EligibiliteResponse extends ApiResponse<EligibiliteResult> {}

export function getSouscriptionDisplayName(souscription: Souscription): string {
  return `${souscription.numeroPolice || souscription.idSouscription} - ${souscription.nomClient}`;
}

export function getSouscriptionStatusColor(statut: StatutSouscription): string {
  switch (statut) {
    case StatutSouscription.ACTIVE:
      return 'success';
    case StatutSouscription.EN_ATTENTE:
      return 'warning';
    case StatutSouscription.SUSPENDUE:
      return 'orange';
    case StatutSouscription.RESILIEE:
      return 'danger';
    case StatutSouscription.EXPIREE:
      return 'info';
    case StatutSouscription.ANNULEE:
      return 'secondary';
    default:
      return 'gray';
  }
}
