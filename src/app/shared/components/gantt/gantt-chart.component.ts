import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatIconModule],
  template: `
    <div class="gantt-container bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-x-auto min-w-full">
      <div *ngIf="ganttData.length === 0" class="text-center p-8 text-gray-400">
        <mat-icon class="opacity-50 text-4xl mb-2">timeline</mat-icon>
        <p>Aucune donnée de planification chronologique disponible.</p>
      </div>

      <div *ngIf="ganttData.length > 0" class="min-w-[800px]">
        <!-- Entête Chronologique de l'Axe X (Mois / Jours) -->
        <div class="flex border-b pb-2 mb-4 relative" style="margin-left: 200px;">
           <div class="absolute left-0 bottom-1 text-xs text-gray-500 font-bold">Début: {{ minDate | date:'dd/MM/yyyy' }}</div>
           <div class="absolute right-0 bottom-1 text-xs text-gray-500 font-bold">Fin: {{ maxDate | date:'dd/MM/yyyy' }}</div>
           <div class="h-6 w-full bg-gray-50 rounded"></div>
           <!-- Marqueur AUJOURD'HUI -->
           <div *ngIf="todayPercent >= 0 && todayPercent <= 100" 
                class="today-marker" 
                [ngStyle]="{'left.%': todayPercent}"
                matTooltip="Aujourd'hui : {{ today | date:'dd/MM/yyyy' }}">
             <div class="today-label">Auj.</div>
           </div>
        </div>

        <!-- Corps du Diagramme de Gantt -->
        <div class="space-y-4 relative">
          <!-- Ligne verticale Aujourd'hui sur toute la hauteur du corps -->
          <div *ngIf="todayPercent >= 0 && todayPercent <= 100" 
               class="today-line-body" 
               [ngStyle]="{'left': 'calc(200px + ' + todayPercent + '%)'}">
          </div>
          <ng-container *ngFor="let phase of ganttData">
            
            <!-- Barre de Phase Principale -->
            <div class="flex items-center group relative hover:bg-gray-50 rounded transition-colors group">
              <!-- Nom Phase (Axe Y) -->
              <div class="w-[200px] shrink-0 font-bold text-sm text-gray-700 truncate pr-4" [matTooltip]="phase.nom">
                📁 {{ phase.nom }}
              </div>
              
              <!-- Zone de traçage -->
              <div class="flex-1 h-8 relative bg-gray-50/50 border-l border-r border-gray-100">
                <div class="absolute h-6 top-1 rounded-md shadow-sm transition-all flex items-center px-2 text-xs font-bold text-white overflow-hidden cursor-pointer hover:brightness-110"
                     [ngStyle]="{'left.%': phase.leftPercent, 'width.%': phase.widthPercent}"
                     [style.background]="getPhaseColor(phase)"
                     [matTooltip]="'Phase: ' + phase.nom + ' | Progression: ' + phase.progression + '%'">
                  {{ phase.nom }}
                </div>
              </div>
            </div>

            <!-- Barres d'Étapes (Enfants) -->
            <div *ngFor="let etape of phase.etapes" class="flex items-center group relative hover:bg-gray-50 rounded transition-colors pl-4">
              <div class="w-[184px] shrink-0 text-xs text-gray-600 truncate pr-4 flex items-center gap-1" [matTooltip]="etape.nom">
                <mat-icon class="scale-50 opacity-50">{{ getEtapeIcon(etape.statut) }}</mat-icon>
                {{ etape.nom }}
              </div>
              
              <div class="flex-1 h-6 relative border-l border-r border-gray-100 border-opacity-50">
                <div class="absolute h-4 top-1 rounded shadow-sm transition-all cursor-pointer hover:scale-y-110 opacity-90"
                     [ngStyle]="{'left.%': etape.leftPercent, 'width.%': etape.widthPercent}"
                     [style.background]="getEtapeColor(etape.statut)"
                     [matTooltip]="'Étape: ' + etape.nom + ' (Échéance: ' + (etape.dateEcheance | date:'dd/MM') + ')'">
                </div>
              </div>
            </div>
            
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::-webkit-scrollbar { height: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #999; }
    
    .today-marker {
      position: absolute;
      top: -4px;
      bottom: -4px;
      width: 2px;
      background: #ef4444;
      z-index: 10;
      cursor: pointer;
    }
    .today-marker::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -4px;
      width: 10px;
      height: 10px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .today-label {
      position: absolute;
      top: -18px;
      left: -10px;
      font-size: 9px;
      font-weight: 700;
      color: #ef4444;
      white-space: nowrap;
    }
    .today-line-body {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: #ef4444;
      opacity: 0.3;
      z-index: 5;
      pointer-events: none;
    }
  `]
})
export class GanttChartComponent implements OnChanges {
  @Input() phasesData: any[] = [];

  ganttData: any[] = [];
  minDate!: Date;
  maxDate!: Date;
  totalDurationMs: number = 0;
  todayPercent: number = -1;
  today: Date = new Date();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['phasesData'] && this.phasesData != null && this.phasesData.length > 0) {
      this.calculateGantt();
    } else if (!this.phasesData || this.phasesData.length === 0) {
      // Réinitialiser si les données sont retirées
      this.ganttData = [];
    }
  }

  calculateGantt(): void {
    let allDates: number[] = [];

    // Collecter toutes les dates pour déterminer min/max
    this.phasesData.forEach(p => {
      if (p.dateDebutPrevue) allDates.push(new Date(p.dateDebutPrevue).getTime());
      if (p.dateFinPrevue) allDates.push(new Date(p.dateFinPrevue).getTime());
      if (p.dateDebutReelle) allDates.push(new Date(p.dateDebutReelle).getTime());
      if (p.dateFinReelle) allDates.push(new Date(p.dateFinReelle).getTime());

      p.etapes?.forEach((e: any) => {
        if (e.dateEcheance) allDates.push(new Date(e.dateEcheance).getTime());
        if (e.dateRealisation) allDates.push(new Date(e.dateRealisation).getTime());
      });
    });

    if (allDates.length === 0) return;

    this.minDate = new Date(Math.min(...allDates));
    this.maxDate = new Date(Math.max(...allDates));
    
    // Si toutes les dates sont identiques (même jour), on étire légèrement
    if (this.minDate.getTime() === this.maxDate.getTime()) {
      this.minDate.setDate(this.minDate.getDate() - 1);
      this.maxDate.setDate(this.maxDate.getDate() + 1);
    }

    this.totalDurationMs = this.maxDate.getTime() - this.minDate.getTime();

    // Calcul de la position du marqueur "Aujourd'hui"
    this.today = new Date();
    const todayMs = this.today.getTime();
    if (todayMs >= this.minDate.getTime() && todayMs <= this.maxDate.getTime()) {
      this.todayPercent = ((todayMs - this.minDate.getTime()) / this.totalDurationMs) * 100;
    } else {
      this.todayPercent = -1; // Hors du champ visible
    }

    // Map structurée pour le template CSS
    this.ganttData = this.phasesData.map(p => {
      const dDebut = new Date(p.dateDebutReelle || p.dateDebutPrevue || this.minDate).getTime();
      const dFin = new Date(p.dateFinReelle || p.dateFinPrevue || this.maxDate).getTime();
      
      const leftPercent = Math.max(0, ((dDebut - this.minDate.getTime()) / this.totalDurationMs) * 100);
      let widthPercent = Math.max(2, ((dFin - dDebut) / this.totalDurationMs) * 100); 

      const mappedEtapes = (p.etapes || []).map((e: any) => {
        // Hypothèse Gantt : L'étape démarre à la fin de la précédente ou au début de la phase
        // On simplifie pour affichage : point = échéance - (durée ou 3 jours)
        const dEcheance = new Date(e.dateEcheance || dFin).getTime();
        const dRealisation = e.dateRealisation ? new Date(e.dateRealisation).getTime() : null;
        
        let dureeEstMs = (e.dureeEstimeeJours || 1) * 24 * 60 * 60 * 1000;
        let dDebutEtape = dEcheance - dureeEstMs;

        // Limiter pour ne pas sortir du cadre visible du gantt global
        if(dDebutEtape < this.minDate.getTime()) dDebutEtape = this.minDate.getTime();

        const endActual = dRealisation || dEcheance;

        const leftPct = Math.max(0, ((dDebutEtape - this.minDate.getTime()) / this.totalDurationMs) * 100);
        let widthPct = Math.max(1, ((endActual - dDebutEtape) / this.totalDurationMs) * 100);

        return {
          ...e,
          leftPercent: leftPct,
          widthPercent: Math.min(widthPct, 100 - leftPct)
        };
      });

      return {
        ...p,
        leftPercent,
        widthPercent: Math.min(widthPercent, 100 - leftPercent),
        etapes: mappedEtapes
      };
    });
  }

  getPhaseColor(phase: any): string {
    if (phase.progression === 100) return 'linear-gradient(90deg, #10b981 0%, #047857 100%)'; // Vert
    if (phase.progression > 0) return 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'; // Bleu
    return 'linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)'; // Gris (A_VENIR)
  }

  getEtapeColor(statut: string): string {
    switch (statut) {
      case 'VALIDEE': return '#10b981'; // Vert
      case 'EN_COURS': return '#3b82f6'; // Bleu
      case 'EN_ATTENTE_VALIDATION': return '#f59e0b'; // Jaune
      case 'REJETEE': return '#ef4444'; // Rouge
      case 'EN_RETARD': return '#dc2626'; // Rouge foncé
      case 'BLOQUEE': return '#6b7280'; // Gris
      default: return '#d1d5db'; // Gris clair (A_FAIRE)
    }
  }

  getEtapeIcon(statut: string): string {
    switch (statut) {
      case 'VALIDEE': return 'check_circle';
      case 'EN_COURS': return 'play_circle';
      case 'EN_ATTENTE_VALIDATION': return 'hourglass_empty';
      case 'REJETEE': return 'cancel';
      case 'EN_RETARD': return 'warning';
      case 'BLOQUEE': return 'lock';
      default: return 'radio_button_unchecked';
    }
  }
}
