import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

// Matériel
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

// Shared Module
import { SharedModule } from '../../../shared/shared.module';
import { ProjetFilterDialogComponent } from './projet-filter-dialog.component';

// Services
import { ProjetService } from '../services/projet.service';
import { ExportService } from '../../../shared/services/export.service';
import { Projet } from '../../../shared/models/projet.model';

// Enums
import { StatutProjet } from '../../../shared/enums/statut-projet.enum';
import { PrioriteProjet } from '../../../shared/enums/priorite-projet.enum';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    SharedModule
  ],
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProjetListComponent implements OnInit {
  projets: any[] = []; // Utilisez any[] temporairement ou votre modèle Projet
  isLoading = true;
  searchControl = new FormControl('');

  // Stats
  totalCount = 0;
  activeCount = 0;
  inProgressCount = 0;

  // Filtres
  selectedStatut: StatutProjet | null = null;
  selectedPriorite: PrioriteProjet | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  private projetService = inject(ProjetService);
  private exportService = inject(ExportService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.setupSearch();
    this.loadProjets();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadProjets());
  }

  loadProjets(): void {
    this.isLoading = true;
    const search = this.searchControl.value?.trim();

    const obs = search || this.selectedStatut || this.selectedPriorite
      ? this.projetService.searchProjects({
        nom: search || undefined,
        statut: this.selectedStatut || undefined
      }, this.currentPage - 1, this.itemsPerPage)
      : this.projetService.getAllProjets(this.currentPage - 1, this.itemsPerPage);

    obs.subscribe({
      next: (page) => {
        this.projets = page.content;
        this.totalCount = page.totalElements;
        this.totalPages = page.totalPages;
        this.isLoading = false;
        this.updateStats();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur de chargement des projets', 'Fermer', { duration: 3000 });
      }
    });
  }

  applyAllFilters(data: any[]): any[] {
    let filtered = data;
    const search = this.searchControl.value?.toLowerCase();

    if (search) {
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }
    if (this.selectedStatut) {
      filtered = filtered.filter(p => p.statut === this.selectedStatut);
    }
    if (this.selectedPriorite) {
      filtered = filtered.filter(p => p.priorite === this.selectedPriorite);
    }
    return filtered;
  }

  updateStats(): void {
    // Basic stats calculation from the current list (for display purposes)
    this.activeCount = this.projets.filter(p => p.statut === 'EN_COURS').length;
    this.inProgressCount = this.projets.filter(p => p.progression > 0 && p.progression < 100).length;
  }

  getStatusVariant(statut: string): 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral' {
    const map: Record<string, 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral'> = {
      'EN_COURS': 'success',
      'TERMINE': 'primary',
      'ANNULE': 'error',
      'PREVU': 'info'
    };
    return map[statut] || 'neutral';
  }

  getPriorityVariant(priorite: string): 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral' {
    const map: Record<string, 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral'> = {
      'CRITIQUE': 'error',
      'HAUTE': 'warning',
      'MOYENNE': 'info',
      'FAIBLE': 'success'
    };
    return map[priorite] || 'neutral';
  }

  openFilters(): void {
    const dialogRef = this.dialog.open(ProjetFilterDialogComponent, {
      width: '400px',
      data: {
        statut: this.selectedStatut,
        priorite: this.selectedPriorite
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.selectedStatut = res.statut;
        this.selectedPriorite = res.priorite;
        this.loadProjets();
      }
    });
  }

  get activeFiltersCount(): number {
    return (this.selectedStatut ? 1 : 0) + (this.selectedPriorite ? 1 : 0);
  }

  // Méthodes pour la pagination
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalCount);
  }

  get visibleProjets(): Projet[] {
    return this.projets;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProjets();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProjets();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProjets();
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showEllipsis(): boolean {
    return this.totalPages > 5 && this.currentPage < this.totalPages - 2;
  }

  // Méthodes utilitaires pour le template
  formatDate(date: string | Date): string {
    if (!date) return 'Non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getDaysRemaining(dateFin: string | Date): number {
    if (!dateFin) return 0;
    const end = new Date(dateFin).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getTeamMembers(projet: any): any[] {
    return projet.team || projet.teamMembers || [];
  }

  getTeamCount(projet: any): number {
    return projet.team?.length || projet.teamMembers?.length || 0;
  }

  viewProjet(id: number): void {
    this.router.navigate(['/dashboard/projets', id]);
  }

  editProjet(id: number): void {
    this.router.navigate(['/dashboard/projets/edit', id]);
  }

  deleteProjet(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.projetService.deleteProjet(id).subscribe({
        next: () => {
          this.snackBar.open('Projet supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadProjets();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  exportToExcel(): void {
    this.isLoading = true;
    this.projetService.exportProjetsExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projets_export.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        this.snackBar.open('Export Excel généré avec succès depuis le serveur', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de l\'export serveur', 'Fermer', { duration: 3000 });
      }
    });
  }
}