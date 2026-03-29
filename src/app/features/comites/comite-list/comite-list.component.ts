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

import { ComiteService } from '../services/comite.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-comite-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatSnackBarModule,
    MatTooltipModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="comite-list-container p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            <mat-icon class="text-4xl text-indigo-500 scale-125">groups_3</mat-icon>
            Comités de Gouvernance
          </h1>
          <p class="text-gray-500 mt-1">Gestion des comités de pilotage des projets GS2E</p>
        </div>
        <div class="flex gap-3 items-center">
          <span class="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-semibold">
            {{ filteredComites.length }} comité(s)
          </span>
          <button *ngIf="canEdit" mat-raised-button color="primary" (click)="onAddNew()" class="!rounded-xl">
            <mat-icon>add</mat-icon> Nouveau Comité
          </button>
        </div>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="w-full mb-4">
        <mat-label>Rechercher un comité...</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [formControl]="searchControl" placeholder="Nom ou code du comité">
      </mat-form-field>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredComites.length === 0" class="text-center py-16 bg-gray-50 rounded-2xl">
        <mat-icon class="text-6xl text-gray-300 mb-4">groups_3</mat-icon>
        <h3 class="text-xl text-gray-500 font-semibold">Aucun comité trouvé</h3>
        <p class="text-gray-400 mt-2">Ajoutez un comité pour commencer à organiser vos projets.</p>
      </div>

      <!-- Comité Cards Grid -->
      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let comite of filteredComites"
             class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 group cursor-pointer"
             (click)="onEdit(comite.id)">
          
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <mat-icon class="text-indigo-600">groups</mat-icon>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{{ comite.nom }}</h3>
                <span class="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{{ comite.code }}</span>
              </div>
            </div>
            <mat-icon class="text-gray-300 group-hover:text-indigo-400 transition-colors scale-75">edit</mat-icon>
          </div>

          <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ comite.description || 'Aucune description' }}</p>

          <div *ngIf="comite.presidentNom" class="flex items-center gap-2 text-xs text-gray-400 border-t pt-3">
            <mat-icon class="scale-75">person</mat-icon>
            <span>Président : <strong class="text-gray-600">{{ comite.presidentNom }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .w-full { width: 100%; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class ComiteListComponent implements OnInit {
  comites: any[] = [];
  filteredComites: any[] = [];
  isLoading = true;
  canEdit = false;
  searchControl = new FormControl('');

  private comiteService = inject(ComiteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = !!(currentUser && [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET].includes(currentUser.role as Role));
    
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => this.applyFilter(value || ''));

    this.loadComites();
  }

  loadComites(): void {
    this.isLoading = true;
    this.comiteService.getAllComites().subscribe({
      next: (comites) => {
        this.comites = comites || [];
        this.applyFilter(this.searchControl.value || '');
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des comités', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  private applyFilter(value: string): void {
    const f = value.toLowerCase();
    this.filteredComites = this.comites.filter(c =>
      c.nom?.toLowerCase().includes(f) || c.code?.toLowerCase().includes(f) || c.description?.toLowerCase().includes(f)
    );
  }

  onAddNew(): void { this.router.navigate(['/dashboard/comites/new']); }
  onEdit(id: number): void { this.router.navigate(['/dashboard/comites/edit', id]); }
}
