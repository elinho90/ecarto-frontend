import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-budget-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Budget par Type</h3>
        <span class="chart-subtitle">En millions FCFA</span>
      </div>
      <div class="chart-body">
        <canvas baseChart
          [data]="chartData"
          type="bar"
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
export class BudgetChartComponent {
  @Input() set budgetData(value: { labels: string[]; values: number[] }) {
    if (value && value.labels.length > 0) {
      this.chartData = {
        labels: value.labels,
        datasets: [{
          label: 'Budget (M FCFA)',
          data: value.values.map(v => v / 1000000),
          backgroundColor: [
            'rgba(255, 111, 0, 0.8)',
            'rgba(63, 81, 181, 0.8)',
            'rgba(0, 148, 96, 0.8)',
            'rgba(244, 67, 54, 0.8)',
            'rgba(156, 39, 176, 0.8)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }
  }

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Budget (M FCFA)',
      data: [],
      backgroundColor: 'rgba(255, 111, 0, 0.8)',
      borderRadius: 8
    }]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 126, 0.9)',
        titleFont: { family: 'Poppins', weight: 'bold' },
        bodyFont: { family: 'Poppins' },
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context) => `${context.parsed.x.toFixed(1)} M FCFA`
        }
      }
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
          display: false
        },
        ticks: {
          font: { family: 'Poppins', size: 11 }
        }
      }
    }
  };
}
