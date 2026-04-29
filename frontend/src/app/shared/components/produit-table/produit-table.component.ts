import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

import { Produit, TypeProduit, ProduitFilter, PaginatedResponse } from '../../models/produit-refactored.model';
import { getStatutColor, formatCurrency } from '../../models/produit-refactored.model';

@Component({
  selector: 'app-produit-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    FormsModule
  ],
  templateUrl: './produit-table.component.html',
  styleUrls: ['./produit-table.component.scss']
})
export class ProduitTableComponent implements OnInit, OnChanges {

  @Input() produits: Produit[] = [];
  @Input() loading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() showActions: boolean = true;
  @Input() showFilters: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() rowsPerPage: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50];

  @Output() edit = new EventEmitter<Produit>();
  @Output() delete = new EventEmitter<Produit>();
  @Output() toggle = new EventEmitter<Produit>();
  @Output() select = new EventEmitter<Produit>();
  @Output() filterChange = new EventEmitter<ProduitFilter>();
  @Output() pageChange = new EventEmitter<{ first: number; rows: number }>();
  @Output() sortChange = new EventEmitter<{ field: string; order: number }>();

  // État du composant
  selectedProduits: Produit[] = [];
  globalFilter: string = '';
  first: number = 0;
  rows: number = 10;

  // Filtres
  filter: ProduitFilter = {};

  // Options pour les filtres
  typeProduitOptions: { label: string; value: TypeProduit }[] = [];
  categorieOptions: { label: string; value: string }[] = [];
  statutOptions: { label: string; value: boolean }[] = [
    { label: 'Actif', value: true },
    { label: 'Inactif', value: false }
  ];

  constructor() { }

  ngOnInit(): void {
    this.initializeFilters();
    this.initializeOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowsPerPage']) {
      this.rows = this.rowsPerPage;
    }
  }

  private initializeFilters(): void {
    this.filter = {
      searchTerm: '',
      typeProduit: undefined,
      actif: undefined,
      categorie: undefined,
      prixMin: undefined,
      prixMax: undefined
    };
  }

  private initializeOptions(): void {
    this.typeProduitOptions = Object.values(TypeProduit).map(type => ({
      label: this.getTypeProduitLabel(type),
      value: type
    }));

    // Catégories extraites des produits
    const categories = [...new Set(this.produits.map(p => p.categorie).filter(Boolean))];
    this.categorieOptions = categories.map(cat => ({
      label: cat!,
      value: cat!
    }));
  }

  // Gestion des événements
  onEdit(produit: Produit): void {
    this.edit.emit(produit);
  }

  onDelete(produit: Produit): void {
    this.delete.emit(produit);
  }

  onToggle(produit: Produit): void {
    this.toggle.emit(produit);
  }

  onSelect(produit: Produit): void {
    this.select.emit(produit);
  }

  onRowSelect(event: any): void {
    this.select.emit(event.data);
  }

  onSelectionChange(): void {
    if (this.selectedProduits.length > 0) {
      this.select.emit(this.selectedProduits[0]);
    }
  }

  // Pagination
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.pageChange.emit({ first: event.first, rows: event.rows });
  }

  // Tri
  onSort(event: any): void {
    this.sortChange.emit({ field: event.field, order: event.order });
  }

  // Filtres
  onFilterChange(): void {
    this.filterChange.emit({ ...this.filter });
  }

  onGlobalFilterChange(): void {
    this.filter.searchTerm = this.globalFilter;
    this.onFilterChange();
  }

  onTypeProduitFilterChange(): void {
    this.onFilterChange();
  }

  onStatutFilterChange(): void {
    this.onFilterChange();
  }

  onCategorieFilterChange(): void {
    this.onFilterChange();
  }

  clearFilters(): void {
    this.initializeFilters();
    this.globalFilter = '';
    this.onFilterChange();
  }

  // Méthodes utilitaires pour l'affichage
  getTypeProduitLabel(type: TypeProduit): string {
    const labels: { [key in TypeProduit]: string } = {
      [TypeProduit.SANTE]: 'Santé',
      [TypeProduit.AUTO]: 'Auto',
      [TypeProduit.HABITATION]: 'Habitation',
      [TypeProduit.VOYAGE]: 'Voyage',
      [TypeProduit.VIE]: 'Vie',
      [TypeProduit.RETRAITE]: 'Retraite'
    };
    return labels[type] || type;
  }

  getStatutColor(actif: boolean): string {
    return getStatutColor(actif ? 'actif' : 'inactif');
  }

  formatPrix(prix: number): string {
    return formatCurrency(prix);
  }

  getNombrePacksActifs(produit: Produit): number {
    if (!produit.packs) return 0;
    return produit.packs.filter(pack => pack.actif).length;
  }

  getNombreGarantiesTotal(produit: Produit): number {
    if (!produit.packs) return 0;
    return produit.packs.reduce((total, pack) => total + (pack.nombreGaranties || 0), 0);
  }

  getAgeRange(produit: Produit): string {
    if (produit.ageMin === 0 && produit.ageMax === 120) {
      return 'Tous âges';
    }
    return `${produit.ageMin} - ${produit.ageMax} ans`;
  }

  hasConditionsSpeciales(produit: Produit): boolean {
    return produit.maladieChroniqueAutorisee || produit.diabetiqueAutorise;
  }

  getConditionsSpeciales(produit: Produit): string[] {
    const conditions: string[] = [];
    if (produit.maladieChroniqueAutorisee) {
      conditions.push('Maladies chroniques');
    }
    if (produit.diabetiqueAutorise) {
      conditions.push('Diabète');
    }
    return conditions;
  }

  isProduitRecent(produit: Produit): boolean {
    if (!produit.dateCreation) return false;
    const dateCreation = new Date(produit.dateCreation);
    const maintenant = new Date();
    const joursDifference = Math.floor((maintenant.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24));
    return joursDifference <= 30;
  }

  getPopulariteStars(niveau?: number): number[] {
    const niveauPop = niveau || 1;
    return Array(5).fill(0).map((_, i) => i < niveauPop);
  }

  // Actions groupées
  onBulkDelete(): void {
    if (this.selectedProduits.length > 0) {
      this.selectedProduits.forEach(produit => this.delete.emit(produit));
      this.selectedProduits = [];
    }
  }

  onBulkToggle(): void {
    if (this.selectedProduits.length > 0) {
      this.selectedProduits.forEach(produit => this.toggle.emit(produit));
      this.selectedProduits = [];
    }
  }

  // Export
  exportToCSV(): void {
    const csv = this.convertToCSV(this.produits);
    this.downloadCSV(csv, 'produits.csv');
  }

  private convertToCSV(data: Produit[]): string {
    const headers = [
      'ID', 'Nom', 'Type', 'Description', 'Âge Min', 'Âge Max', 
      'Actif', 'Nombre Packs', 'Prix Moyen', 'Date Création'
    ];

    const rows = data.map(produit => [
      produit.idProduit,
      produit.nomProduit,
      this.getTypeProduitLabel(produit.typeProduit),
      produit.description,
      produit.ageMin,
      produit.ageMax,
      produit.actif,
      this.getNombrePacksActifs(produit),
      produit.prixMoyenPacks || 0,
      produit.dateCreation
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Templates pour PrimeNG Table
  statusTemplate(produit: Produit): string {
    const color = produit.actif ? 'success' : 'danger';
    const text = produit.actif ? 'Actif' : 'Inactif';
    return `<p-tag value="${text}" severity="${color}"></p-tag>`;
  }

  typeTemplate(produit: Produit): string {
    return `<p-tag value="${this.getTypeProduitLabel(produit.typeProduit)}" severity="info"></p-tag>`;
  }

  prixTemplate(produit: Produit): string {
    const prix = produit.prixMoyenPacks || 0;
    return `<span class="prix-value">${this.formatPrix(prix)}</span>`;
  }

  packsTemplate(produit: Produit): string {
    const packsActifs = this.getNombrePacksActifs(produit);
    const totalPacks = produit.packs?.length || 0;
    return `<p-badge value="${packsActifs}/${totalPacks}" severity="info"></p-badge>`;
  }

  actionsTemplate(produit: Produit): string {
    return `
      <div class="action-buttons">
        <p-button icon="pi pi-eye" class="p-button-outlined p-button-sm" pTooltip="Voir"></p-button>
        <p-button icon="pi pi-pencil" class="p-button-outlined p-button-sm" pTooltip="Modifier"></p-button>
        <p-button icon="pi pi-trash" class="p-button-danger p-button-sm" pTooltip="Supprimer"></p-button>
      </div>
    `;
  }
}
