import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  statusCode?: number;
  message: string;
  responseTime?: number;
}

export interface ServiceTestResult {
  serviceName: string;
  baseUrl: string;
  endpoints: TestResult[];
  successRate: number;
  totalTests: number;
  passedTests: number;
}

@Injectable({
  providedIn: 'root'
})
export class CrudTestService {
  private services = [
    {
      name: 'GestionUser',
      baseUrl: environment.apiUser,
      endpoints: [
        { path: '/users', method: 'GET', description: 'Lister tous les utilisateurs' },
        { path: '/auth/login', method: 'POST', description: 'Connexion utilisateur' },
        { path: '/users/1', method: 'GET', description: 'Récupérer utilisateur par ID' },
        { path: '/users', method: 'POST', description: 'Créer utilisateur' },
        { path: '/users/1', method: 'PUT', description: 'Mettre à jour utilisateur' },
        { path: '/users/1', method: 'DELETE', description: 'Supprimer utilisateur' }
      ]
    },
    {
      name: 'GestionProduit',
      baseUrl: environment.apiProduit,
      endpoints: [
        { path: '/produits', method: 'GET', description: 'Lister tous les produits' },
        { path: '/produits/1', method: 'GET', description: 'Récupérer produit par ID' },
        { path: '/produits', method: 'POST', description: 'Créer produit' },
        { path: '/produits/1', method: 'PUT', description: 'Mettre à jour produit' },
        { path: '/produits/1', method: 'DELETE', description: 'Supprimer produit' }
      ]
    },
    {
      name: 'GestionSouscription',
      baseUrl: environment.apiSouscription,
      endpoints: [
        { path: '/souscription', method: 'GET', description: 'Lister les souscriptions' },
        { path: '/souscription/1', method: 'GET', description: 'Récupérer souscription par ID' },
        { path: '/souscription', method: 'POST', description: 'Créer souscription' },
        { path: '/souscription/1', method: 'PUT', description: 'Mettre à jour souscription' },
        { path: '/souscription/1', method: 'DELETE', description: 'Supprimer souscription' }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  testAllServices(): Observable<ServiceTestResult[]> {
    const testResults = this.services.map(service => this.testService(service));
    return new Observable(observer => {
      Promise.all(testResults).then(results => {
        observer.next(results);
        observer.complete();
      }).catch(error => {
        observer.error(error);
        observer.complete();
      });
    });
  }

  private async testService(service: any): Promise<ServiceTestResult> {
    const endpointResults: TestResult[] = [];
    
    for (const endpoint of service.endpoints) {
      const result = await this.testEndpoint(service.baseUrl + endpoint.path, endpoint.method, endpoint.description);
      endpointResults.push(result);
      
      // Petit délai pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const passedTests = endpointResults.filter(r => r.status === 'success').length;
    const successRate = (passedTests / endpointResults.length) * 100;
    
    return {
      serviceName: service.name,
      baseUrl: service.baseUrl,
      endpoints: endpointResults,
      successRate,
      totalTests: endpointResults.length,
      passedTests
    };
  }

  private async testEndpoint(url: string, method: string, description: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      let response: any;
      
      switch (method) {
        case 'GET':
          response = await this.http.get(url, { observe: 'response' }).toPromise();
          break;
        case 'POST':
          response = await this.http.post(url, {}, { observe: 'response' }).toPromise();
          break;
        case 'PUT':
          response = await this.http.put(url, {}, { observe: 'response' }).toPromise();
          break;
        case 'DELETE':
          response = await this.http.delete(url, { observe: 'response' }).toPromise();
          break;
        default:
          throw new Error(`Méthode non supportée: ${method}`);
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint: url,
        method,
        status: 'success',
        statusCode: response.status,
        message: `${description} - Succès (${response.status})`,
        responseTime
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const httpError = error as HttpErrorResponse;
      
      return {
        endpoint: url,
        method,
        status: 'error',
        statusCode: httpError.status,
        message: `${description} - Erreur: ${httpError.message || 'Erreur inconnue'}`,
        responseTime
      };
    }
  }

  generateTestReport(results: ServiceTestResult[]): string {
    let report = '# RAPPORT DE TEST CRUD - PROJET VERMEG\n\n';
    report += `Généré le: ${new Date().toLocaleString()}\n\n`;
    
    let totalTests = 0;
    let totalPassed = 0;
    
    results.forEach(result => {
      report += `## ${result.serviceName}\n`;
      report += `URL: ${result.baseUrl}\n`;
      report += `Taux de réussite: ${result.successRate.toFixed(1)}% (${result.passedTests}/${result.totalTests})\n\n`;
      
      result.endpoints.forEach(endpoint => {
        const status = endpoint.status === 'success' ? '✅' : '❌';
        report += `${status} **${endpoint.method}** ${endpoint.endpoint}\n`;
        report += `   ${endpoint.message}\n`;
        if (endpoint.responseTime) {
          report += `   Temps de réponse: ${endpoint.responseTime}ms\n`;
        }
        report += '\n';
      });
      
      report += '\n';
      totalTests += result.totalTests;
      totalPassed += result.passedTests;
    });
    
    const overallSuccessRate = (totalPassed / totalTests) * 100;
    report += `## RÉSUMÉ GLOBAL\n`;
    report += `Tests totaux: ${totalTests}\n`;
    report += `Tests réussis: ${totalPassed}\n`;
    report += `Taux de réussite global: ${overallSuccessRate.toFixed(1)}%\n`;
    
    return report;
  }
}
