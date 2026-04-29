import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PackGarantie } from '../../models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class PackGarantieService {
  private readonly baseUrl = environment.apiUrl.pack;

  constructor(private readonly http: HttpClient) {}

  getAllPackGaranties(): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(this.baseUrl);
  }

  getPackGarantiesByPackId(idPack: string): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(`${this.baseUrl}/pack/${idPack}`).pipe(
      catchError(() => of([] as PackGarantie[]))
    );
  }

  createPackGarantie(packGarantie: PackGarantie, idPack?: string): Observable<PackGarantie> {
    return this.http.post<PackGarantie>(this.baseUrl, packGarantie);
  }

  deletePackGarantie(idPackGarantie: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idPackGarantie}`);
  }

  syncPackGaranties(idPack: string, packGaranties: PackGarantie[]): Observable<PackGarantie[]> {
    const desiredRelations = (packGaranties ?? [])
      .map((relation) => ({ ...relation, packId: idPack }))
      .filter((relation) => Boolean(String(relation.garantieId ?? '').trim()));

    return this.getPackGarantiesByPackId(idPack).pipe(
      switchMap((existingRelations) => {
        const deletions = existingRelations
          .filter((relation) => Boolean(relation.idPackGarantie))
          .map((relation) =>
            this.deletePackGarantie(relation.idPackGarantie as string).pipe(catchError(() => of(null)))
          );

        const runCreates = (): Observable<PackGarantie[]> =>
          desiredRelations.length
            ? forkJoin(
                desiredRelations.map((relation) =>
                  this.createPackGarantie(relation, idPack).pipe(catchError(() => of(relation)))
                )
              )
            : of([] as PackGarantie[]);

        if (!deletions.length) {
          return runCreates();
        }

        return forkJoin(deletions).pipe(switchMap(() => runCreates()));
      })
    );
  }

  deletePackGarantiesByPackId(idPack: string): Observable<unknown[]> {
    return this.getPackGarantiesByPackId(idPack).pipe(
      switchMap((relations) => {
        const deletions = relations
          .filter((relation) => Boolean(relation.idPackGarantie))
          .map((relation) =>
            this.deletePackGarantie(relation.idPackGarantie as string).pipe(catchError(() => of(null)))
          );

        return deletions.length ? forkJoin(deletions) : of([] as unknown[]);
      })
    );
  }
}
