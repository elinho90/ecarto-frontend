// Dans shared.module.ts, MODIFIEZ :
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './components/ui/button/button.component';
import { CardComponent } from './components/ui/card/card.component';
import { BadgeComponent } from './components/ui/badge/badge.component';
import { LoadingComponent } from './components/ui/loading/loading.component';
import { LogoComponent } from './components/ui/logo/logo.component';
import { KpiWidgetComponent } from './components/widgets/kpi-widget.component';
import { ComparisonChartComponent } from './components/charts/comparison-chart.component';
import { ProjectStatusChartComponent } from './components/charts/project-status-chart.component';
import { BudgetChartComponent } from './components/charts/budget-chart.component';
import { ProgressTrendChartComponent } from './components/charts/progress-trend-chart.component';

@NgModule({
  declarations: [
    // MapComponent est retiré car il est standalone
  ],
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    LoadingComponent,
    LogoComponent,
    KpiWidgetComponent,
    ComparisonChartComponent,
    ProjectStatusChartComponent,
    BudgetChartComponent,
    ProgressTrendChartComponent
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    LoadingComponent,
    LogoComponent,
    KpiWidgetComponent,
    ComparisonChartComponent,
    ProjectStatusChartComponent,
    BudgetChartComponent,
    ProgressTrendChartComponent
  ]
})
export class SharedModule { }