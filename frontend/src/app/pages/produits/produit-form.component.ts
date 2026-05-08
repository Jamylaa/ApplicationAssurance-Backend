import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GestionProduitService, Produit } from '../../services/gestion-produit.service';
import { TypeProduit, Statut } from '../../models/entities.model';
import { ToastService } from '../../shared/services/toast.service';
import { BreadcrumbService } from '../../shared/services/breadcrumb.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-produit-form',
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.css'],
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    ToastModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class ProduitFormComponent implements OnInit {
  produitForm: FormGroup;
  loading = false;
  isEdit = false;
  produitId?: string;

  typeProduitOptions = [
    { label: 'Santé', value: TypeProduit.SANTE },
    { label: 'Habitation', value: TypeProduit.HABITATION },
    { label: 'Auto', value: TypeProduit.AUTO },
    { label: 'Épargne', value: TypeProduit.EPARGNE },
    { label: 'Vie', value: TypeProduit.VIE }
  ];

  statutOptions = [
    { label: 'Actif', value: Statut.ACTIF },
    { label: 'Inactif', value: Statut.INACTIF }
  ];

  constructor(
    private fb: FormBuilder,
    private produitService: GestionProduitService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.produitForm = this.fb.group({
      nomProduit: ['', [Validators.required]],
      description: ['', [Validators.required]],
      typeProduit: [null, [Validators.required]],
      statut: [Statut.ACTIF, [Validators.required]]
    });
    
    // Prevent initial disabled state
    this.produitForm.markAsUntouched();
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumb([
      { label: 'Produits', url: '/produits' },
      { label: 'Nouveau produit', url: '/produits/add' }
    ]);
  }

  onSubmit(): void {
    if (this.produitForm.invalid) {
      Object.keys(this.produitForm.controls).forEach(key => {
        this.produitForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const produitData = this.produitForm.value;

    this.produitService.createProduit(produitData).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('Produit créé', 'Le produit a été créé avec succès');
        this.router.navigate(['/produits']);
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showError('Erreur', 'Impossible de créer le produit');
        console.error('Error creating produit:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/produits']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.produitForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.produitForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['minlength']) return 'Minimum 3 caractères requis';
    }
    return '';
  }
}
