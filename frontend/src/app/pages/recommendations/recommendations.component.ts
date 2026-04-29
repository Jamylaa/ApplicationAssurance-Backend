import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { RecommendationService, Recommendation } from '../../services/recommendation.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
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
export class RecommendationsComponent implements OnInit {
  recommendations: Recommendation[] = [];
  loading = false;

  constructor(
    private recommendationService: RecommendationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    this.recommendationService.getAllRecommendations().subscribe({
      next: (data) => {
        this.recommendations = data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${data.length} recommandations chargées`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des recommandations'
        });
      }
    });
  }
}
