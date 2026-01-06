import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProjetService } from '../projets/services/projet.service';
import { SiteService } from '../sites/services/site.service';
import { forkJoin } from 'rxjs';
import { StatutProjet } from '../../shared/enums/statut-projet.enum';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, SharedModule, RouterModule],
  template: `
    <div class="bento-grid animate-fade-in">
      <!-- Main Stat: Projets (Large Card) -->
      <div class="bento-item projects-main mat-elevation-z1" routerLink="/dashboard/projets">
        <div class="card-content">
          <div class="info">
            <h3 class="stat-label">Projets Actifs</h3>
            <span class="stat-value">{{ stats.activeProjects }}</span>
            <p class="stat-meta">Sur un total de {{ stats.totalProjects }} projets</p>
          </div>
          <mat-icon class="floating-icon">assignment</mat-icon>
        </div>
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress-fill primary" [style.width]="stats.globalProgress + '%'"></div>
          </div>
          <span class="progress-text">{{ stats.globalProgress }}% de complétion globale</span>
        </div>
      </div>

      <!-- Budget Card -->
      <div class="bento-item budget mat-elevation-z1">
        <div class="card-content">
          <div class="info">
            <h3 class="stat-label">Budget Global</h3>
            <span class="stat-value">{{ stats.totalBudget | number:'1.0-0' }} <small>FCFA</small></span>
          </div>
          <mat-icon class="floating-icon">payments</mat-icon>
        </div>
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress-fill success" [style.width]="'100%'"></div>
          </div>
          <span class="progress-text">Investissement total</span>
        </div>
      </div>

      <!-- Map Preview (Wide Card) -->
      <div class="bento-item map-preview mat-elevation-z1">
        <div class="overlay">
          <h3>Couverture Cartographique</h3>
          <p>{{ stats.totalSites }} sites actifs à travers la Côte d'Ivoire</p>
          <button class="btn-glass" (click)="goToMap($event)">Voir la carte immersive</button>
        </div>
        <div class="map-illustration">
          <i class="fas fa-map-marked-alt"></i>
        </div>
      </div>

      <!-- sites Card -->
      <div class="bento-item sites mat-elevation-z1" routerLink="/dashboard/sites">
        <div class="card-content">
          <div class="info">
            <h3 class="stat-label">Sites en Ligne</h3>
            <span class="stat-value">{{ stats.totalSites }}</span>
          </div>
          <mat-icon class="floating-icon">location_on</mat-icon>
        </div>
      </div>

      <!-- Team Members Card -->
      <div class="bento-item team mat-elevation-z1" routerLink="/dashboard/utilisateurs">
        <div class="card-content">
          <div class="info">
            <h3 class="stat-label">Membres Techniques</h3>
            <span class="stat-value">{{ stats.totalUsers }}</span>
          </div>
          <mat-icon class="floating-icon">groups</mat-icon>
        </div>
        <div class="avatars">
          <div class="avatar-stack">
            <div class="avatar" style="background-color: #FF6B6B">CI</div>
            <div class="avatar" style="background-color: #4ECDC4">EA</div>
            <div class="avatar" style="background-color: #45B7D1">MK</div>
            <div class="avatar-more" *ngIf="stats.totalUsers > 3">+{{ stats.totalUsers - 3 }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 220px);
      gap: 24px;
      padding: 12px;
    }

    .bento-item {
      background: white;
      border-radius: 24px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      border: 1px solid rgba(0, 0, 0, 0.03);
      cursor: pointer;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(26, 35, 126, 0.08) !important;
        
        .floating-icon {
          transform: scale(1.2) rotate(-10deg);
          opacity: 0.15;
        }
      }
    }

    .projects-main { grid-column: span 2; }
    .map-preview { 
      grid-column: span 2; 
      background: linear-gradient(135deg, #FF6F00 0%, #FF5722 100%); 
      color: white; 
      cursor: default;
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .stat-label { font-size: 14px; font-weight: 600; color: #6C757D; margin: 0; }
    .map-preview .stat-label { color: rgba(255,255,255,0.8); }

    .stat-value { font-size: 36px; font-weight: 800; color: #1A237E; margin: 8px 0; }
    .map-preview .stat-value { color: white; }

    .stat-meta { font-size: 11px; color: #009460; font-weight: 500; margin: 0; }

    .floating-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      position: absolute;
      right: -10px;
      top: -10px;
      opacity: 0.08;
      transition: all 0.5s ease;
      color: #1A237E;
    }

    .progress-wrapper {
      margin-top: 12px;
      .progress-bar {
        height: 8px;
        background: #F4F7FE;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-in-out;
          &.primary { background: #FF6F00; }
          &.success { background: #009460; }
        }
      }
      .progress-text { font-size: 10px; font-weight: 500; color: #ADB5BD; }
    }

    .map-preview {
      padding: 0;
      display: flex;
      flex-direction: row;
      .overlay {
        padding: 32px;
        flex: 1;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        h3 { color: white; font-size: 24px; margin: 0 0 8px 0; font-weight: 700; }
        p { color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 24px; }
      }
      .map-illustration {
        flex: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 120px;
        opacity: 0.2;
        transform: rotate(15deg);
        color: white;
      }
    }

    .btn-glass {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      width: fit-content;
      transition: all 0.3s ease;
      font-size: 14px;
      &:hover { 
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }
    }

    .team {
      .avatars {
        margin-top: 12px;
        .avatar-stack {
          display: flex;
          align-items: center;
          .avatar, .avatar-more {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid white;
            margin-left: -8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: white;
            &:first-child { margin-left: 0; }
          }
          .avatar-more { background: #1A237E; font-size: 9px; }
        }
      }
    }

    @media (max-width: 1200px) {
      .bento-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: auto;
      }
      .projects-main, .map-preview { grid-column: span 2; }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  private projetService = inject(ProjetService);
  private siteService = inject(SiteService);
  private router = inject(Router);

  stats = {
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSites: 0,
    totalUsers: 0,
    globalProgress: 0
  };

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    forkJoin({
      projets: this.projetService.getAllProjets(0, 100),
      sites: this.siteService.getAllSitesForMap()
    }).subscribe({
      next: (results) => {
        const projets = results.projets.content;
        this.stats.totalProjects = results.projets.totalElements;
        this.stats.activeProjects = projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
        this.stats.totalBudget = projets.reduce((sum, p) => sum + (p.budget || 0), 0);
        this.stats.totalSites = results.sites.length;

        // Simuler le nombre d'experts (utilisateurs) pour l'instant
        this.stats.totalUsers = 12; // On pourrait aussi injecter UtilisateurService

        // Calcul de la progression globale
        if (projets.length > 0) {
          const totalProgress = projets.reduce((sum, p) => sum + (p.progression || 0), 0);
          this.stats.globalProgress = Math.round(totalProgress / projets.length);
        }
      },
      error: (err) => console.error('Erreur chargement stats dashboard', err)
    });
  }

  goToMap(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/sites']);
  }
}
