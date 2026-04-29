import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GestionProduitService, Produit } from '../../services/gestion-produit.service';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    BadgeModule
  ],
  providers: [MessageService]
})
export class ProduitsComponent implements OnInit {
  produits: Produit[] = [];
  loading = false;
  globalFilterValue = '';

  constructor(
    private produitService: GestionProduitService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.produitService.getAllProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${data.length} produits chargés`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des produits'
        });
        console.error('Error loading produits:', error);
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
  }

  refreshProduits(): void {
    this.loadProduits();
  }
}
