import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-tracker w-full">
      <div class="flex justify-between items-end mb-2">
        <span class="text-sm font-semibold text-gray-700">{{ label }}</span>
        <span class="text-xl font-bold text-blue-900">{{ progression }}%</span>
      </div>
      
      <!-- Progress Bar Track -->
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
        <!-- Progress Fill with Gradient -->
        <div class="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end"
             [ngStyle]="{'width': progression + '%'}"
             [ngClass]="getGradientClass()">
          <!-- Sparkle/Shine effect -->
          <div class="w-full h-full opacity-30 bg-gradient-to-r from-transparent via-white to-transparent" 
               style="animation: shimmer 2s infinite linear;"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `]
})
export class ProgressTrackerComponent {
  @Input() progression: number = 0;
  @Input() label: string = 'Progression Globale';

  getGradientClass(): string {
    if (this.progression >= 100) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (this.progression > 60) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (this.progression > 30) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  }
}
