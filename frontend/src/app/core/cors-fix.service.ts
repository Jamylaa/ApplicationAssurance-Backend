import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorsFixService {
  private readonly baseUrl = 'http://localhost:9092';

  constructor(private http: HttpClient) {}

  // Test direct endpoint sans passer par l'interceptor
  testDirectLogin(credentials: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    return this.http.post(`${this.baseUrl}/api/auth/login`, credentials, { 
      headers,
      withCredentials: true 
    });
  }

  testDirectRegister(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    return this.http.post(`${this.baseUrl}/api/auth/register`, userData, { 
      headers,
      withCredentials: true 
    });
  }

  // Test endpoint health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/auth/health`, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    });
  }

  // Test options request (CORS preflight)
  testOptionsRequest(): Observable<any> {
    return this.http.options(`${this.baseUrl}/api/auth/login`, {
      headers: new HttpHeaders({
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      })
    });
  }
}
