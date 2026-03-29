import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-project-status-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Répartition des Projets</h3>
        <span class="chart-subtitle">Par statut</span>
      </div>
      <div class="chart-body">
        <canvas baseChart
          [data]="chartData"
          type="doughnut"
          [options]="chartOptions">
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      height: 100%;
      transition: all 0.3s ease;
      border: 1px solid #f0f0f0;
    }
    
    :host-context([data-theme="dark"]) .chart-card {
      background: #22262e;
      border-color: #374151;
    }
    
    .chart-header {
      margin-bottom: 16px;
    }
    
    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: #1A237E;
      margin: 0 0 4px 0;
    }
    
    :host-context([data-theme="dark"]) .chart-title {
      color: #f5f7fa;
    }
    
    .chart-subtitle {
      font-size: 12px;
      color: #6C757D;
    }
    
    :host-context([data-theme="dark"]) .chart-subtitle {
      color: #9aa5b1;
    }
    
    .chart-body {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ProjectStatusChartComponent {
  @Input() set statusData(value: { enCours: number; termine: number; prevu: number; annule: number }) {
    if (value) {
      this.chartData = {
        labels: ['En cours', 'Terminé', 'Prévu', 'Annulé'],
        datasets: [{
          data: [value.enCours, value.termine, value.prevu, value.annule],
          backgroundColor: ['#FF6F00', '#009460', '#3F51B5', '#F44336'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      };
    }
  }

  chartData: ChartData<'doughnut'> = {
    labels: ['En cours', 'Terminé', 'Prévu', 'Annulé'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#FF6F00', '#009460', '#3F51B5', '#F44336'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            family: 'Poppins',
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 126, 0.9)',
        titleFont: { family: 'Poppins', weight: 'bold' },
        bodyFont: { family: 'Poppins' },
        cornerRadius: 8,
        padding: 12
      }
    }
  };
}
