import { Produit } from './entities.model';

export interface Subscription {
  idSubscription: string;
  idContrat: string;
  packId: string;
  produitId: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  montantMensuel: number;
  modePaiement: string;
  dateCreation: string;
  dateModification: string;
  dureeMois?: number;
  produit?: Produit;
  // Properties for admin management
  adminId?: string;
  primePersonnalisee?: number;
  optionsSupplementaires?: string;
  packNom?: string;
  montant?: number;
}


export interface ProduitDetails {
  id: string;
  idProduit: string;
  nom: string;
  description: string;
  type: string;
  typeProduit: string;
  prix: number;
  prixBase: number;
  duree: number;
  statut: string;
}
