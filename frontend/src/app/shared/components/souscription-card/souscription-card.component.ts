import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';

import { 
  Souscription, 
  StatutSouscription, 
  StatutPaiement, 
  ModePaiement,
  FrequencePaiement 
} from '../../models/souscription.model';
import { 
  getSouscriptionStatusColor, 
  getPaiementStatusColor, 
  formatCurrency, 
  formatDate, 
  isSouscriptionActive,
  isSouscriptionExpiringSoon,
  isPaiementEnRetard,
  getNombreBeneficiaires,
  getNombreGarantiesPersonnalisees,
  getNombreDocuments,
  getProchainPaiementEnJours,
  getSouscriptionSummary
} from '../../models/souscription.model';

@Component({
  selector: 'app-souscription-card',
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
  templateUrl: './souscription-card.component.html',
  styleUrls: ['./souscription-card.component.scss']
})
export class SouscriptionCardComponent implements OnChanges {

  @Input() souscription!: Souscription;
  @Input() showActions: boolean = true;
  @Input() compact: boolean = false;
  @Input() showDetails: boolean = true;

  @Output() edit = new EventEmitter<Souscription>();
  @Output() delete = new EventEmitter<Souscription>();
  @Output() activate = new EventEmitter<Souscription>();
  @Output() suspend = new EventEmitter<Souscription>();
  @Output() resilier = new EventEmitter<Souscription>();
  @Output() view = new EventEmitter<Souscription>();
  @Output() export = new EventEmitter<Souscription>();

  // État calculé
  isActive: boolean = false;
  isExpiringSoon: boolean = false;
  isPaymentOverdue: boolean = false;
  daysToNextPayment: number = 0;
  statusColor: string = 'secondary';
  paiementColor: string = 'secondary';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['souscription']) {
      this.calculateState();
    }
  }

  private calculateState(): void {
    this.isActive = isSouscriptionActive(this.souscription);
    this.isExpiringSoon = isSouscriptionExpiringSoon(this.souscription);
    this.isPaymentOverdue = isPaiementEnRetard(this.souscription);
    this.daysToNextPayment = getProchainPaiementEnJours(this.souscription);
    this.statusColor = getSouscriptionStatusColor(this.souscription.statut);
    this.paiementColor = getPaiementStatusColor(this.souscription.statutPaiement);
  }

  // Actions
  onEdit(): void {
    this.edit.emit(this.souscription);
  }

  onDelete(): void {
    this.delete.emit(this.souscription);
  }

  onActivate(): void {
    this.activate.emit(this.souscription);
  }

  onSuspend(): void {
    this.suspend.emit(this.souscription);
  }

  onResilier(): void {
    this.resilier.emit(this.souscription);
  }

  onView(): void {
    this.view.emit(this.souscription);
  }

  onExport(): void {
    this.export.emit(this.souscription);
  }

  // Méthodes utilitaires pour l'affichage
  getStatutLabel(): string {
    const labels: { [key in StatutSouscription]: string } = {
      [StatutSouscription.EN_ATTENTE]: 'En attente',
      [StatutSouscription.ACTIVE]: 'Active',
      [StatutSouscription.SUSPENDUE]: 'Suspendue',
      [StatutSouscription.RESILIEE]: 'Résiliée',
      [StatutSouscription.EXPIREE]: 'Expirée',
      [StatutSouscription.ANNULEE]: 'Annulée'
    };
    return labels[this.souscription.statut] || this.souscription.statut;
  }

  getPaiementLabel(): string {
    const labels: { [key in StatutPaiement]: string } = {
      [StatutPaiement.EN_ATTENTE]: 'En attente',
      [StatutPaiement.A_JOUR]: 'À jour',
      [StatutPaiement.EN_RETARD]: 'En retard',
      [StatutPaiement.IMPAYE]: 'Impayé',
      [StatutPaiement.BLOQUE]: 'Bloqué'
    };
    return labels[this.souscription.statutPaiement] || this.souscription.statutPaiement;
  }

  getModePaiementLabel(): string {
    const labels: { [key in ModePaiement]: string } = {
      [ModePaiement.MENSUEL]: 'Mensuel',
      [ModePaiement.TRIMESTRIEL]: 'Trimestriel',
      [ModePaiement.SEMESTRIEL]: 'Semestriel',
      [ModePaiement.ANNUEL]: 'Annuel'
    };
    return labels[this.souscription.modePaiement] || this.souscription.modePaiement;
  }

  getFrequenceLabel(): string {
    const labels: { [key in FrequencePaiement]: string } = {
      [FrequencePaiement.MENSUEL]: 'Mensuel',
      [FrequencePaiement.TRIMESTRIEL]: 'Trimestriel',
      [FrequencePaiement.SEMESTRIEL]: 'Semestriel',
      [FrequencePaiement.ANNUEL]: 'Annuel'
    };
    return labels[this.souscription.frequencePaiement] || this.souscription.frequencePaiement;
  }

  formatPrix(prix: number): string {
    return formatCurrency(prix);
  }

  formatDate(date: string): string {
    return formatDate(date);
  }

  getSummary(): string {
    return getSouscriptionSummary(this.souscription);
  }

  getNombreBeneficiaires(): number {
    return getNombreBeneficiaires(this.souscription);
  }

  getNombreGaranties(): number {
    return getNombreGarantiesPersonnalisees(this.souscription);
  }

  getNombreDocuments(): number {
    return getNombreDocuments(this.souscription);
  }

  hasBeneficiaires(): boolean {
    return this.getNombreBeneficiaires() > 0;
  }

  hasGarantiesPersonnalisees(): boolean {
    return this.getNombreGaranties() > 0;
  }

  hasDocuments(): boolean {
    return this.getNombreDocuments() > 0;
  }

  hasConditionsSpeciales(): boolean {
    return this.souscription.conditionsSpeciales && this.souscription.conditionsSpeciales.length > 0;
  }

  hasExclusionsSpeciales(): boolean {
    return this.souscription.exclusionsSpeciales && this.souscription.exclusionsSpeciales.length > 0;
  }

  getDureeContrat(): number {
    if (!this.souscription.dateDebut || !this.souscription.dateFin) {
      return 0;
    }
    
    const dateDebut = new Date(this.souscription.dateDebut);
    const dateFin = new Date(this.souscription.dateFin);
    
    return Math.floor((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  getProchainPaiementText(): string {
    if (this.daysToNextPayment === 0) {
      return 'Aujourd\'hui';
    } else if (this.daysToNextPayment === 1) {
      return 'Demain';
    } else if (this.daysToNextPayment < 0) {
      return `En retard de ${Math.abs(this.daysToNextPayment)} jours`;
    } else {
      return `Dans ${this.daysToNextPayment} jours`;
    }
  }

  getExpirationText(): string {
    if (!this.souscription.dateFin) {
      return '';
    }
    
    const dateFin = new Date(this.souscription.dateFin);
    const aujourdHui = new Date();
    const joursRestants = Math.floor((dateFin.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));
    
    if (joursRestants < 0) {
      return `Expirée depuis ${Math.abs(joursRestants)} jours`;
    } else if (joursRestants === 0) {
      return 'Expire aujourd\'hui';
    } else if (joursRestants === 1) {
      return 'Expire demain';
    } else {
      return `Expire dans ${joursRestants} jours`;
    }
  }

  getBorderColor(): string {
    if (this.isExpiringSoon) {
      return '#f59e0b'; // Orange
    }
    if (this.isPaymentOverdue) {
      return '#ef4444'; // Rouge
    }
    if (this.isActive) {
      return '#10b981'; // Vert
    }
    return '#6b7280'; // Gris
  }

  getPriorityClass(): string {
    if (this.isExpiringSoon) {
      return 'expiring-soon';
    }
    if (this.isPaymentOverdue) {
      return 'payment-overdue';
    }
    if (this.isActive) {
      return 'active';
    }
    return 'inactive';
  }

  canEdit(): boolean {
    return this.souscription.statut !== 'RESILIEE' && this.souscription.statut !== 'ANNULEE';
  }

  canDelete(): boolean {
    return this.souscription.statut !== 'ACTIVE';
  }

  canActivate(): boolean {
    return this.souscription.statut === 'EN_ATTENTE';
  }

  canSuspend(): boolean {
    return this.souscription.statut === 'ACTIVE';
  }

  canResilier(): boolean {
    return this.souscription.statut !== 'RESILIEE' && this.souscription.statut !== 'ANNULEE';
  }

  getAvailableActions(): string[] {
    const actions: string[] = [];

    if (this.canEdit()) {
      actions.push('edit');
    }

    if (this.canDelete()) {
      actions.push('delete');
    }

    if (this.canActivate()) {
      actions.push('activate');
    }

    if (this.canSuspend()) {
      actions.push('suspend');
    }

    if (this.canResilier()) {
      actions.push('resilier');
    }

    actions.push('view');
    actions.push('export');

    return actions;
  }

  // Méthodes pour les alertes
  hasAlerts(): boolean {
    return this.isExpiringSoon || this.isPaymentOverdue || this.hasConditionsSpeciales();
  }

  getAlerts(): Array<{ type: string; message: string; severity: string }> {
    const alerts: Array<{ type: string; message: string; severity: string }> = [];

    if (this.isExpiringSoon) {
      alerts.push({
        type: 'expiration',
        message: this.getExpirationText(),
        severity: 'warning'
      });
    }

    if (this.isPaymentOverdue) {
      alerts.push({
        type: 'payment',
        message: this.getProchainPaiementText(),
        severity: 'danger'
      });
    }

    if (this.hasConditionsSpeciales()) {
      alerts.push({
        type: 'conditions',
        message: `${this.souscription.conditionsSpeciales?.length} conditions spéciales`,
        severity: 'info'
      });
    }

    return alerts;
  }

  // Méthodes pour l'affichage des tags
  getTags(): Array<{ label: string; severity: string; icon?: string }> {
    const tags: Array<{ label: string; severity: string; icon?: string }> = [];

    // Tag de statut
    tags.push({
      label: this.getStatutLabel(),
      severity: this.statusColor,
      icon: 'pi pi-info-circle'
    });

    // Tag de paiement
    if (this.souscription.statutPaiement !== 'EN_ATTENTE') {
      tags.push({
        label: this.getPaiementLabel(),
        severity: this.paiementColor,
        icon: 'pi pi-money-bill'
      });
    }

    // Tag d'expiration
    if (this.isExpiringSoon) {
      tags.push({
        label: 'Expire bientôt',
        severity: 'warning',
        icon: 'pi pi-exclamation-triangle'
      });
    }

    // Tag de paiement en retard
    if (this.isPaymentOverdue) {
      tags.push({
        label: 'Paiement en retard',
        severity: 'danger',
        icon: 'pi pi-times-circle'
      });
    }

    // Tag de bénéficiaires
    if (this.hasBeneficiaires()) {
      tags.push({
        label: `${this.getNombreBeneficiaires()} bénéficiaires`,
        severity: 'info',
        icon: 'pi pi-users'
      });
    }

    // Tag de garanties personnalisées
    if (this.hasGarantiesPersonnalisees()) {
      tags.push({
        label: `${this.getNombreGaranties()} garanties perso.`,
        severity: 'secondary',
        icon: 'pi pi-shield'
      });
    }

    return tags;
  }
}
