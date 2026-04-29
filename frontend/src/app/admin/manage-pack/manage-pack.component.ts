import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { PackService } from '../../core/services/pack.service';
import { ProduitService } from '../../core/services/produit.service';
import { EligibiliteService } from '../../core/services/eligibilite.service';
import { Garantie, NiveauCouverture, Pack, PackGarantie, Produit, Statut, TypeClient, CouvertureGeographique, TypeMontant } from '../../models/entities.model';
import { GarantieService } from '../../core/services/garantie.service';
import { NumberPipe } from '../../pipes/number.pipe';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { ButtonDirective } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-manage-pack',
    templateUrl: './manage-pack.component.html',
    styleUrls: ['./manage-pack.component.css'],
    standalone: true,
    imports: [ToolbarModule, PrimeTemplate, ButtonDirective, Ripple, TableModule, InputTextModule, RouterLink, NgIf, NgFor, BadgeModule, NgClass, DialogModule, FormsModule, ReactiveFormsModule, InputTextareaModule, DropdownModule, InputNumberModule, InputSwitchModule, DecimalPipe, NumberPipe],
  providers: [ProduitService, PackService]
})
export class ManagePackComponent implements OnInit {
  packs: Pack[] = [];
  produits: Produit[] = [];
  garanties: Garantie[] = [];
  loading = true;
  packForm: FormGroup;
  isEditing = false;
  currentId: string | null = null;
  showForm = false;
  showChatbot = false;
  isCreatingWithChatbot = false;
  breadcrumbItems = [{ label: 'Packs', link: '/admin/packs' }];
  private pendingEditId: string | null = null;

  readonly niveauxCouverture = [
    { label: 'Basique', value: NiveauCouverture.BASIC },
    { label: 'Premium', value: NiveauCouverture.PREMIUM },
    { label: 'Gold', value: NiveauCouverture.GOLD }
  ];

  constructor(
    private packService: PackService,
    private produitService: ProduitService,
    private garantieService: GarantieService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private eligibiliteService: EligibiliteService
  ) {
    this.packForm = this.fb.group({
      nomPack: ['', Validators.required],
      description: ['', Validators.required],
      prixMensuel: [0, [Validators.required, Validators.min(0)]],
      dureeMinContrat: [12, [Validators.required, Validators.min(1)]],
      dureeMaxContrat: [24, [Validators.required, Validators.min(1)]],
      produitId: ['', Validators.required],
      niveauCouverture: [NiveauCouverture.BASIC, Validators.required],
      statut: [Statut.ACTIF, Validators.required],
      garanties: this.fb.array([])
    });
  }

  get garantiesArray(): FormArray<FormGroup> {
    return this.packForm.get('garanties') as FormArray<FormGroup>;
  }

  createGarantieGroup(packGarantie?: Partial<PackGarantie>): FormGroup {
    return this.fb.group({
      garantieId: [packGarantie?.garantieId ?? '', Validators.required],
      tauxRemboursement: [packGarantie?.tauxRemboursement ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      plafond: [packGarantie?.plafond ?? 0, [Validators.required, Validators.min(0)]],
      franchise: [packGarantie?.franchise ?? 0, [Validators.min(0)]],
      optionnelle: [packGarantie?.optionnelle ?? false],
      supplementPrix: [packGarantie?.supplementPrix ?? 0, [Validators.min(0)]],
      delaiCarence: [packGarantie?.delaiCarence ?? 0, [Validators.min(0)]],
      typeMontant: [packGarantie?.typeMontant ?? 'FORFAIT'],
      priorite: [packGarantie?.priorite ?? 1]
    });
  }

  addGarantieLine(packGarantie?: Partial<PackGarantie>): void {
    this.garantiesArray.push(this.createGarantieGroup(packGarantie));
  }

  removeGarantieLine(index: number): void {
    if (this.garantiesArray.length === 1) {
      this.garantiesArray.at(0).reset({
        garantieId: '',
        tauxRemboursement: 0,
        plafondAnnuel: 0,
        plafondParActe: 0,
        estOptionnelle: false,
        supplementPrix: 0,
        conditionsSpecifiques: '',
        delaiCarence: 0,
        niveauCouverture: ''
      });
      return;
    }

    this.garantiesArray.removeAt(index);
  }

  resetGarantiesArray(garanties: PackGarantie[] = []): void {
    while (this.garantiesArray.length) {
      this.garantiesArray.removeAt(0);
    }

    if (!garanties.length) {
      this.addGarantieLine();
      return;
    }

    garanties.forEach((garantie) => this.addGarantieLine(garantie));
  }

  getProduitName(produitId?: string): string {
    const id = produitId || this.packForm.get('produitId')?.value;
    const produit = this.produits.find(p => p.idProduit === id);
    return produit?.nomProduit || 'Aucun';
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.pendingEditId = params.get('editId');
      this.tryOpenPendingEdit();
    });
    this.loadProduits();
    this.loadGaranties();
    this.loadPacks();
    this.addGarantieLine();
  }

  loadPacks(): void {
    this.loading = true;
    this.packService.getAllPacks().subscribe({
      next: (res: Pack[]) => {
        this.packs = res;
        this.loading = false;
        this.tryOpenPendingEdit();
      },
      error: (err: any) => {
        console.error('Error loading packs', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les packs' });
      }
    });
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (res: Produit[]) => (this.produits = res),
      error: (err: any) => console.error('Error loading produits', err)
    });
  }

  loadGaranties(): void {
    this.garantieService.getAllGaranties().subscribe({
      next: (res: Garantie[]) => (this.garanties = res),
      error: (err: any) => console.error('Error loading garanties', err)
    });
  }

  onSubmit(): void {
    if (this.packForm.invalid) {
      this.packForm.markAllAsTouched();
      return;
    }

    const rawValue = this.packForm.getRawValue();
    const payload: Pack = {
      idPack: this.currentId ?? '',
      nomPack: rawValue.nomPack,
      description: rawValue.description,
      produitId: rawValue.produitId,
      nomProduit: this.getProduitName(rawValue.produitId),
      ageMinimum: Number(rawValue.ageMinimum ?? 0),
      ageMaximum: Number(rawValue.ageMaximum ?? 100),
      typeClients: rawValue.typeClients || ['INDIVIDUEL'],
      ancienneteContratMois: Number(rawValue.ancienneteContratMois ?? 0),
      couvertureGeographique: rawValue.couvertureGeographique || 'NATIONAL',
      prixMensuel: Number(rawValue.prixMensuel ?? 0),
      dureeMinContrat: Number(rawValue.dureeMinContrat ?? 0),
      dureeMaxContrat: Number(rawValue.dureeMaxContrat ?? 0),
      niveauCouverture: rawValue.niveauCouverture as NiveauCouverture,
      statut: rawValue.statut,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    const request$ = this.isEditing && this.currentId
      ? this.packService.updatePack(this.currentId, payload)
      : this.packService.createPack(payload);

    request$.subscribe({
      next: () => {
        this.loadPacks();
        this.resetForm();
        this.showForm = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: this.isEditing ? 'Pack mis à jour' : 'Pack créé'
        });
      },
      error: (error: any) => {
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Opération échouée'
        });
      }
    });
  }

  modifier(pack: Pack): void {
    this.isEditing = true;
    this.currentId = pack.idPack ?? null;
    this.packForm.patchValue({
      nomPack: pack.nomPack,
      description: pack.description,
      prixMensuel: pack.prixMensuel,
      dureeMinContrat: pack.dureeMinContrat,
      dureeMaxContrat: pack.dureeMaxContrat,
      produitId: pack.produitId,
      niveauCouverture: (pack.niveauCouverture ?? NiveauCouverture.BASIC) as NiveauCouverture,
      statut: pack.statut
    });
    this.showForm = true;
  }

  private tryOpenPendingEdit(): void {
    if (!this.pendingEditId || !this.packs.length) {
      return;
    }

    const targetPack = this.packs.find((pack) => pack.idPack === this.pendingEditId);
    if (!targetPack) {
      return;
    }

    this.modifier(targetPack);
    this.pendingEditId = null;
  }

  supprimer(pack: Pack): void {
    if (!pack.idPack) {
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le pack "${pack.nomPack}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.packService.deletePack(pack.idPack).subscribe({
          next: () => {
            this.loadPacks();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Pack supprimé'
            });
          },
          error: (error: any) => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Suppression échouée'
            });
          }
        });
      }
    });
  }

  voirDetails(pack: Pack): void {
    this.router.navigate(['/admin/packs', pack.idPack]);
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentId = null;
    this.packForm.reset({
      nomPack: '',
      description: '',
      prixMensuel: 0,
      dureeMinContrat: 12,
      dureeMaxContrat: 24,
      produitId: '',
      niveauCouverture: NiveauCouverture.BASIC,
      statut: Statut.ACTIF
    });
  }

  openChatbot(): void {
    this.showChatbot = true;
    this.isCreatingWithChatbot = true;
  }

  closeChatbot(): void {
    this.showChatbot = false;
    this.isCreatingWithChatbot = false;
  }

  getPackGaranties(pack: Pack, type: 'incluses' | 'optionnelles'): PackGarantie[] {
    // garanties field removed from backend - return empty array
    return [];
  }

  getGarantieDisplay(packGarantie: PackGarantie): string {
    return packGarantie.nomGarantie ?? packGarantie.garantieId ?? 'Garantie inconnue';
  }

  getNiveauLabel(niveau: NiveauCouverture): string {
    switch (niveau) {
      case NiveauCouverture.BASIC:
        return 'Basique';
      case NiveauCouverture.PREMIUM:
        return 'Premium';
      case NiveauCouverture.GOLD:
        return 'Gold';
      default:
        return 'Basique';
    }
  }

  getNiveauSeverity(niveau: NiveauCouverture): 'success' | 'info' | 'warning' | 'danger' {
    switch (niveau) {
      case NiveauCouverture.BASIC:
        return 'info';
      case NiveauCouverture.PREMIUM:
        return 'warning';
      case NiveauCouverture.GOLD:
        return 'success';
      default:
        return 'info';
    }
  }
}
