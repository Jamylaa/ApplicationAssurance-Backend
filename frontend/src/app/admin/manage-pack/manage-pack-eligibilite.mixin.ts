import { MessageService } from 'primeng/api';
import { EligibiliteService } from '../../../core/services/eligibilite.service';
import { Pack, Produit, NiveauCouverture } from '../../models/entities.model';

/**
 * Mixin pour ajouter les fonctionnalités d'éligibilité au composant ManagePack
 */
export function ManagePackEligibiliteMixin<T extends Constructor>(base: T) {
  return class extends base {
    protected eligibiliteService!: EligibiliteService;
    protected messageService!: MessageService;
    protected produits!: Produit[];
    protected packForm: any;
    protected currentId: string | null = null;

    // Méthodes de validation d'éligibilité
    validerEligibilitePack(): void {
      const produitId = this.packForm.get('produitId')?.value;
      if (!produitId) {
        return;
      }

      const produit = this.produits.find(p => p.idProduit === produitId);
      if (!produit) {
        return;
      }

      const packData = this.packForm.getRawValue();
      const pack: Pack = {
        ...packData,
        idPack: this.currentId || undefined,
        ancienneteContratMois: 0,
        dureeMinContrat: 12,
        dureeMaxContrat: 12,
        niveauCouverture: NiveauCouverture.PREMIUM,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        garanties: []
      };

      this.eligibiliteService.validerEligibilitePack(produit, pack).subscribe({
        next: (result: any) => {
          if (result.length === 1 && result[0].includes('compatibles')) {
            this.messageService.add({
              severity: 'success',
              summary: 'Validation réussie',
              detail: 'Les conditions d\'éligibilité sont compatibles'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur d\'éligibilité',
              detail: this.eligibiliteService.getErrorMessageIncompatibilite('pack', result)
            });
          }
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur de validation',
            detail: 'Impossible de valider les conditions d\'éligibilité'
          });
        }
      });
    }

    heriterConditionsProduit(): void {
      const produitId = this.packForm.get('produitId')?.value;
      if (!produitId) {
        return;
      }

      const produit = this.produits.find(p => p.idProduit === produitId);
      if (!produit?.conditionsEligibilite) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Information',
          detail: 'Le produit n\'a pas de conditions d\'éligibilité définies'
        });
        return;
      }

      this.eligibiliteService.creerConditionsPack(produit.conditionsEligibilite).subscribe({
        next: (conditions: any) => {
          // Mettre à jour le formulaire avec les conditions héritées
          this.packForm.patchValue({
            conditionsEligibilite: conditions
          });
          
          this.messageService.add({
            severity: 'success',
            summary: 'Héritage réussi',
            detail: 'Les conditions d\'éligibilité ont été héritées du produit'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible d\'hériter des conditions du produit'
          });
        }
      });
    }

    verifierEligibiliteAvantSoumission(): boolean {
      const produitId = this.packForm.get('produitId')?.value;
      if (!produitId) {
        return false;
      }

      const produit = this.produits.find(p => p.idProduit === produitId);
      if (!produit) {
        return false;
      }

      const packData = this.packForm.getRawValue();
      const pack: Pack = {
        ...packData,
        idPack: this.currentId || undefined,
        ancienneteContratMois: 0,
        dureeMinContrat: 12,
        dureeMaxContrat: 12,
        niveauCouverture: NiveauCouverture.PREMIUM,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        garanties: []
      };

      // Validation locale rapide
      if (pack.conditionsEligibilite && produit.conditionsEligibilite) {
        if (!this.eligibiliteService.isConditionsCompatible(produit.conditionsEligibilite, pack.conditionsEligibilite)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur d\'éligibilité',
            detail: 'Les conditions d\'éligibilité du pack ne sont pas compatibles avec celles du produit. Veuillez les corriger avant de soumettre.'
          });
          return false;
        }
      }

      return true;
    }

    // Surcharge la méthode onSubmit pour inclure la validation d'éligibilité
    onSubmitWithEligibilite(): void {
      if (!this.verifierEligibiliteAvantSoumission()) {
        return;
      }
      
      // Appeler la méthode onSubmit originale si elle existe
      if (typeof this.onSubmit === 'function') {
        this.onSubmit();
      }
    }
  };
}

// Type pour le constructeur
type Constructor = new (...args: any[]) => {};
