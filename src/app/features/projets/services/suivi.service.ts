import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { PhaseDto } from '../../../shared/models/phase.model';
import { EtapeDto } from '../../../shared/models/etape.model';
import { AlerteDto } from '../../../shared/models/alerte.model';

@Injectable({
  providedIn: 'root'
})
export class SuiviService {
  private apiUrl = `${environment.apiUrl}/suivi`;
  private baseApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ══════════════════════════════════════════════════════════════
  // RÉSUMÉ DU SUIVI
  // ══════════════════════════════════════════════════════════════

  getResumeSuivi(projetId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projets/${projetId}/resume`);
  }

  exportProjetPdf(projetId: number): Observable<Blob> {
    return this.http.get(`${this.baseApiUrl}/export/projets/${projetId}/pdf`, { responseType: 'blob' });
  }

  // ══════════════════════════════════════════════════════════════
  // GESTION DES PHASES
  // ══════════════════════════════════════════════════════════════

  getPhasesByProjet(projetId: number): Observable<PhaseDto[]> {
    return this.http.get<PhaseDto[]>(`${this.baseApiUrl}/phases/projet/${projetId}`);
  }

  creerPhase(projetId: number, phase: Partial<PhaseDto>): Observable<PhaseDto> {
    const payload = { ...phase, projetId };
    return this.http.post<PhaseDto>(`${this.baseApiUrl}/phases`, payload);
  }

  // ══════════════════════════════════════════════════════════════
  // GESTION DES ÉTAPES
  // ══════════════════════════════════════════════════════════════

  getEtapesByPhase(phaseId: number): Observable<EtapeDto[]> {
    return this.http.get<EtapeDto[]>(`${this.baseApiUrl}/etapes/phase/${phaseId}`);
  }

  creerEtape(phaseId: number, etape: Partial<EtapeDto>): Observable<EtapeDto> {
    const payload = { ...etape, phaseId };
    return this.http.post<EtapeDto>(`${this.baseApiUrl}/etapes`, payload);
  }

  soumettreEtapeValidation(etapeId: number, utilisateurId: number, livrableUrl?: string): Observable<EtapeDto> {
    return this.http.post<EtapeDto>(`${this.apiUrl}/etapes/${etapeId}/soumettre`, null, {
      params: { 
        utilisateurId: utilisateurId.toString(),
        ...(livrableUrl && { urlLivrable: livrableUrl })
      }
    });
  }

  validerEtape(etapeId: number, validationDetail: { validateurId: number, decision: string, commentaire: string }): Observable<EtapeDto> {
    return this.http.post<EtapeDto>(`${this.apiUrl}/etapes/${etapeId}/valider`, validationDetail);
  }

  // ══════════════════════════════════════════════════════════════
  // CHANGEMENT DU STATUT GLOBAL (AVEC CONTRÔLE DE VALIDATION)
  // ══════════════════════════════════════════════════════════════

  changerStatutProjet(projetId: number, requestStatus: { nouveauStatut: string, utilisateurId?: number, motif: string }): Observable<any> {
    const params = new HttpParams()
      .set('nouveauStatut', requestStatus.nouveauStatut)
      .set('utilisateurId', requestStatus.utilisateurId?.toString() || '1')
      .set('motif', requestStatus.motif || 'Changement manuel');
      
    return this.http.post<any>(`${this.apiUrl}/projets/${projetId}/statut`, null, { params });
  }

  // ══════════════════════════════════════════════════════════════
  // GESTION DES ALERTES
  // ══════════════════════════════════════════════════════════════
  getAlertesProjet(projetId: number): Observable<AlerteDto[]> {
    return this.http.get<AlerteDto[]>(`${this.baseApiUrl}/alertes/projet/${projetId}`);
  }

  getAlertesNonLuesUtilisateur(userId: number): Observable<AlerteDto[]> {
    return this.http.get<AlerteDto[]>(`${this.baseApiUrl}/alertes/destinataire/${userId}/non-lues`);
  }

  marquerAlerteLue(alerteId: number): Observable<AlerteDto> {
    return this.http.put<AlerteDto>(`${this.baseApiUrl}/alertes/${alerteId}/lire`, {});
  }
}

