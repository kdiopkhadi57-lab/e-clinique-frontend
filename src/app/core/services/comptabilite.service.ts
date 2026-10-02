import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComptabiliteResume, Encaissement, PaiementEmploye } from '../models/comptabilite.model';
import { Utilisateur } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ComptabiliteService {
  private apiUrl = `${environment.apiUrl}/comptabilite`;
  private usersUrl = `${environment.apiUrl}/utilisateurs`;
  constructor(private http: HttpClient) {}
  resume(): Observable<ComptabiliteResume> { return this.http.get<ComptabiliteResume>(`${this.apiUrl}/resume`); }
  encaissements(): Observable<Encaissement[]> { return this.http.get<Encaissement[]>(`${this.apiUrl}/encaissements`); }
  paiements(): Observable<PaiementEmploye[]> { return this.http.get<PaiementEmploye[]>(`${this.apiUrl}/paiements`); }
  employes(): Observable<Utilisateur[]> { return this.http.get<Utilisateur[]>(`${this.usersUrl}/employes`); }
  employesPage(page: number, size: number): Observable<{ content: Utilisateur[]; totalPages: number; totalElements: number }> {
    return this.http.get<{ content: Utilisateur[]; totalPages: number; totalElements: number }>(`${this.usersUrl}/employes/page?page=${page}&size=${size}`);
  }
  creerEmploye(employe: any): Observable<Utilisateur> { return this.http.post<Utilisateur>(this.usersUrl, employe); }
  payer(request: any): Observable<PaiementEmploye> { return this.http.post<PaiementEmploye>(`${this.apiUrl}/paiements`, request); }
}