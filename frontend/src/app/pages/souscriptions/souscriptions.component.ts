import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GestionSouscriptionService, Souscription } from '../../services/gestion-souscription.service';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-souscriptions',
  templateUrl: './souscriptions.component.html',
  styleUrls: ['./souscriptions.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    BadgeModule
  ],
  providers: [MessageService]
})
export class SouscriptionsComponent implements OnInit {
  souscriptions: Souscription[] = [];
  loading = false;

  constructor(
    private souscriptionService: GestionSouscriptionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSouscriptions();
  }

  loadSouscriptions(): void {
    this.loading = true;
    this.souscriptionService.getAllSouscriptions().subscribe({
      next: (data) => {
        this.souscriptions = data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${data.length} souscriptions chargées`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des souscriptions'
        });
      }
    });
  }
}
