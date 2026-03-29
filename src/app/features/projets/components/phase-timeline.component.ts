import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { PhaseDto } from '../../../shared/models/phase.model';

@Component({
  selector: 'app-phase-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="timeline-container w-full py-6 overflow-x-auto">
      <div class="flex items-center justify-between min-w-[600px] relative px-8">
        <!-- Connecting Line -->
        <div class="absolute inset-y-1/2 left-10 right-10 h-1 bg-gray-200 -z-10 rounded-full"></div>
        
        <div *ngFor="let phase of phases; let last = last" class="relative flex flex-col items-center">
          
          <!-- State Circle -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 shadow-sm cursor-help"
               [ngClass]="getCircleClass(phase.statut || '')"
               [matTooltip]="getTooltipContent(phase)">
            <mat-icon class="text-[20px]">{{ getIcon(phase.statut || '') }}</mat-icon>
          </div>
          
          <!-- Phase Info -->
          <div class="mt-3 text-center w-28">
            <h4 class="text-xs font-bold text-gray-800 uppercase line-clamp-2 leading-tight">{{ phase.nom }}</h4>
            <p class="text-[10px] text-gray-500 mt-1">{{ phase.progression }}% complété</p>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
  `]
})
export class PhaseTimelineComponent {
  @Input() phases: PhaseDto[] = [];

  getCircleClass(statut: string): string {
    switch (statut) {
      case 'TERMINEE': 
        return 'bg-green-500 border-green-200 text-white';
      case 'EN_COURS':
        return 'bg-blue-500 border-blue-200 text-white ring-4 ring-blue-50';
      case 'A_FAIRE':
      default:
        return 'bg-white border-gray-300 text-gray-400';
    }
  }

  getIcon(statut: string): string {
    switch (statut) {
      case 'TERMINEE': return 'done';
      case 'EN_COURS': return 'loop';
      case 'A_FAIRE': return 'hourglass_empty';
      default: return 'radio_button_unchecked';
    }
  }

  getTooltipContent(phase: PhaseDto): string {
    return `${phase.nom}\nStatut: ${phase.statut}\nProgression: ${phase.progression}%`;
  }
}
