import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GestionProduitService, Pack } from '../../services/gestion-produit.service';
import { TypeClient, NiveauCouverture, Statut, CouvertureGeographique } from '../../models/entities.model';
import { ToastService } from '../../shared/services/toast.service';
import { BreadcrumbService } from '../../shared/services/breadcrumb.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pack-form',
  templateUrl: './pack-form.component.html',
  styleUrls: ['./pack-form.component.css'],
  standalone: true,
  imports: [
    CardModule,
    MultiSelectModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    InputNumberModule,
    ToastModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class PackFormComponent implements OnInit {
  packForm: FormGroup;
  loading = false;
  produits: any[] = [];

  typeClientOptions = [
    { label: 'Individuel', value: TypeClient.INDIVIDUEL },
    { label: 'Famille', value: TypeClient.FAMILLE },
    { label: 'Enfant', value: TypeClient.ENFANT },
    { label: 'Senior', value: TypeClient.SENIOR },
    { label: 'Entreprise', value: TypeClient.ENTREPRISE },
    { label: 'Étudiant', value: TypeClient.ETUDIANT }
  ];

  niveauCouvertureOptions = [
    { label: 'Basic', value: NiveauCouverture.BASIC },
    { label: 'Premium', value: NiveauCouverture.PREMIUM },
    { label: 'Gold', value: NiveauCouverture.GOLD }
  ];

  statutOptions = [
    { label: 'Actif', value: Statut.ACTIF },
    { label: 'Inactif', value: Statut.INACTIF }
  ];

  couvertureGeoOptions = [
    { label: 'Local', value: CouvertureGeographique.LOCAL },
    { label: 'National', value: CouvertureGeographique.NATIONAL },
    { label: 'International', value: CouvertureGeographique.INTERNATIONAL },
    { label: 'UE', value: CouvertureGeographique.UE },
    { label: 'Maghreb', value: CouvertureGeographique.MAGHREB }
  ];

  constructor(
    private fb: FormBuilder,
    private packService: GestionProduitService,
    private produitService: GestionProduitService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.packForm = this.fb.group({
      nomPack: ['', [Validators.required]],
      description: ['', [Validators.required]],
      produitId: [null, [Validators.required]],
      ageMinimum: [null],
      ageMaximum: [null],
      typeClients: [[], [Validators.required]],
      ancienneteContratMois: [0, [Validators.min(0)]],
      couvertureGeographique: [null, [Validators.required]],
      prixMensuel: [0, [Validators.required, Validators.min(0)]],
      dureeMinContrat: [1, [Validators.min(1)]],
      dureeMaxContrat: [12, [Validators.min(1)]],
      niveauCouverture: [null, [Validators.required]],
      statut: [Statut.ACTIF, [Validators.required]]
    });
    
    // Prevent initial disabled state
    this.packForm.markAsUntouched();
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumb([
      { label: 'Packs', url: '/packs' },
      { label: 'Nouveau pack', url: '/packs/add' }
    ]);

    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (data) => {
        this.produits = data.map(p => ({
          label: p.nomProduit,
          value: p.idProduit
        }));
      },
      error: (error) => {
        console.error('Error loading produits:', error);
        this.toastService.showError('Erreur', 'Impossible de charger les produits');
      }
    });
  }

  onSubmit(): void {
    if (this.packForm.invalid) {
      Object.keys(this.packForm.controls).forEach(key => {
        this.packForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const packData = {
      ...this.packForm.value,
      nomProduit: this.produits.find(p => p.value === this.packForm.value.produitId)?.label
    };

    this.packService.createPack(packData).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('Pack créé', 'Le pack a été créé avec succès');
        this.router.navigate(['/packs']);
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showError('Erreur', 'Impossible de créer le pack');
        console.error('Error creating pack:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/packs']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.packForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.packForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['min']) return `Valeur minimum: ${field.errors['min'].min}`;
    }
    return '';
  }
}
