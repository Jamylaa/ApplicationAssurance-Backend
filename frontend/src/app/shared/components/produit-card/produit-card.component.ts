import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';

import { Produit, TypeProduit, NiveauCouverture } from '../../models/produit-refactored.model';
import { getStatutColor, getNiveauCouvertureColor, formatCurrency } from '../../models/produit-refactored.model';

@Component({
  selector: 'app-produit-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    RippleModule,
    RouterModule
  ],
  templateUrl: './produit-card.component.html',
  styleUrls: ['./produit-card.component.scss']
})
export class ProduitCardComponent implements OnChanges {

  @Input() produit!: Produit;
  @Input() showActions: boolean = true;
  @Input() compact: boolean = false;
  @Input() ageClient?: number;
  @Input() accepteMaladieChronique?: boolean;
  @Input() estDiabetique?: boolean;

  @Output() edit = new EventEmitter<Produit>();
  @Output() delete = new EventEmitter<Produit>();
  @Output() toggle = new EventEmitter<Produit>();
  @Output() select = new EventEmitter<Produit>();

  isEligible: boolean = false;
  eligibilityReasons: string[] = [];
  typeProduitLabel: string = '';
  niveauPopulariteColor: string = 'secondary';
  prixMoyen: number = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['produit'] || changes['ageClient'] || changes['accepteMaladieChronique'] || changes['estDiabetique']) {
      this.calculateEligibility();
      this.calculatePrixMoyen();
      this.setTypeProduitLabel();
      this.setNiveauPopulariteColor();
    }
  }

  private calculateEligibility(): void {
    if (this.ageClient === undefined) {
      this.isEligible = true;
      this.eligibilityReasons = [];
      return;
    }

    this.eligibilityReasons = [];

    // Vérification de l'âge
    if (this.ageClient < this.produit.ageMin) {
      this.isEligible = false;
      this.eligibilityReasons.push(`Âge minimum requis: ${this.produit.ageMin} ans`);
    } else if (this.ageClient > this.produit.ageMax) {
      this.isEligible = false;
      this.eligibilityReasons.push(`Âge maximum autorisé: ${this.produit.ageMax} ans`);
    } else {
      this.isEligible = true;
    }

    // Vérification des conditions médicales
    if (this.accepteMaladieChronique && !this.produit.maladieChroniqueAutorisee) {
      this.isEligible = false;
      this.eligibilityReasons.push('Maladies chroniques non couvertes');
    }

    if (this.estDiabetique && !this.produit.diabetiqueAutorise) {
      this.isEligible = false;
      this.eligibilityReasons.push('Diabète non couvert');
    }
  }

  private calculatePrixMoyen(): void {
    if (this.produit.packs && this.produit.packs.length > 0) {
      const prixTotal = this.produit.packs
        .filter(pack => pack.actif)
        .reduce((sum, pack) => sum + pack.prixMensuel, 0);
      const packsActifs = this.produit.packs.filter(pack => pack.actif).length;
      this.prixMoyen = prixTotal / packsActifs;
    } else {
      this.prixMoyen = this.produit.prixBase || 0;
    }
  }

  private setTypeProduitLabel(): void {
    const labels: { [key in TypeProduit]: string } = {
      [TypeProduit.SANTE]: 'Santé',
      [TypeProduit.AUTO]: 'Auto',
      [TypeProduit.HABITATION]: 'Habitation',
      [TypeProduit.VOYAGE]: 'Voyage',
      [TypeProduit.VIE]: 'Vie',
      [TypeProduit.RETRAITE]: 'Retraite'
    };

    this.typeProduitLabel = labels[this.produit.typeProduit] || this.produit.typeProduit;
  }

  private setNiveauPopulariteColor(): void {
    const niveau = this.produit.niveauPopularite || 1;
    const colors = ['secondary', 'info', 'warning', 'success', 'danger'];
    this.niveauPopulariteColor = colors[Math.min(niveau - 1, colors.length - 1)];
  }

  onEdit(): void {
    this.edit.emit(this.produit);
  }

  onDelete(): void {
    this.delete.emit(this.produit);
  }

  onToggle(): void {
    this.toggle.emit(this.produit);
  }

  onSelect(): void {
    this.select.emit(this.produit);
  }

  // Méthodes utilitaires pour l'affichage
  getStatutColor(): string {
    return getStatutColor(this.produit.actif ? 'actif' : 'inactif');
  }

  getNiveauCouvertureColor(niveau: NiveauCouverture): string {
    return getNiveauCouvertureColor(niveau);
  }

  formatPrix(prix: number): string {
    return formatCurrency(prix);
  }

  getPopulariteStars(): number[] {
    return Array(5).fill(0).map((_, i) => i < (this.produit.niveauPopularite || 1));
  }

  getAgeRange(): string {
    if (this.produit.ageMin === 0 && this.produit.ageMax === 120) {
      return 'Tous âges';
    }
    return `${this.produit.ageMin} - ${this.produit.ageMax} ans`;
  }

  getConditionsMedicales(): string[] {
    const conditions: string[] = [];
    if (this.produit.maladieChroniqueAutorisee) {
      conditions.push('Maladies chroniques');
    }
    if (this.produit.diabetiqueAutorisee) {
      conditions.push('Diabète');
    }
    return conditions;
  }

  hasPacks(): boolean {
    return this.produit.packs && this.produit.packs.length > 0;
  }

  getNombrePacksActifs(): number {
    if (!this.produit.packs) return 0;
    return this.produit.packs.filter(pack => pack.actif).length;
  }

  getNombreGarantiesTotal(): number {
    if (!this.produit.packs) return 0;
    return this.produit.packs.reduce((total, pack) => total + (pack.nombreGaranties || 0), 0);
  }

  isProduitRecent(): boolean {
    if (!this.produit.dateCreation) return false;
    const dateCreation = new Date(this.produit.dateCreation);
    const maintenant = new Date();
    const joursDifference = Math.floor((maintenant.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24));
    return joursDifference <= 30;
  }

  getTagSeverity(): string {
    if (!this.produit.actif) return 'danger';
    if (this.isProduitRecent()) return 'info';
    if (this.produit.niveauPopularite && this.produit.niveauPopularite >= 4) return 'success';
    return 'primary';
  }

  getTagValue(): string {
    if (!this.produit.actif) return 'Inactif';
    if (this.isProduitRecent()) return 'Nouveau';
    if (this.produit.niveauPopularite && this.produit.niveauPopularite >= 4) return 'Populaire';
    return 'Standard';
  }
}
