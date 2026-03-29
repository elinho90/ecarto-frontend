import { Injectable, inject } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from '../../../environments/environment';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import SockJS from 'sockjs-client';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WsNotificationService {
  private rxStomp: RxStomp;
  private authService = inject(AuthService);

  constructor() {
    this.rxStomp = new RxStomp();
    this.initStomp();
  }

  private initStomp() {
    // Configuration de RxStomp
    this.rxStomp.configure({
      // Pour utiliser SockJS comme fallback (car withSockJS() côté Spring)
      webSocketFactory: () => new SockJS(environment.wsUrl),
      
      // On peut passer le token JWT si on veut sécuriser le WS 
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getToken()}`
      },

      // Heartbeat toutes les 20s
      heartbeatIncoming: 0, 
      heartbeatOutgoing: 20000,
      
      // Reconnexion automatique toutes les 5 secondes
      reconnectDelay: 5000,
      
      // Mettre true pour voir les logs WS en dev
      debug: (msg: string): void => {
        if (!environment.production) {
          console.log(new Date(), msg);
        }
      }
    });

    this.rxStomp.activate();
  }

  /**
   * Écoute les diffusions générales des projets (changement statut, progression)
   */
  public watchProjets(): Observable<any> {
    return this.rxStomp.watch('/topic/projets').pipe(
      map(message => JSON.parse(message.body))
    );
  }

  /**
   * Écoute les alertes globales associées d'un projet spécifique
   */
  public watchAlertesProjet(projetId: number): Observable<any> {
    return this.rxStomp.watch(`/topic/projets/${projetId}/alertes`).pipe(
      map(message => JSON.parse(message.body))
    );
  }

  /**
   * Écoute les alertes personnelles de l'utilisateur
   */
  public watchMesAlertes(): Observable<any> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      // L'utilisateur n'est pas encore identifié — on retourne un Observable vide (pas d'exception)
      return EMPTY;
    }
    return this.rxStomp.watch(`/user/${userId}/queue/alertes`).pipe(
      map(message => JSON.parse(message.body))
    );
  }

  /**
   * Fermer la connexion quand on n'en a plus besoin (ex: logout)
   */
  public deactivate() {
    this.rxStomp.deactivate();
  }
}
