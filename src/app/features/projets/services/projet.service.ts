import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../../../shared/models/projet.model';
import { Page } from '../../../shared/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private readonly API_URL = 'http://localhost:8080/api/v1/projets';

  constructor(private http: HttpClient) { }

  getAllProjets(page: number = 0, size: number = 10): Observable<Page<Projet>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Projet>>(this.API_URL, { params });
  }

  getProjetById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.API_URL}/${id}`);
  }

  createProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.API_URL, projet);
  }

  updateProjet(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.API_URL}/${id}`, projet);
  }

  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  generateReport(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/report`, { responseType: 'blob' });
  }

  exportProjetsExcel(): Observable<Blob> {
    return this.http.get(`http://localhost:8080/api/v1/export/projets/excel`, { responseType: 'blob' });
  }

  sendReport(id: number, email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${id}/report/send?email=${email}`, {});
  }

  searchProjects(criteria: any, page: number = 0, size: number = 10): Observable<Page<Projet>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (criteria.nom) params = params.set('nom', criteria.nom);
    if (criteria.statut) params = params.set('statut', criteria.statut);
    if (criteria.responsable) params = params.set('responsable', criteria.responsable);
    if (criteria.typeProjetId) params = params.set('typeProjetId', criteria.typeProjetId.toString());
    if (criteria.dateDebutFrom) params = params.set('dateDebutFrom', criteria.dateDebutFrom);
    if (criteria.dateDebutTo) params = params.set('dateDebutTo', criteria.dateDebutTo);
    if (criteria.budgetMin) params = params.set('budgetMin', criteria.budgetMin.toString());
    if (criteria.budgetMax) params = params.set('budgetMax', criteria.budgetMax.toString());

    return this.http.get<Page<Projet>>(`${this.API_URL}/search`, { params });
  }

  updateProjectProgress(id: number, progress: number): Observable<Projet> {
    return this.http.patch<Projet>(`${this.API_URL}/${id}/progression?progress=${progress}`, {});
  }

  getProjectsByStatus(status: string, page: number = 0, size: number = 10): Observable<Page<Projet>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Projet>>(`${this.API_URL}/status/${status}`, { params });
  }

  getProjectEvolution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/evolution`);
  }

  getProjectsByTypeStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats-by-type`);
  }

  getBudgetStatisticsByStatus(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/budget-statistics`);
  }

  getProjectStatistics(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/statistics`);
  }
}
