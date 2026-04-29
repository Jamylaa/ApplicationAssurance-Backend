export enum TypeGarantie {
  HOSPITALISATION = 'HOSPITALISATION',
  DENTAIRE = 'DENTAIRE',
  OPTIQUE = 'OPTIQUE',
  CONSULTATION = 'CONSULTATION'

}

export const TYPE_GARANTIE_VALUES = Object.values(TypeGarantie) as TypeGarantie[];


export enum NiveauCouverture {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  GOLD = 'GOLD'
}

export const NIVEAU_COUVERTURE_VALUES = Object.values(NiveauCouverture) as NiveauCouverture[];


// Note: Les rôles ont été simplifiés dans le backend
// Plus d'énumération Role nécessaire pour le PFE simplifié

// TypeClient moved to entities.model.ts to match backend TypeClient enum
