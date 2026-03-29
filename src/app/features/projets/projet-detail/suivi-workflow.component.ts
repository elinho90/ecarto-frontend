import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { ValidationDialogComponent } from './validation-dialog.component';
import { AlertesPanelComponent } from './alertes-panel.component';
import { GanttChartComponent } from '../../../shared/components/gantt/gantt-chart.component';
import { PhaseTimelineComponent } from '../components/phase-timeline.component';
import { EtapeCardComponent } from '../components/etape-card.component';
import { ProgressTrackerComponent } from '../components/progress-tracker.component';

import { SuiviService } from '../services/suivi.service';
import { WsNotificationService } from '../../../shared/services/ws-notification.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PhaseDto } from '../../../shared/models/phase.model';
import { EtapeDto } from '../../../shared/models/etape.model';

@Component({
  selector: 'app-suivi-workflow',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule, 
    MatDialogModule, 
    AlertesPanelComponent,
    GanttChartComponent,
    PhaseTimelineComponent,
    EtapeCardComponent,
    ProgressTrackerComponent
  ],
  template: `
    <div class="suivi-container space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Colonne Gauche: Résumé & Events -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Zone d'information en temps réel -->
          <mat-card *ngIf="lastEvent" class="bg-blue-50 border-blue-200 shadow-sm transition-all duration-300">
            <mat-card-content class="flex items-center gap-4 py-3">
              <mat-icon color="primary" class="animate-bounce">notifications_active</mat-icon>
              <span class="text-blue-800 font-medium whitespace-pre-line">{{ lastEvent }}</span>
            </mat-card-content>
          </mat-card>

          <!-- Résumé du projet -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" *ngIf="resume">
            <div class="stat-box bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
              <span class="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Phases</span>
              <span class="text-3xl font-bold text-gray-800">{{ resume.totalPhases }}</span>
            </div>
            <div class="stat-box bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
              <span class="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Étapes</span>
              <span class="text-3xl font-bold text-gray-800">{{ resume.totalEtapes }}</span>
            </div>
            <div class="stat-box bg-white p-4 rounded-xl border border-green-100 bg-green-50 shadow-sm flex flex-col justify-center items-center">
              <span class="text-green-600 font-bold text-xs mb-1 uppercase tracking-wider flex items-center gap-1"><mat-icon class="scale-75">check_circle</mat-icon> Validées</span>
              <span class="text-3xl font-extrabold text-green-700">{{ resume.etapesValidees }}</span>
            </div>
            <div class="stat-box bg-white p-4 rounded-xl border border-red-100 bg-red-50 shadow-sm flex flex-col justify-center items-center">
              <span class="text-red-500 font-bold text-xs mb-1 uppercase tracking-wider flex items-center gap-1"><mat-icon class="scale-75">warning</mat-icon> En Retard</span>
              <span class="text-3xl font-extrabold text-red-600">{{ resume.etapesEnRetard }}</span>
            </div>
            
            <div class="col-span-2 sm:col-span-4 mt-2">
              <button mat-stroked-button color="primary" class="w-full" (click)="downloadPdf()">
                 <mat-icon>picture_as_pdf</mat-icon> Télécharger Fiche Projet (PDF)
              </button>
            </div>
          </div>
        </div>

        <!-- Colonne Droite: Alertes temps réel -->
        <div class="lg:col-span-1 border-l pl-4">
           <app-alertes-panel [projetId]="projetId"></app-alertes-panel>
        </div>

      </div>

      <!-- Diagramme de Gantt interactif -->
      <app-gantt-chart *ngIf="phases && phases.length > 0" [phasesData]="phases"></app-gantt-chart>
      
      <!-- Timeline des Phases -->
      <app-phase-timeline *ngIf="phases && phases.length > 0" [phases]="phases"></app-phase-timeline>

      <!-- Liste structurée des Phases et Étapes -->
      <div *ngFor="let phase of phases" class="phase-card">
        <div class="phase-header justify-between items-center bg-gray-50 border-b p-4">
          <div class="w-1/2">
            <h3 class="font-bold text-lg text-gray-800">{{ phase.nom }}</h3>
            <p class="text-sm text-gray-500">{{ phase.dateDebutPrevue | date }} - {{ phase.dateFinPrevue | date }}</p>
          </div>
          <div class="w-1/3">
             <app-progress-tracker [progression]="phase.progression || 0" label="Progression de la phase"></app-progress-tracker>
          </div>
        </div>
        
        <div class="p-4 space-y-3 bg-gray-50/30">
          <app-etape-card *ngFor="let etape of getEtapesOf(phase.id)" 
                          [etape]="etape" 
                          (onSoumettre)="soumettreEtape($event)"
                          (onValider)="validerEtape($event)">
          </app-etape-card>

          <div *ngIf="getEtapesOf(phase.id).length === 0" class="text-sm text-gray-400 italic text-center py-4 bg-white rounded-lg border border-dashed">
             Aucune étape pour l'instant.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-box {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      background: white;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .phase-card {
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .phase-header { display: flex; }
    
    .etape-row {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: #f9fafb;
      border-left: 4px solid #cbd5e1;
      border-radius: 4px;
    }

    /* Couleurs de bordure statuts */
    .border-validee { border-left-color: #10b981; }
    .border-attente { border-left-color: #f59e0b; }
    .border-retard { border-left-color: #ef4444; }
    .border-bloquee { border-left-color: #94a3b8; opacity: 0.7;}
    
    /* Couleurs de texte statuts */
    .text-validee { color: #10b981; }
    .text-attente { color: #f59e0b; }
    .text-retard { color: #ef4444; }
  `]
})
export class SuiviWorkflowComponent implements OnInit, OnDestroy {
  @Input() projetId!: number;

  resume: any;
  phases: PhaseDto[] = [];
  etapesMap: Map<number, EtapeDto[]> = new Map();
  lastEvent: string | null = null;
  
  private wsSubscription?: Subscription;

  private suiviService = inject(SuiviService);
  private wsService = inject(WsNotificationService);
  private authService = inject(AuthService);
  private snackBox = inject(MatSnackBar);

  ngOnInit() {
    this.chargerDonnees();
    this.souscrireWebsockets();
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  chargerDonnees() {
    this.suiviService.getResumeSuivi(this.projetId).subscribe({
      next: (res) => this.resume = res,
      error: (err) => console.error('Erreur getResumeSuivi', err)
    });

    this.suiviService.getPhasesByProjet(this.projetId).subscribe(phases => {
      this.phases = phases;
      phases.forEach(p => {
        if (p.id !== undefined) {
          this.suiviService.getEtapesByPhase(p.id).subscribe(etapes => {
            if (p.id !== undefined) {
               this.etapesMap.set(p.id, etapes);
            }
          });
        }
      });
    });
  }

  souscrireWebsockets() {
    // Écoute les diffusions globales de ce projet via WS
    this.wsSubscription = this.wsService.watchProjets().subscribe((message: any) => {
      if (message.projetId === this.projetId) {
        this.snackBox.open('Mis à jour en temps réel: ' + message.type, 'OK', { duration: 3000 });
        this.lastEvent = '[' + new Date().toLocaleTimeString() + '] ' + message.message;
        this.chargerDonnees(); // Rafraîchir
      }
    });

    // Écouter les alertes — capturé dans wsSubscription pour cleanup à la destruction
    this.wsSubscription.add(
      this.wsService.watchMesAlertes().subscribe((alerte: any) => {
        if (alerte && alerte.projetId === this.projetId) {
          this.lastEvent = '⚠️ [ALERTE] ' + alerte.message;
        }
      })
    );
  }

  getEtapesOf(phaseId: number | undefined): EtapeDto[] {
    if (phaseId === undefined) return [];
    return this.etapesMap.get(phaseId) || [];
  }

  getEtapeBorderClass(statut: string): string {
    if (statut === 'VALIDEE') return 'border-validee';
    if (statut === 'EN_ATTENTE_VALIDATION') return 'border-attente';
    if (statut === 'EN_RETARD') return 'border-retard';
    if (statut === 'BLOQUEE') return 'border-bloquee';
    return '';
  }

  getEtapeTextClass(statut: string): string {
    if (statut === 'VALIDEE') return 'text-validee';
    if (statut === 'EN_ATTENTE_VALIDATION') return 'text-attente';
    if (statut === 'EN_RETARD') return 'text-retard';
    return 'text-gray-500';
  }

  soumettreEtape(etape: EtapeDto) {
    const usrId = this.authService.getCurrentUser()?.id;
    if (!usrId || etape.id === undefined) return;

    this.suiviService.soumettreEtapeValidation(etape.id, usrId).subscribe({
      next: () => {
         this.snackBox.open('Étape soumise pour validation !', 'Fermer', { duration: 3000 });
         this.chargerDonnees();
      },
      error: (e) => this.snackBox.open(e.error?.message || 'Erreur', 'OK', {duration: 3000})
    });
  }

  private dialog = inject(MatDialog);

  validerEtape(etape: EtapeDto) {
    const usrId = this.authService.getCurrentUser()?.id;
    if (!usrId || etape.id === undefined) return;

    const dialogRef = this.dialog.open(ValidationDialogComponent, {
      width: '500px',
      data: { etapeNom: etape.nom }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && etape.id !== undefined) {
        this.suiviService.validerEtape(etape.id, {
          validateurId: usrId,
          decision: result.decision,
          commentaire: result.commentaire
        }).subscribe({
          next: () => {
             this.snackBox.open('Étape traitée avec la décision : ' + result.decision, 'Fermer', { duration: 3000 });
             this.chargerDonnees();
          },
          error: (e) => this.snackBox.open(e.error?.message || 'Erreur', 'OK', {duration: 3000})
        });
      }
    });
  }

  downloadPdf(): void {
    this.suiviService.exportProjetPdf(this.projetId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fiche_projet_${this.projetId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackBox.open('Fiche PDF générée et téléchargée', 'Fermer', {duration: 3000});
      },
      error: () => {
        this.snackBox.open('Erreur lors de la génération PDF', 'Fermer', {duration: 3000});
      }
    });
  }
}
