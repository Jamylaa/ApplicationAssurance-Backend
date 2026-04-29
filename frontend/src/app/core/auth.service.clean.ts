import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Utilisateur {
  id?: string;
  userName: string;
  email?: string;
  nom?: string;
  prenom?: string;
  departement?: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  utilisateur: Utilisateur;
}

@Injectable({
  providedIn: 'root'
})
export class AuthServiceClean {
  private readonly apiUrl = environment.apiUser;
  private currentUserSubject: BehaviorSubject<Utilisateur | null>;
  public currentUser: Observable<Utilisateur | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<Utilisateur | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    const currentUser = this.currentUserValue;
    const token = localStorage.getItem('token');
    return currentUser !== null && token !== null;
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest, httpOptions)
      .pipe(
        tap(response => {
          const user = response.utilisateur;
          const token = response.token;
          
          if (!user || !token) {
            throw new Error('Réponse serveur invalide');
          }
          
          this.storeTokens(token, response.refreshToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(res => {
          if (res.token) {
            this.storeTokens(res.token, res.refreshToken);
          }
        }),
        catchError(error => {
          this.logout();
          throw error;
        })
      );
  }

  private storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUser(): Utilisateur | null {
    return this.currentUserValue;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  refreshCurrentUser(): void {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      this.currentUserSubject.next(currentUser);
    }
  }
}
