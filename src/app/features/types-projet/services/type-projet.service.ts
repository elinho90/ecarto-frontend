import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeProjet } from '../../../shared/models/type-projet.model';
import { Page } from '../../../shared/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class TypeProjetService {
  private readonly API_URL = 'http://localhost:8080/api/types-projet';

  constructor(private http: HttpClient) { }

  getAllTypesProjet(): Observable<TypeProjet[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(res => {
        if (res && res.content) return res.content;
        if (Array.isArray(res)) return res;
        if (res && res.data) return res.data;
        return [];
      })
    );
  }

  getTypeProjetById(id: number): Observable<TypeProjet> {
    return this.http.get<TypeProjet>(`${this.API_URL}/${id}`);
  }

  createTypeProjet(typeProjet: TypeProjet): Observable<TypeProjet> {
    return this.http.post<TypeProjet>(this.API_URL, typeProjet);
  }

  updateTypeProjet(id: number, typeProjet: TypeProjet): Observable<TypeProjet> {
    return this.http.put<TypeProjet>(`${this.API_URL}/${id}`, typeProjet);
  }
}