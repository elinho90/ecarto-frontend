import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EntiteService } from '../services/entite.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-entite-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatSnackBarModule,
    MatTooltipModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="entite-list-container p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            <mat-icon class="text-4xl text-teal-500 scale-125">business</mat-icon>
            Entités Commanditaires
          </h1>
          <p class="text-gray-500 mt-1">Gestion des entités du groupe (CIE, SODECI, GS2E, ERANOVE)</p>
        </div>
        <div class="flex gap-3 items-center">
          <span class="text-sm bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full font-semibold">
            {{ filteredEntites.length }} entité(s)
          </span>
          <button *ngIf="canEdit" mat-raised-button color="primary" (click)="onAddNew()" class="!rounded-xl">
            <mat-icon>add</mat-icon> Nouvelle Entité
          </button>
        </div>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="w-full mb-4">
        <mat-label>Rechercher une entité...</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [formControl]="searchControl" placeholder="Nom ou code de l'entité">
      </mat-form-field>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredEntites.length === 0" class="text-center py-16 bg-gray-50 rounded-2xl">
        <mat-icon class="text-6xl text-gray-300 mb-4">business</mat-icon>
        <h3 class="text-xl text-gray-500 font-semibold">Aucune entité trouvée</h3>
        <p class="text-gray-400 mt-2">Ajoutez une entité commanditaire pour rattacher vos projets.</p>
      </div>

      <!-- Entité Cards Grid -->
      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div *ngFor="let entite of filteredEntites"
             class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 p-5 group cursor-pointer"
             (click)="onEdit(entite.id)">
          
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                 [style.background]="entite.couleurTheme || '#0d9488'">
              {{ (entite.code || '?').substring(0, 2) }}
            </div>
            <div>
              <h3 class="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">{{ entite.nom }}</h3>
              <span class="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{{ entite.code }}</span>
            </div>
            <mat-icon class="ml-auto text-gray-300 group-hover:text-teal-400 transition-colors scale-75">edit</mat-icon>
          </div>

          <div class="flex items-center gap-2 text-xs text-gray-400 border-t pt-3">
            <div class="w-4 h-4 rounded-full border-2" [style.borderColor]="entite.couleurTheme || '#0d9488'" [style.backgroundColor]="entite.couleurTheme || '#0d9488'"></div>
            <span>Couleur thème : {{ entite.couleurTheme || 'Par défaut' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .w-full { width: 100%; }
  `]
})
export class EntiteListComponent implements OnInit {
  entites: any[] = [];
  filteredEntites: any[] = [];
  isLoading = true;
  canEdit = false;
  searchControl = new FormControl('');

  private entiteService = inject(EntiteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = !!(currentUser && [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET].includes(currentUser.role as Role));
    
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => this.applyFilter(value || ''));

    this.loadEntites();
  }

  loadEntites(): void {
    this.isLoading = true;
    this.entiteService.getAllEntites().subscribe({
      next: (entites) => {
        this.entites = entites || [];
        this.applyFilter(this.searchControl.value || '');
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des entités', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  private applyFilter(value: string): void {
    const f = value.toLowerCase();
    this.filteredEntites = this.entites.filter(e =>
      e.nom?.toLowerCase().includes(f) || e.code?.toLowerCase().includes(f)
    );
  }

  onAddNew(): void { this.router.navigate(['/dashboard/entites/new']); }
  onEdit(id: number): void { this.router.navigate(['/dashboard/entites/edit', id]); }
}
