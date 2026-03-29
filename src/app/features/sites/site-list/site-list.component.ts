import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SiteService } from '../services/site.service';
import { ExportService } from '../../../shared/services/export.service';
import { Site } from '../../../shared/models/site.model';
import { Page } from '../../../shared/models/page.model';

@Component({
  selector: 'app-site-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  template: `
    <div class="site-list-container p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <i class="fas fa-map-marker-alt mr-2"></i>
            Gestion des Sites
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="!isLoading; else loading">
            <div class="mb-4">
              <p class="text-lg">Nombre de sites: {{ totalElements }}</p>
              <p class="text-sm text-gray-600">Page {{ currentPage + 1 }} sur {{ totalPages }}</p>
            </div>

            <div *ngIf="sites.length > 0; else noSites" class="sites-grid">
              <div *ngFor="let site of sites" class="site-card p-4 border rounded-lg mb-3 hover:shadow-lg transition-shadow">
                <h3 class="font-bold text-lg">{{ site.nom }}</h3>
                <p class="text-gray-600">{{ site.ville }}, {{ site.region }}</p>
                <p class="text-sm mt-2">Type: {{ site.type }}</p>
                <p class="text-sm">Statut: <span [class]="getStatutClass(site.statut)">{{ site.statut }}</span></p>
              </div>
            </div>

            <ng-template #noSites>
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-map-marker-alt text-4xl mb-3"></i>
                <p>Aucun site trouvé</p>
              </div>
            </ng-template>

            <mat-paginator
              *ngIf="totalElements > 0"
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageIndex]="currentPage"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange($event)"
              class="mt-4">
            </mat-paginator>

            <div class="mt-8 flex items-center justify-end gap-4">
              <button mat-flat-button class="btn-export" (click)="exportToExcel()">
                <i class="fas fa-file-excel mr-2"></i>
                Export Excel
              </button>
              <button mat-flat-button class="btn-orange-outline" routerLink="../carte">
                <i class="fas fa-map mr-2"></i>
                Voir la carte
              </button>
              <button mat-flat-button class="btn-orange" routerLink="../new">
                <i class="fas fa-plus mr-2"></i>
                Nouveau site
              </button>
            </div>
          </div>

          <ng-template #loading>
            <div class="flex justify-center items-center py-24">
              <mat-spinner diameter="50" color="primary"></mat-spinner>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .site-list-container {
      max-width: 1200px;
      margin: 2rem auto;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .site-card {
      background: #ffffff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #e0e0e0;
      position: relative;
      overflow: hidden;
    }

    .site-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #FF8C00;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .site-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
      border-color: #FF8C00;
    }

    .site-card:hover::before {
      opacity: 1;
    }

    .btn-orange {
      background-color: #FF8C00 !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 0 20px !important;
      height: 44px !important;
      box-shadow: 0 4px 6px rgba(255, 140, 0, 0.2) !important;
      transition: all 0.3s !important;
    }

    .btn-orange:hover {
      background-color: #e67e00 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(255, 140, 0, 0.3) !important;
    }

    .btn-orange-outline {
      background-color: transparent !important;
      color: #FF8C00 !important;
      border: 2px solid #FF8C00 !important;
      border-radius: 8px !important;
      padding: 0 20px !important;
      height: 44px !important;
      transition: all 0.3s !important;
    }

    .btn-orange-outline:hover {
      background-color: rgba(255, 140, 0, 0.05) !important;
      transform: translateY(-2px);
    }

    .status-actif { color: #2e7d32; font-weight: 600; background: #e8f5e9; padding: 2px 8px; border-radius: 4px; }
    .status-inactif { color: #d32f2f; font-weight: 600; background: #ffebee; padding: 2px 8px; border-radius: 4px; }
    .status-en-construction { color: #f57c00; font-weight: 600; background: #fff3e0; padding: 2px 8px; border-radius: 4px; }
    .status-en-maintenance { color: #1976d2; font-weight: 600; background: #e3f2fd; padding: 2px 8px; border-radius: 4px; }

    .btn-export {
      background-color: #217346 !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 0 20px !important;
      height: 44px !important;
      transition: all 0.3s !important;
    }

    .btn-export:hover {
      background-color: #1a5c38 !important;
      transform: translateY(-2px);
    }
  `]
})
export class SiteListComponent implements OnInit {
  sites: Site[] = [];
  isLoading = true;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private siteService: SiteService,
    private exportService: ExportService
  ) { }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.isLoading = true;
    this.siteService.getAllSites(this.currentPage, this.pageSize).subscribe({
      next: (page: Page<Site>) => {
        // LA CLÉ DU PROBLÈME: extraire le contenu de la page
        this.sites = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.currentPage = page.number;
        this.isLoading = false;
        console.log('Sites chargés:', this.sites);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des sites:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSites();
  }

  getStatutClass(statut: string): string {
    return `status-${statut.toLowerCase().replace('_', '-')}`;
  }

  exportToExcel(): void {
    this.siteService.getAllSitesForMap().subscribe({
      next: (sites) => {
        this.exportService.exportSites(sites);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
      }
    });
  }
}