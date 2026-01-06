import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UtilisateurService } from '../services/utilisateur.service';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './utilisateur-list.component.html',
  styleUrls: ['./utilisateur-list.component.scss']
})
export class UtilisateurListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['avatar', 'nom', 'email', 'role', 'actions'];
  dataSource: MatTableDataSource<Utilisateur>;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private utilisateurService = inject(UtilisateurService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.dataSource.data = utilisateurs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAdd(): void {
    this.router.navigate(['/dashboard/utilisateurs/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/utilisateurs/edit', id]);
  }

  onDelete(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadUtilisateurs();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  formatRole(role?: Role): string {
    if (!role) return 'Inconnu';
    switch (role) {
      case Role.ADMINISTRATEUR_SYSTEME: return 'Administrateur';
      case Role.CHEF_DE_PROJET: return 'Chef de Projet';
      case Role.DECIDEUR: return 'Décideur';
      case Role.ANALYSTE: return 'Analyste';
      case Role.DEVELOPPEUR: return 'Développeur';
      case Role.OBSERVATEUR: return 'Observateur';
      default: return (role as string).replace(/_/g, ' ');
    }
  }

  getRoleClass(role?: Role): string {
    switch (role) {
      case Role.ADMINISTRATEUR_SYSTEME: return 'role-admin';
      case Role.CHEF_DE_PROJET: return 'role-chef';
      case Role.DECIDEUR: return 'role-decideur';
      case Role.ANALYSTE:
      case Role.DEVELOPPEUR: return 'role-analyste';
      default: return 'role-observateur';
    }
  }
}