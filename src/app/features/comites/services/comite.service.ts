import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComiteService {
  private apiUrl = `${environment.apiUrl}/comites`;

  constructor(private http: HttpClient) {}

  getAllComites(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getComiteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createComite(comite: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, comite);
  }

  updateComite(id: number, comite: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, comite);
  }

  deleteComite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
