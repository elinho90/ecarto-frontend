import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-progress-trend-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Progression Mensuelle</h3>
        <span class="chart-subtitle">Évolution sur les 6 derniers mois</span>
      </div>
      <div class="chart-body">
        <canvas baseChart
          [data]="chartData"
          type="line"
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
    }
  `]
})
export class ProgressTrendChartComponent {
  @Input() set trendData(value: { months: string[]; projectsCompleted: number[]; avgProgress: number[] }) {
    if (value && value.months.length > 0) {
      this.chartData = {
        labels: value.months,
        datasets: [
          {
            label: 'Projets terminés',
            data: value.projectsCompleted,
            borderColor: '#009460',
            backgroundColor: 'rgba(0, 148, 96, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#009460',
            pointBorderWidth: 2
          },
          {
            label: 'Progression moy. (%)',
            data: value.avgProgress,
            borderColor: '#FF6F00',
            backgroundColor: 'rgba(255, 111, 0, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF6F00',
            pointBorderWidth: 2
          }
        ]
      };
    }
  }

  chartData: ChartData<'line'> = {
    labels: ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'],
    datasets: [
      {
        label: 'Projets terminés',
        data: [2, 3, 1, 4, 2, 5],
        borderColor: '#009460',
        backgroundColor: 'rgba(0, 148, 96, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Progression moy. (%)',
        data: [45, 52, 48, 61, 55, 70],
        borderColor: '#FF6F00',
        backgroundColor: 'rgba(255, 111, 0, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            family: 'Poppins',
            size: 10
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 126, 0.9)',
        titleFont: { family: 'Poppins', weight: 'bold' },
        bodyFont: { family: 'Poppins' },
        cornerRadius: 8,
        padding: 12,
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: 'Poppins', size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { family: 'Poppins', size: 10 }
        }
      }
    }
  };
}
