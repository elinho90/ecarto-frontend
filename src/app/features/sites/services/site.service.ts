import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Site } from '../../../shared/models/site.model';
import { Page } from '../../../shared/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private readonly API_URL = 'http://localhost:8080/api/v1/sites';

  constructor(private http: HttpClient) { }

  getAllSites(page: number = 0, size: number = 10): Observable<Page<Site>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Site>>(this.API_URL, { params });
  }

  // For map display - get all sites without pagination
  getAllSitesForMap(): Observable<Site[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000'); // Large page size to get all sites
    return this.http.get<Page<Site>>(this.API_URL, { params }).pipe(
      map(page => page.content)
    );
  }

  getSiteById(id: number): Observable<Site> {
    return this.http.get<Site>(`${this.API_URL}/${id}`);
  }

  createSite(site: Site): Observable<Site> {
    return this.http.post<Site>(this.API_URL, site);
  }

  updateSite(id: number, site: Site): Observable<Site> {
    return this.http.put<Site>(`${this.API_URL}/${id}`, site);
  }

  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getSitesForMap(filters?: {
    type?: string;
    statut?: string;
    region?: string;
    ville?: string;
  }): Observable<Site[]> {
    let params = new HttpParams()
      .set('page', '0')
      .set('size', '1000');

    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.region) params = params.set('region', filters.region);
    if (filters?.ville) params = params.set('ville', filters.ville);

    return this.http.get<Page<Site>>(this.API_URL, { params }).pipe(
      map(page => page.content)
    );
  }

  getRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/regions`);
  }

  getVillesByRegion(region: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/regions/${region}/villes`);
  }
}
