import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  idUser?: string;
  userName: string;
  email: string;
  password?: string;
  phone?: number;
  dateCreation?: Date;
  departement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GestionUserService {
  private readonly apiUrl = environment.apiUser;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Authentification
  login(credentials: { userName: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials);
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/refresh`, { refreshToken });
  }

  // Gestion des utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/users`, user, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/api/users/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/users/email/${email}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserByUserName(userName: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/users/username/${userName}`, {
      headers: this.getAuthHeaders()
    });
  }

  existsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/api/users/exists/email/${email}`, {
      headers: this.getAuthHeaders()
    });
  }

  existsByUserName(userName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/api/users/exists/username/${userName}`, {
      headers: this.getAuthHeaders()
    });
  }
}
