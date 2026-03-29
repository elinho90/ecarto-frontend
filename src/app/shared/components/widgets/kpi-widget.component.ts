import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-kpi-widget',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatCardModule],
    template: `
    <div class="kpi-card mat-elevation-z1" [ngClass]="color">
      <div class="kpi-content">
        <div class="kpi-info">
          <p class="kpi-label">{{ label }}</p>
          <h3 class="kpi-value">{{ value }}</h3>
          <div class="kpi-trend" *ngIf="trend !== undefined" [ngClass]="{'positive': trend > 0, 'negative': trend < 0, 'neutral': trend === 0}">
            <mat-icon>{{ getTrendIcon() }}</mat-icon>
            <span>{{ Math.abs(trend) }}% {{ trendLabel }}</span>
          </div>
        </div>
        <div class="kpi-icon-wrapper">
          <mat-icon class="kpi-icon">{{ icon }}</mat-icon>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .kpi-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      height: 100%;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-left: 4px solid transparent;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }

      &.primary { border-left-color: #1A237E; .kpi-icon { color: #1A237E; } }
      &.accent { border-left-color: #FF6F00; .kpi-icon { color: #FF6F00; } }
      &.success { border-left-color: #009460; .kpi-icon { color: #009460; } }
      &.warn { border-left-color: #f44336; .kpi-icon { color: #f44336; } }
      &.info { border-left-color: #2196F3; .kpi-icon { color: #2196F3; } }
    }

    .kpi-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      z-index: 1;
    }

    .kpi-label {
      font-size: 14px;
      font-weight: 500;
      color: #6c757d;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .kpi-icon-wrapper {
      background: rgba(0,0,0,0.03);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      gap: 4px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.positive { color: #009460; }
      &.negative { color: #f44336; }
      &.neutral { color: #6c757d; }
    }
  `]
})
export class KpiWidgetComponent {
    @Input() label: string = '';
    @Input() value: string | number = 0;
    @Input() icon: string = 'analytics';
    @Input() color: 'primary' | 'accent' | 'success' | 'warn' | 'info' = 'primary';
    @Input() trend?: number;
    @Input() trendLabel: string = 'vs mois dernier';

    protected readonly Math = Math;

    getTrendIcon(): string {
        if (this.trend === undefined || this.trend === 0) return 'remove';
        return this.trend > 0 ? 'trending_up' : 'trending_down';
    }
}
