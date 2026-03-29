import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { EtapeDto } from '../../../shared/models/etape.model';

@Component({
  selector: 'app-etape-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="etape-card p-4 rounded-xl border flex items-center justify-between transition-all duration-300 bg-white"
         [ngClass]="getCardBorderClass(etape.statut || '')">
      
      <!-- Left Info -->
      <div class="flex-1 min-w-0 pr-4">
        <div class="flex items-center gap-2 mb-1">
          <mat-icon *ngIf="etape.bloquante" color="warn" class="text-[16px] text-red-500" matTooltip="Étape bloquante">lock</mat-icon>
          <h4 class="font-bold text-gray-800 text-sm truncate m-0" [matTooltip]="etape.nom">{{ etape.nom }}</h4>
        </div>
        <div class="text-xs text-gray-500 flex items-center gap-3">
          <span class="flex items-center gap-1">
            <mat-icon class="text-[14px]">event</mat-icon>
            {{ etape.dateEcheance | date:'dd/MM/yyyy' }}
          </span>
          <span class="flex items-center gap-1" *ngIf="etape.responsableNom">
            <mat-icon class="text-[14px]">person</mat-icon>
            {{ etape.responsableNom }}
          </span>
        </div>
        
        <!-- Alerte Retard -->
        <div *ngIf="etape.enRetard" class="mt-2 text-xs text-red-600 bg-red-50 inline-flex items-center px-2 py-0.5 rounded font-medium border border-red-100">
          <mat-icon class="text-[14px] mr-1">warning</mat-icon> Retard de {{ etape.joursRetard }} jours
        </div>
      </div>
      
      <!-- Middle Status Badge -->
      <div class="flex-none px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mx-4 text-center w-32"
           [ngClass]="getBadgeClass(etape.statut || '')">
        {{ formatStatut(etape.statut || '') }}
      </div>

      <!-- Right Actions -->
      <div class="flex-none w-28 flex justify-end">
        <button *ngIf="canSubmit(etape.statut || '')"
                mat-stroked-button color="primary" class="w-full text-xs"
                (click)="onSoumettre.emit(etape)">
          SOUMETTRE
        </button>

        <button *ngIf="canValidate(etape.statut || '')"
                mat-flat-button color="accent" class="w-full text-xs"
                (click)="onValider.emit(etape)">
          VALIDER
        </button>
      </div>
      
    </div>
  `,
  styles: [`
    .etape-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  `]
})
export class EtapeCardComponent {
  @Input() etape!: EtapeDto;
  @Output() onSoumettre = new EventEmitter<EtapeDto>();
  @Output() onValider = new EventEmitter<EtapeDto>();

  getCardBorderClass(statut: string): string {
    switch (statut) {
      case 'EN_RETARD': return 'border-l-4 border-l-red-500 border-red-200';
      case 'VALIDEE': return 'border-l-4 border-l-green-500 border-gray-200';
      case 'EN_ATTENTE_VALIDATION': return 'border-l-4 border-l-yellow-500 border-yellow-200';
      case 'BLOQUEE': return 'border-l-4 border-l-gray-400 opacity-60 bg-gray-50';
      default: return 'border-l-4 border-l-blue-500 border-blue-100';
    }
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'VALIDEE': return 'bg-green-100 text-green-700';
      case 'EN_RETARD': return 'bg-red-100 text-red-700';
      case 'EN_ATTENTE_VALIDATION': return 'bg-yellow-100 text-yellow-800';
      case 'REJETEE': return 'bg-orange-100 text-orange-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-700';
      case 'BLOQUEE': return 'bg-gray-200 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  formatStatut(statut: string): string {
    return statut.replace(/_/g, ' ');
  }

  canSubmit(statut: string): boolean {
    return ['A_FAIRE', 'EN_COURS', 'REJETEE'].includes(statut);
  }

  canValidate(statut: string): boolean {
    return statut === 'EN_ATTENTE_VALIDATION';
  }
}
