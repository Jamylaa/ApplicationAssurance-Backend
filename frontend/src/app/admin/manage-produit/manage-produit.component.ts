import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { ProduitService } from '../../core/services/produit.service';
import { Pack, Produit, Statut, TypeProduit } from '../../models/entities.model';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { NgClass } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { ButtonDirective } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-manage-produit',
    templateUrl: './manage-produit.component.html',
    styleUrls: ['./manage-produit.component.css'],
    standalone: true,
    imports: [ToolbarModule, BreadcrumbModule, ToastModule, PrimeTemplate, ButtonDirective, Ripple, TableModule, InputTextModule, RouterLink, BadgeModule, NgClass, DialogModule, FormsModule, ReactiveFormsModule, DropdownModule, InputTextareaModule, InputNumberModule, InputSwitchModule],
  providers: [ProduitService]
})
export class ManageProduitComponent implements OnInit {
  produits: Produit[] = [];
  loading = true;
  produitForm: FormGroup;
  isEditing = false;
  currentId: string | null = null;
  showForm = false;
  breadcrumbItems = [
    { label: 'Admin', routerLink: '/admin' },
    { label: 'Produits', routerLink: '/admin/produits' }
  ];
  private pendingEditId: string | null = null;
  produitTypes: { label: string; value: TypeProduit }[] = Object.values(TypeProduit).map((value: TypeProduit) => ({
    label: this.getTypeLabel(value),
    value
  }));

  constructor(
    private produitService: ProduitService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.produitForm = this.fb.group({
      nomProduit: ['', Validators.required],
      typeProduit: [TypeProduit.SANTE, Validators.required],
      description: ['', Validators.required],
      ageMin: [0, [Validators.required, Validators.min(0)]],
      ageMax: [100, [Validators.required, Validators.min(0)]],
      maladieChroniqueAutorisee: [false],
      diabetiqueAutorisee: [false],
      actif: [true]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.pendingEditId = params.get('editId');
      this.tryOpenPendingEdit();
    });
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.produitService.getAllProduits().subscribe({
      next: (res: any[]) => {
        this.produits = res;
        this.loading = false;
        this.tryOpenPendingEdit();
      },
      error: (err: any) => {
        console.error('Error loading produits', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits' });
      }
    });
  }

  onSubmit(): void {
    if (this.produitForm.invalid) {
      this.produitForm.markAllAsTouched();
      return;
    }

    const rawValue = this.produitForm.getRawValue();
    const produit: Produit = {
      idProduit: this.currentId ?? '',
      nomProduit: rawValue.nomProduit,
      description: rawValue.description,
      typeProduit: rawValue.typeProduit,
      statut: rawValue.statut || Statut.ACTIF,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    const request$ = this.isEditing && this.currentId
      ? this.produitService.updateProduit(this.currentId, produit)
      : this.produitService.createProduit(produit);

    request$.subscribe({
      next: () => {
        this.loadProduits();
        this.resetForm();
        this.showForm = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: this.isEditing ? 'Produit mis a jour' : 'Produit cree'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.isEditing ? 'Mise a jour echouee' : 'Creation echouee'
        });
      }
    });
  }

  modifier(produit: Produit): void {
    this.isEditing = true;
    this.currentId = produit.idProduit ?? null;
    this.produitForm.patchValue({
      nomProduit: produit.nomProduit,
      description: produit.description,
      typeProduit: produit.typeProduit,
      statut: produit.statut
    });
    this.showForm = true;
  }

  private tryOpenPendingEdit(): void {
    if (!this.pendingEditId || !this.produits.length) {
      return;
    }

    const targetProduit = this.produits.find((produit) => produit.idProduit === this.pendingEditId);
    if (!targetProduit) {
      return;
    }

    this.modifier(targetProduit);
    this.pendingEditId = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { editId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  voirDetails(produit: Produit): void {
    if (!produit.idProduit) {
      return;
    }

    this.router.navigate(['/admin/produits', produit.idProduit]);
  }

  supprimer(idProduit: string): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer ce produit ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.produitService.deleteProduit(idProduit).subscribe({
          next: () => {
            this.loadProduits();
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Produit supprime' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression echouee' })
        });
      }
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentId = null;
    this.produitForm.reset({
      typeProduit: 'Sante',
      ageMin: 0,
      ageMax: 100,
      maladieChroniqueAutorisee: false,
      diabetiqueAutorise: false,
      actif: true
    });
  }

  getTypeLabel(type: TypeProduit | string | undefined): string {
    switch (type) {
      case 'Auto':
        return 'Auto';
      case 'Habitation':
        return 'Habitation';
      case 'vie':
        return 'Vie';
      case 'Sante':
      default:
        return 'Sante';
    }
  }

  getProduitPacks(produit: Produit): Pack[] {
    // packs field removed from backend - return empty array
    // This should be updated to fetch from Pack service
    return [];
  }

  getPackCount(produit: Produit): number {
    return this.getProduitPacks(produit).length;
  }

  getPackSummary(produit: Produit): string {
    const packs = this.getProduitPacks(produit);
    if (!packs.length) {
      return 'Aucun pack';
    }

    return packs
      .slice(0, 3)
      .map((pack) => pack.nomPack)
      .join(', ');
  }

  goToPacks(): void {
    this.router.navigate(['/admin/packs']);
  }
}
