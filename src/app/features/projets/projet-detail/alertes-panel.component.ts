import { Component, Input, OnInit, OnChanges, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SuiviService } from '../services/suivi.service';
import { WsNotificationService } from '../../../shared/services/ws-notification.service';
import { AlerteDto } from '../../../shared/models/alerte.model';

@Component({
  selector: 'app-alertes-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="alertes-container space-y-3">
      <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        <mat-icon color="warn">notifications_active</mat-icon>
        Alertes Actives ({{ alertesNonLues }})
      </h3>

      <div *ngIf="alertes.length === 0" class="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
        Aucune alerte pour l'instant. Tout se déroule comme prévu !
      </div>

      <div *ngFor="let alerte of alertes" 
           class="alerte-card p-3 rounded-lg border flex items-start gap-3 transition-colors duration-200"
           [ngClass]="getAlerteClass(alerte.niveau, alerte.lue)">
        
        <mat-icon [class]="getIconClass(alerte.niveau)">{{ getIcon(alerte.niveau) }}</mat-icon>
        
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h4 class="font-semibold text-sm m-0">{{ formatType(alerte.type || '') }}</h4>
            <span class="text-xs text-gray-400 whitespace-nowrap">{{ alerte.createdAt | date:'short' }}</span>
          </div>
          <p class="text-sm mt-1 mb-2">{{ alerte.message }}</p>
          <div class="text-xs font-medium" *ngIf="alerte.etapeNom">
            Étape concernée : <span class="bg-gray-100 px-1 py-0.5 rounded">{{ alerte.etapeNom }}</span>
          </div>
        </div>

        <button *ngIf="!alerte.lue" mat-icon-button class="shrink-0 scale-75" color="primary" 
                matTooltip="Marquer comme lue" (click)="marquerLue(alerte)">
          <mat-icon>done</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .border-info { border-color: #93c5fd; background-color: #eff6ff; }
    .border-warning { border-color: #fde047; background-color: #fefce8; }
    .border-important { border-color: #fdba74; background-color: #fff7ed; }
    .border-urgent { border-color: #fca5a5; background-color: #fef2f2; }
    .border-critique { border-color: #ef4444; background-color: #fee2e2; border-width: 2px; }
    .opacity-60 { opacity: 0.6; }
  `]
})
export class AlertesPanelComponent implements OnInit, OnChanges {
  @Input() projetId!: number;

  alertes: AlerteDto[] = [];
  alertesNonLues: number = 0;

  private suiviService = inject(SuiviService);
  private wsNotification = inject(WsNotificationService);
  // DestroyRef permet de nettoyer automatiquement tous les observables quand le composant est détruit
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (this.projetId) {
      this.chargerAlertes();
    }

    // takeUntilDestroyed(this.destroyRef) : auto-unsubscribe propre, sans ngOnDestroy manuel
    this.wsNotification.watchProjets()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => {
        if (msg && msg.projetId === this.projetId) {
          this.chargerAlertes();
        }
      });

    this.wsNotification.watchMesAlertes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((alerte: any) => {
        if (alerte && alerte.projetId === this.projetId) {
          // Optimisation WebSocket: Injecter l'alerte reçue directement dans le tableau plutôt que de tout recharger
          const alerteCast = alerte as AlerteDto;
          const existIndex = this.alertes.findIndex(a => a.id === alerteCast.id);
          if (existIndex !== -1) {
            this.alertes[existIndex] = alerteCast;
          } else {
            this.alertes.unshift(alerteCast);
          }
          this.alertesNonLues = this.alertes.filter(a => !a.lue).length;
        }
      });
  }

  ngOnChanges(): void {
    if (this.projetId) {
      this.chargerAlertes();
    }
  }

  chargerAlertes(): void {
    this.suiviService.getAlertesProjet(this.projetId).subscribe({
      next: (data: AlerteDto[]) => {
        this.alertes = data;
        this.alertesNonLues = this.alertes.filter(a => !a.lue).length;
      },
      error: (e) => console.error("Erreur de récupération des alertes", e)
    });
  }

  marquerLue(alerte: AlerteDto): void {
    if (!alerte.id) return;
    this.suiviService.marquerAlerteLue(alerte.id).subscribe({
      next: () => {
        alerte.lue = true;
        this.alertesNonLues = this.alertes.filter(a => !a.lue).length;
      }
    });
  }

  getAlerteClass(niveau: string, lue: boolean): string {
    let classes = '';
    if (lue) classes += ' opacity-60 bg-gray-50 border-gray-200';
    else {
      switch (niveau) {
        case 'INFORMATION': classes += ' border-info'; break;
        case 'AVERTISSEMENT': classes += ' border-warning'; break;
        case 'IMPORTANT': classes += ' border-important'; break;
        case 'URGENT': classes += ' border-urgent'; break;
        case 'CRITIQUE': classes += ' border-critique'; break;
        default: classes += ' border-info';
      }
    }
    return classes;
  }

  getIconClass(niveau: string): string {
    switch (niveau) {
      case 'INFORMATION': return 'text-blue-500';
      case 'AVERTISSEMENT': return 'text-yellow-500';
      case 'IMPORTANT': return 'text-orange-500';
      case 'URGENT': return 'text-red-500';
      case 'CRITIQUE': return 'text-red-700 animate-pulse';
      default: return 'text-blue-500';
    }
  }

  getIcon(niveau: string): string {
    switch (niveau) {
      case 'INFORMATION': return 'info';
      case 'AVERTISSEMENT': return 'warning_amber';
      case 'IMPORTANT': return 'error_outline';
      case 'URGENT': return 'error';
      case 'CRITIQUE': return 'campaign';
      default: return 'info';
    }
  }

  formatType(type: string): string {
    return type.replace(/_/g, ' ');
  }
}
