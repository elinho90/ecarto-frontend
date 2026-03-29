import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { ProjetService } from '../projets/services/projet.service';
import { SiteService } from '../sites/services/site.service';
import { UtilisateurService } from '../utilisateurs/services/utilisateur.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StatutProjet } from '../../shared/enums/statut-projet.enum';
import { WsNotificationService } from '../../shared/services/ws-notification.service';
import { AuthService } from '../../auth/services/auth.service';
import { SuiviService } from '../projets/services/suivi.service';
import { AlerteDto } from '../../shared/models/alerte.model';

// Chart.js imports
import { Chart, registerables } from 'chart.js';
import { ProjectStatusChartComponent } from '../../shared/components/charts/project-status-chart.component';
import { BudgetChartComponent } from '../../shared/components/charts/budget-chart.component';
import { ProgressTrendChartComponent } from '../../shared/components/charts/progress-trend-chart.component';
import { KpiWidgetComponent } from '../../shared/components/widgets/kpi-widget.component';
import { ComparisonChartComponent } from '../../shared/components/charts/comparison-chart.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    ProjectStatusChartComponent,
    BudgetChartComponent,
    ProgressTrendChartComponent,
    KpiWidgetComponent,
    ComparisonChartComponent
  ],
  template: `
    <div class="dashboard-container animate-fade-in">
      
      <!-- KPI Widgets Section -->
      <div class="kpi-grid">
        <div class="kpi-clickable" (click)="navigateTo('/dashboard/projets')">
          <app-kpi-widget
            label="Projets Actifs"
            [value]="stats.activeProjects"
            icon="assignment"
            color="primary"
            [trend]="stats.projectsTrend"
            trendLabel="vs mois dernier">
          </app-kpi-widget>
        </div>

        <div class="kpi-clickable" (click)="navigateTo('/dashboard/projets')" *ngIf="isAdmin || isDecideur">
          <app-kpi-widget
            label="Budget Global"
            [value]="(stats.totalBudget | number:'1.0-0') + ' FCFA'"
            icon="payments"
            color="success">
          </app-kpi-widget>
        </div>

        <div class="kpi-clickable" (click)="navigateTo('/dashboard/sites')">
          <app-kpi-widget
            label="Sites Actifs"
            [value]="stats.totalSites"
            icon="location_on"
            color="accent">
          </app-kpi-widget>
        </div>

        <div class="kpi-clickable" (click)="navigateTo('/dashboard/utilisateurs')" *ngIf="isAdmin">
          <app-kpi-widget
            label="Membres"
            [value]="stats.totalUsers"
            icon="groups"
            color="info">
          </app-kpi-widget>
        </div>

        <div class="kpi-clickable" *ngIf="isChefProjet">
          <app-kpi-widget
            label="Étapes en retard"
            [value]="stats.etapesEnRetard"
            icon="warning"
            color="warn">
          </app-kpi-widget>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-grid">
        
        <!-- Left Column: Charts -->
        <div class="charts-column">
          
          <!-- Row 1: Status & Budget -->
          <div class="charts-row">
            <app-project-status-chart [statusData]="chartData.projectStatus"></app-project-status-chart>
            <app-budget-chart *ngIf="isAdmin || isDecideur" [budgetData]="chartData.budget"></app-budget-chart>
          </div>

          <!-- Row 2: Evolution -->
          <div class="charts-row">
             <div class="chart-card mat-elevation-z1">
                <h3>Évolution des Projets</h3>
                <app-comparison-chart [data]="chartData.evolution"></app-comparison-chart>
             </div>
          </div>

        </div>

        <!-- Right Column: Shortcuts, Map & Live Alerts -->
        <div class="sidebar-column">
           <div class="map-preview mat-elevation-z1" (click)="navigateTo('/dashboard/sites')">
            <div class="overlay">
              <h3>Carte Interactive</h3>
              <p>Visualisez les {{ stats.totalSites }} sites sur la carte.</p>
              <span class="btn-glass">Accéder</span>
            </div>
            <div class="map-illustration">
              <i class="fas fa-map-marked-alt"></i>
            </div>
          </div>

          <!-- Alertes Live (WebSockets) -->
          <div class="alerts-live mat-elevation-z1 p-4 bg-white rounded-2xl border-l-4 border-red-500 shadow-sm flex flex-col">
            <div class="flex items-center gap-2 mb-4 text-red-600">
              <mat-icon class="animate-pulse">campaign</mat-icon>
              <h3 class="font-bold text-lg m-0">Alertes en Direct</h3>
              <span class="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                 {{ alertesLive.length }}
              </span>
            </div>
            
            <div class="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
               <div *ngIf="alertesLive.length === 0" class="text-xs text-gray-400 text-center py-4 italic">
                  Aucune alerte critique récente sur vos projets.
               </div>
               
               <div *ngFor="let alerte of alertesLive" class="bg-red-50 p-2 rounded relative group text-sm border border-red-100">
                  <div class="font-bold text-red-800 flex justify-between">
                    <span class="truncate">{{ alerte.type }}</span>
                    <span class="text-[10px] text-red-400 shrink-0">{{ alerte.createdAt | date:'HH:mm' }}</span>
                  </div>
                  <div class="text-xs text-red-600 mt-1 line-clamp-2">{{ alerte.message }}</div>
                  <div class="text-[10px] font-medium text-gray-500 mt-1" *ngIf="alerte.projetId">
                     Projet #{{ alerte.projetId }}
                  </div>
               </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions mat-elevation-z1 bg-white rounded-2xl p-4 shadow-sm">
            <h3 class="font-bold text-[#1A237E] mb-3">Accès Rapide</h3>
            <div class="flex flex-col gap-2">
              <button mat-button class="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg" routerLink="/dashboard/projets/new" *ngIf="isAdmin || isChefProjet">
                  <mat-icon class="text-blue-500 mr-2">add_box</mat-icon> Nouveau Projet
              </button>
              <button mat-button class="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg" routerLink="/dashboard/projets/kanban">
                  <mat-icon class="text-orange-500 mr-2">view_week</mat-icon> Kanban Global
              </button>
              <button mat-button class="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg" routerLink="/dashboard/rapports" *ngIf="isAdmin || isChefProjet || isDecideur">
                  <mat-icon class="text-green-500 mr-2">summarize</mat-icon> Audit &amp; Rapports
              </button>
              <button mat-button class="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg" routerLink="/dashboard/comites" *ngIf="isAdmin || isChefProjet || isDecideur">
                  <mat-icon class="text-indigo-500 mr-2">groups_3</mat-icon> Comités
              </button>
            </div>
          </div>
        
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .kpi-clickable {
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover { transform: translateY(-3px); }
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
      min-height: 0;
    }

    .charts-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 0;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .sidebar-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 0;
    }

    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      min-height: 350px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      h3 {
        margin: 0 0 16px 0;
        color: #1A237E;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .map-preview {
      background: linear-gradient(135deg, #FF6F00 0%, #FF5722 100%);
      border-radius: 24px;
      color: white;
      position: relative;
      overflow: hidden;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 87, 34, 0.3);
      }
      
      .overlay {
        padding: 24px;
        z-index: 2;
        
        h3 { margin: 0 0 8px 0; font-size: 20px; color: white; }
        p { margin: 0 0 16px 0; opacity: 0.9; font-size: 13px; }
      }

      .map-illustration {
        position: absolute;
        right: -20px;
        bottom: -20px;
        font-size: 100px;
        opacity: 0.2;
        color: white;
        transform: rotate(-15deg);
      }
    }

    .btn-glass {
      display: inline-block;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.4);
      color: white;
      padding: 8px 20px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover { background: rgba(255,255,255,0.35); }
    }

    .quick-actions {
      background: white;
      border-radius: 24px;
      padding: 24px;
      
      h3 { margin-top: 0; color: #1A237E; font-size: 18px; font-weight: 600; margin-bottom: 16px; }
      
      button {
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: 8px;
        text-align: left;
        color: #455a64;
        justify-content: flex-start;
        padding: 10px 16px;
        
        mat-icon { margin-right: 12px; color: #FF6F00; }
        &:hover { background: #f5f5f5; border-radius: 8px; }
      }
    }

    @media (max-width: 1400px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 1200px) {
      .main-grid { grid-template-columns: 1fr; }
      .sidebar-column { flex-direction: row; flex-wrap: wrap; }
      .sidebar-column > * { flex: 1; min-width: 280px; }
    }

    @media (max-width: 768px) {
       .dashboard-container { padding: 16px; gap: 16px; }
       .kpi-grid { grid-template-columns: 1fr; }
       .sidebar-column { flex-direction: column; }
    }
  `]
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private projetService = inject(ProjetService);
  private siteService = inject(SiteService);
  private utilisateurService = inject(UtilisateurService); // Injected service
  private router = inject(Router);
  private wsNotificationService = inject(WsNotificationService);
  private _authService = inject(AuthService);
  private suiviService = inject(SuiviService);

  stats: any = {
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSites: 0,
    totalUsers: 0,
    projectsTrend: 0,
    etapesEnRetard: 0
  };

  chartData: any = {
    projectStatus: { enCours: 0, termine: 0, prevu: 0, annule: 0 },
    budget: { labels: [], values: [] },
    evolution: { labels: [], datasets: [] }
  };

  alertesLive: any[] = [];
  isAdmin: boolean = false;
  isChefProjet: boolean = false;
  isDecideur: boolean = false;

  private wsSubscription?: Subscription;

  ngOnInit(): void {
    const user = this._authService.getCurrentUser();
    const role = user?.role?.toString();
    this.isAdmin = role === 'ADMINISTRATEUR_SYSTEME';
    this.isChefProjet = role === 'CHEF_DE_PROJET';
    this.isDecideur = role === 'DECIDEUR';

    this.loadDashboardData();
    this.loadRealAlerts();
    
    // Ecoute des alertes temps réel depuis n'importe quel projet E-Carto ou système GS2E
    this.wsSubscription = this.wsNotificationService.watchMesAlertes().subscribe((alerte) => {
      if (alerte) {
         // Ajout au début avec petite animation au clic dans le dashboard (Limitation des perfs, garde en mémoire les 15 plus récentes)
         this.alertesLive.unshift(alerte);
         if (this.alertesLive.length > 15) {
            this.alertesLive.pop();
         }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  loadRealAlerts() {
    const user = this._authService.getCurrentUser();
    if (user && user.id) {
      this.suiviService.getAlertesNonLuesUtilisateur(user.id).subscribe({
        next: (alertes: AlerteDto[]) => {
          this.alertesLive = alertes.slice(0, 15); // Garder les 15 plus récentes
        },
        error: (err: any) => console.error("Erreur chargement alertes réelles", err)
      });
    }
  }

  loadDashboardData(): void {
    forkJoin({
      globalStats: this.projetService.getProjectStatistics().pipe(
        catchError(err => {
          console.error('Failed to load global stats', err);
          return of({ totalProjects: 0, countByStatus: {}, totalBudget: 0, projectsTrend: 0 });
        })
      ),
      statusStats: this.projetService.getProjectsByStatus(StatutProjet.EN_COURS).pipe(
        catchError(err => {
          console.error('Failed to load status stats', err);
          return of({ content: [] });
        })
      ),
      evolution: this.projetService.getProjectEvolution().pipe(
        catchError(err => {
          console.error('Failed to load evolution stats', err);
          return of([]);
        })
      ),
      typeStats: this.projetService.getProjectsByTypeStats().pipe(
        catchError(err => {
          console.error('Failed to load type stats', err);
          return of({});
        })
      ),
      sites: this.siteService.getAllSitesForMap().pipe(
        catchError(err => {
          console.error('Failed to load sites', err);
          return of([]);
        })
      ),
      users: this.utilisateurService.getAllUtilisateurs().pipe(
        catchError(err => {
          console.error('Failed to load users', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (results: any) => {
        // Global Stats
        const stats = results.globalStats || {};
        this.stats = {
          totalProjects: stats.totalProjects || 0,
          activeProjects: stats.countByStatus?.EN_COURS || 0,
          totalBudget: stats.totalBudget || 0,
          totalSites: results.sites?.length || 0,
          totalUsers: results.users?.length || 0,
          projectsTrend: stats.projectsTrend || 0
        };

        // Project Status Chart
        this.chartData.projectStatus = {
          enCours: stats.countByStatus?.EN_COURS || 0,
          termine: stats.countByStatus?.TERMINE || 0,
          prevu: stats.countByStatus?.PREVU || 0,
          annule: stats.countByStatus?.ANNULE || 0
        };

        // Budget by Type
        const typeStats = results.typeStats || {};
        this.chartData.budget = {
          labels: Object.keys(typeStats),
          values: Object.values(typeStats)
        };

        // Evolution Chart
        const evolutionData = results.evolution || [];
        const months = evolutionData.map((e: any) => `${e.month}/${e.year}`);
        const counts = evolutionData.map((e: any) => e.count);

        this.chartData.evolution = {
          labels: months.reverse(),
          datasets: [
            { label: 'Nouveaux Projets', data: counts.reverse(), color: '#1A237E' }
          ]
        };
      },
      error: (err) => console.error('Critical error in dashboard loader', err)
    });
  }

  goToMap(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/sites']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
