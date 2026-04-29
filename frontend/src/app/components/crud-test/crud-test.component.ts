import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudTestService, ServiceTestResult, TestResult } from '../../services/crud-test.service';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-crud-test',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    CardModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="crud-test-container">
      <div class="header">
        <h1>🧪 Test CRUD - Projet Vermeg</h1>
        <p>Test complet de tous les endpoints CRUD pour vérifier le bon fonctionnement des microservices</p>
        
        <div class="actions">
          <button 
            pButton 
            label="Lancer tous les tests" 
            icon="pi pi-play" 
            (click)="runAllTests()"
            [disabled]="isRunning"
            class="p-button-success">
          </button>
          
          <button 
            pButton 
            label="Générer le rapport" 
            icon="pi pi-file-pdf" 
            (click)="generateReport()"
            [disabled]="!testResults.length"
            class="p-button-info ml-2">
          </button>
          
          <button 
            pButton 
            label="Effacer les résultats" 
            icon="pi pi-trash" 
            (click)="clearResults()"
            [disabled]="isRunning"
            class="p-button-danger ml-2">
          </button>
        </div>
      </div>

      <div *ngIf="isRunning" class="loading-section">
        <p-progressSpinner></p-progressSpinner>
        <p>Tests en cours...</p>
      </div>

      <div *ngIf="testResults.length && !isRunning" class="results-section">
        <div class="summary-cards">
          <div class="summary-card success">
            <h3>{{ totalPassed }}</h3>
            <p>Tests réussis</p>
          </div>
          <div class="summary-card error">
            <h3>{{ totalFailed }}</h3>
            <p>Tests échoués</p>
          </div>
          <div class="summary-card info">
            <h3>{{ overallSuccessRate.toFixed(1) }}%</h3>
            <p>Taux de réussite</p>
          </div>
        </div>

        <div *ngFor="let result of testResults" class="service-result">
          <p-card [header]="result.serviceName" styleClass="service-card">
            <div class="service-info">
              <span class="info-item">
                <i class="pi pi-globe"></i>
                URL: {{ result.baseUrl }}
              </span>
              <span class="info-item">
                <i class="pi pi-chart-bar"></i>
                Taux de réussite: {{ result.successRate.toFixed(1) }}%
              </span>
              <span class="info-item">
                <i class="pi pi-check-circle"></i>
                {{ result.passedTests }}/{{ result.totalTests }} tests
              </span>
            </div>

            <p-table [value]="result.endpoints" [paginator]="false" [rows]="10">
              <ng-template pTemplate="header">
                <tr>
                  <th>Endpoint</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th>Code</th>
                  <th>Temps</th>
                  <th>Message</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-endpoint>
                <tr>
                  <td>{{ endpoint.endpoint }}</td>
                  <td>
                    <span class="method-badge method-{{ endpoint.method.toLowerCase() }}">
                      {{ endpoint.method }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge status-{{ endpoint.status }}">
                      {{ endpoint.status === 'success' ? '✅ Succès' : '❌ Erreur' }}
                    </span>
                  </td>
                  <td>{{ endpoint.statusCode || '-' }}</td>
                  <td>{{ endpoint.responseTime ? endpoint.responseTime + 'ms' : '-' }}</td>
                  <td>{{ endpoint.message }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
  `,
  styleUrls: ['./crud-test.component.scss']
})
export class CrudTestComponent implements OnInit {
  testResults: ServiceTestResult[] = [];
  isRunning = false;

  constructor(
    private crudTestService: CrudTestService,
    private messageService: MessageService
  ) {}

  ngOnInit() {}

  runAllTests() {
    this.isRunning = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Tests en cours',
      detail: 'Lancement des tests CRUD sur tous les microservices...'
    });

    this.crudTestService.testAllServices().subscribe({
      next: (results) => {
        this.testResults = results;
        this.isRunning = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Tests terminés',
          detail: `${this.totalPassed}/${this.totalTests} tests réussis`
        });
      },
      error: (error) => {
        this.isRunning = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors des tests'
        });
      }
    });
  }

  generateReport() {
    const report = this.crudTestService.generateTestReport(this.testResults);
    this.downloadReport(report, 'rapport-tests-crud-vermeg.md');
    this.messageService.add({
      severity: 'success',
      summary: 'Rapport généré',
      detail: 'Le rapport de tests a été téléchargé'
    });
  }

  clearResults() {
    this.testResults = [];
    this.messageService.add({
      severity: 'info',
      summary: 'Résultats effacés',
      detail: 'Les résultats de tests ont été effacés'
    });
  }

  private downloadReport(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  get totalTests(): number {
    return this.testResults.reduce((sum, result) => sum + result.totalTests, 0);
  }

  get totalPassed(): number {
    return this.testResults.reduce((sum, result) => sum + result.passedTests, 0);
  }

  get totalFailed(): number {
    return this.totalTests - this.totalPassed;
  }

  get overallSuccessRate(): number {
    return this.totalTests > 0 ? (this.totalPassed / this.totalTests) * 100 : 0;
  }
}
