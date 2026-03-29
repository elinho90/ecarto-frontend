import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rapport } from '../../../shared/models/rapport.model';
import { Page } from '../../../shared/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private readonly API_URL = 'http://localhost:8080/api/v1/rapports';

  constructor(private http: HttpClient) { }

  getAllRapports(page: number = 0, size: number = 10): Observable<Page<Rapport>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Rapport>>(this.API_URL, { params });
  }

  getRapportById(id: number): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.API_URL}/${id}`);
  }

  createRapport(formData: FormData, uploadePar: string): Observable<Rapport> {
    return this.http.post<Rapport>(`${this.API_URL}?uploadePar=${uploadePar}`, formData);
  }

  updateRapport(id: number, rapport: Partial<Rapport>): Observable<Rapport> {
    return this.http.put<Rapport>(`${this.API_URL}/${id}`, rapport);
  }

  deleteRapport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  searchRapports(criteria: any, page: number = 0, size: number = 10): Observable<Page<Rapport>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (criteria.nom) params = params.set('nom', criteria.nom);
    if (criteria.projetId) params = params.set('projetId', criteria.projetId.toString());
    if (criteria.risque) params = params.set('risque', criteria.risque);

    return this.http.get<Page<Rapport>>(`${this.API_URL}/search`, { params });
  }

  exportRapportPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/export-pdf`, { responseType: 'blob' });
  }

  downloadRapport(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/download/${id}`, { responseType: 'blob' });
  }

  sendRapportByEmail(id: number, email: string, message?: string): Observable<any> {
    let params = new HttpParams().set('email', email);
    if (message) {
      params = params.set('message', message);
    }
    return this.http.post<any>(`${this.API_URL}/${id}/send-email`, {}, { params });
  }
}
