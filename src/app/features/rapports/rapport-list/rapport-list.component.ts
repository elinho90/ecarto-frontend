import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { RapportService } from '../services/rapport.service';
import { ExportService } from '../../../shared/services/export.service';
import { Rapport } from '../../../shared/models/rapport.model';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SharedModule } from '../../../shared/shared.module';
import { RapportFormComponent } from '../rapport-form/rapport-form.component';

@Component({
  selector: 'app-rapport-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatPaginatorModule,
    ButtonComponent,
    SharedModule
  ],
  templateUrl: './rapport-list.component.html',
  styleUrls: ['./rapport-list.component.scss'],
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
export class RapportListComponent implements OnInit {
  rapports: Rapport[] = [];
  isLoading = true;
  searchControl = new FormControl('');

  // Stats
  totalCount = 0;
  highRiskCount = 0;
  averageFaisabilite = 0;

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  private rapportService = inject(RapportService);
  private exportService = inject(ExportService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.setupSearch();
    this.loadRapports();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRapports();
      });
  }

  loadRapports(): void {
    this.isLoading = true;
    const search = this.searchControl.value?.trim();

    const obs = search
      ? this.rapportService.searchRapports({ nom: search }, this.currentPage - 1, this.itemsPerPage)
      : this.rapportService.getAllRapports(this.currentPage - 1, this.itemsPerPage);

    obs.subscribe({
      next: (page) => {
        this.rapports = page.content;
        this.totalCount = page.totalElements;
        this.totalPages = page.totalPages;
        this.isLoading = false;
        this.updateStats();
      },
      error: (error) => {
        console.error('Erreur rapports', error);
        this.snackBar.open('Échec du chargement des rapports', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    this.highRiskCount = this.rapports.filter(r => r.risque === 'ELEVE' || r.risque === 'CRITIQUE').length;
    if (this.rapports.length > 0) {
      const sum = this.rapports.reduce((acc, r) => acc + (r.faisabilite || 0), 0);
      this.averageFaisabilite = Math.round(sum / this.rapports.length);
    } else {
      this.averageFaisabilite = 0;
    }
  }

  onAdd(): void {
    const dialogRef = this.dialog.open(RapportFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRapports();
      }
    });
  }

  onEdit(rapport: Rapport): void {
    const dialogRef = this.dialog.open(RapportFormComponent, {
      width: '600px',
      data: { rapport },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRapports();
      }
    });
  }

  onDelete(rapport: Rapport): void {
    if (confirm(`Voulez-vous vraiment supprimer le rapport "${rapport.nom}" ?`)) {
      this.rapportService.deleteRapport(rapport.id).subscribe({
        next: () => {
          this.snackBar.open('Rapport supprimé', 'Fermer', { duration: 3000 });
          this.loadRapports();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onDownload(id: number): void {
    this.snackBar.open('Préparation du téléchargement...', 'Fermer', { duration: 2000 });
    this.rapportService.downloadRapport(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_${id}_${new Date().getTime()}.pdf`;
        link.click();

        // Nettoyage après un court délai pour s'assurer que le téléchargement est lancé
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      },
      error: (err) => {
        console.error('Erreur de téléchargement:', err);
        this.snackBar.open('Erreur lors du téléchargement du fichier', 'Fermer', { duration: 4000 });
      }
    });
  }

  onSendEmail(id: number): void {
    const email = prompt('Adresse email du destinataire :');
    if (!email) return;

    this.snackBar.open('Envoi de l\'email...', 'Fermer', { duration: 2000 });
    this.rapportService.sendRapportByEmail(id, email).subscribe({
      next: (res: any) => this.snackBar.open(res.message || 'Email envoyé avec succès', 'Fermer', { duration: 4000 }),
      error: (err) => {
        const errorMsg = err.error?.message || 'Échec de l\'envoi de l\'email';
        this.snackBar.open(errorMsg, 'Fermer', { duration: 6000 });
      }
    });
  }

  getRisqueVariant(risque: string): any {
    switch (risque) {
      case 'FAIBLE': return 'success';
      case 'MOYEN': return 'warning';
      case 'ELEVE':
      case 'CRITIQUE': return 'error';
      default: return 'neutral';
    }
  }

  get startIndex(): number { return (this.currentPage - 1) * this.itemsPerPage; }
  get endIndex(): number { return Math.min(this.startIndex + this.itemsPerPage, this.totalCount); }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRapports();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRapports();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadRapports();
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }

  hasRole(roles: string[]): boolean {
    return true;
  }

  exportToExcel(): void {
    this.rapportService.getAllRapports(0, 1000).subscribe({
      next: (page) => {
        this.exportService.exportRapports(page.content);
        this.snackBar.open('Export Excel généré avec succès', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }
}