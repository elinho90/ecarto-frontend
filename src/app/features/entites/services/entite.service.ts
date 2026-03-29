import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntiteService {
  private apiUrl = `${environment.apiUrl}/entites`;

  constructor(private http: HttpClient) {}

  getAllEntites(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getEntiteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createEntite(entite: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, entite);
  }

  updateEntite(id: number, entite: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, entite);
  }

  deleteEntite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
