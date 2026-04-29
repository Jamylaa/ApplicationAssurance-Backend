import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ConfigurationProduit, 
  RegleCalcul, 
  CalculRequest,
  ChampFormulaire,
  WorkflowConfig
} from '../../models/gestion-produit.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = 'http://localhost:8080/api';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  // Configurations Produit
  getAllConfigurations(): Observable<ConfigurationProduit[]> {
    return this.http.get<ConfigurationProduit[]>(`${this.apiUrl}/configurations`);
  }

  getConfigurationById(id: string): Observable<ConfigurationProduit> {
    return this.http.get<ConfigurationProduit>(`${this.apiUrl}/configurations/${id}`);
  }

  getConfigurationsByProduit(produitId: string): Observable<ConfigurationProduit[]> {
    return this.http.get<ConfigurationProduit[]>(`${this.apiUrl}/configurations/produit/${produitId}`);
  }

  getConfigurationActiveByProduit(produitId: string): Observable<ConfigurationProduit> {
    return this.http.get<ConfigurationProduit>(`${this.apiUrl}/configurations/produit/${produitId}/active`);
  }

  getConfigurationsActives(): Observable<ConfigurationProduit[]> {
    return this.http.get<ConfigurationProduit[]>(`${this.apiUrl}/configurations/actives`);
  }

  createConfiguration(configuration: ConfigurationProduit): Observable<ConfigurationProduit> {
    return this.http.post<ConfigurationProduit>(`${this.apiUrl}/configurations`, configuration, this.httpOptions);
  }

  updateConfiguration(id: string, configuration: ConfigurationProduit): Observable<ConfigurationProduit> {
    return this.http.put<ConfigurationProduit>(`${this.apiUrl}/configurations/${id}`, configuration, this.httpOptions);
  }

  deleteConfiguration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/configurations/${id}`);
  }

  dupliquerConfiguration(id: string, nouveauNom: string): Observable<ConfigurationProduit> {
    return this.http.post<ConfigurationProduit>(`${this.apiUrl}/configurations/${id}/dupliquer?nouveauNom=${nouveauNom}`, {});
  }

  // Calculs
  executerRegle(request: CalculRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculs/executer`, request, this.httpOptions);
  }

  creerReglePrimeDefaut(): Observable<RegleCalcul> {
    return this.http.post<RegleCalcul>(`${this.apiUrl}/calculs/prime/defaut`, {});
  }

  calculerPrimeExemple(donnees: { [key: string]: any }): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/calculs/prime/calculer`, donnees, this.httpOptions);
  }

  getDonneesExemple(): Observable<{ [key: string]: any }> {
    return this.http.get<{ [key: string]: any }>(`${this.apiUrl}/calculs/exemple/donnees`);
  }

  // Méthodes utilitaires pour la création de configurations
  creerConfigurationVide(produitId: string): ConfigurationProduit {
    return {
      idConfiguration: '',
      produitId: produitId,
      nomConfiguration: 'Nouvelle Configuration',
      description: 'Configuration créée automatiquement',
      champsFormulaire: [],
      reglesCalcul: [],
      workflows: [],
      active: false,
      version: '1.0',
      dateCreation: new Date(),
      dateModification: new Date()
    };
  }

  creerChampFormulaireVide(): ChampFormulaire {
    return {
      idChamp: '',
      nomChamp: '',
      label: '',
      typeChamp: 'TEXTE',
      obligatoire: false,
      valeurParDefaut: '',
      options: [],
      validations: {},
      ordre: 1,
      visible: true,
      description: ''
    };
  }

  creerRegleCalculVide(): RegleCalcul {
    return {
      idRegle: '',
      nomRegle: '',
      typeRegle: 'CALCUL_PRIME',
      formule: '',
      variables: {},
      parametres: {},
      description: '',
      active: true,
      priorite: 1
    };
  }

  creerWorkflowVide(): WorkflowConfig {
    return {
      idWorkflow: '',
      nomWorkflow: '',
      typeWorkflow: 'SOUSCRIPTION',
      etapes: [],
      parametres: {},
      actif: true,
      description: ''
    };
  }
}
