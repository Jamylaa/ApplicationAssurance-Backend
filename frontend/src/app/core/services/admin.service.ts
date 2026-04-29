import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Admin {
  idUser?: string;
  username: string;
  email: string;
  password?: string;
  phone: number;
  departement?: string;
  role?: string;
  actif?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = `${environment.apiUser}/admins`;

  constructor(private http: HttpClient) {}

  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.baseUrl}/getAllAdmins`);
  }

  getAdminById(idUser: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.baseUrl}/getAdminById/${idUser}`);
  }

  createAdmin(admin: Admin): Observable<Admin> {
    return this.http.post<Admin>(`${this.baseUrl}/createAdmin`, admin);
  }

  updateAdmin(idUser: string, admin: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.baseUrl}/${idUser}`, admin);
  }

  deleteAdmin(idUser: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${idUser}`);
  }
}