import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
    selector: 'app-comparison-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
    styles: [`
    .chart-container {
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 300px;
    }
  `]
})
export class ComparisonChartComponent implements OnChanges {
    @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

    @Input() data: { labels: string[], datasets: { label: string, data: number[], color: string }[] } = { labels: [], datasets: [] };
    @Input() title: string = '';

    private chart?: Chart;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.chart) {
            this.updateChart();
        }
    }

    ngAfterViewInit(): void {
        this.createChart();
    }

    private createChart(): void {
        if (!this.chartCanvas) return;

        const ctx = this.chartCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: this.data.labels,
                datasets: this.data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: ds.color,
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1A237E',
                        bodyColor: '#424242',
                        borderColor: 'rgba(0,0,0,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        };

        this.chart = new Chart(ctx, config);
    }

    private updateChart(): void {
        if (this.chart) {
            this.chart.data.labels = this.data.labels;
            this.chart.data.datasets = this.data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.color,
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            }));
            this.chart.update();
        }
    }
}
