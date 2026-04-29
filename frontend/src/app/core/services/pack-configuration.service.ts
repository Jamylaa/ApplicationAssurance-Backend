import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PackGarantie } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PackConfigurationService {
  private readonly api = environment.apiProduit + '/pack-configuration';

  constructor(private readonly http: HttpClient) {}

  ajouterGarantie(
    packId: string,
    garantieId: string,
    data: Partial<PackGarantie>
  ): Observable<PackGarantie> {
    return this.http.post<PackGarantie>(`${this.api}/${packId}/garanties/${garantieId}`, data);
  }

  getGaranties(packId: string): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(`${this.api}/${packId}/garanties`);
  }

  supprimer(packId: string, packGarantieId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${packId}/garanties/${packGarantieId}`);
  }

  calculPrixTotal(packId: string): Observable<number> {
    return this.http.get<number>(`${this.api}/${packId}/prix-total`);
  }
}
