import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { EntiteService } from '../services/entite.service';

@Component({
  selector: 'app-entite-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatSelectModule
  ],
  template: `
    <div class="entite-form-container p-6 max-w-xl mx-auto">
      <mat-card class="!rounded-2xl">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !text-xl !text-teal-800">
            <mat-icon>{{ isEditMode ? 'edit' : 'add_circle' }}</mat-icon>
            {{ isEditMode ? 'Modifier l\\'Entité' : 'Nouvelle Entité' }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="!pt-6">
          <form [formGroup]="entiteForm" (ngSubmit)="onSubmit()" class="space-y-4">

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code *</mat-label>
              <input matInput formControlName="code" placeholder="Ex: CIE, SODECI, GS2E">
              <mat-error *ngIf="entiteForm.get('code')?.hasError('required')">Le code est requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nom de l'entité *</mat-label>
              <input matInput formControlName="nom" placeholder="Ex: Compagnie Ivoirienne d'Électricité">
              <mat-error *ngIf="entiteForm.get('nom')?.hasError('required')">Le nom est requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Couleur thème</mat-label>
              <mat-select formControlName="couleurTheme">
                <mat-option value="#FF6F00">🟠 Orange CIE</mat-option>
                <mat-option value="#1565C0">🔵 Bleu SODECI</mat-option>
                <mat-option value="#2E7D32">🟢 Vert GS2E</mat-option>
                <mat-option value="#6A1B9A">🟣 Violet ERANOVE</mat-option>
                <mat-option value="#C62828">🔴 Rouge</mat-option>
                <mat-option value="#00838F">🔵 Cyan</mat-option>
                <mat-option value="#4E342E">🟤 Marron</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Preview -->
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                   [style.background]="entiteForm.get('couleurTheme')?.value || '#0d9488'">
                {{ (entiteForm.get('code')?.value || '?').substring(0, 2).toUpperCase() }}
              </div>
              <span class="font-semibold text-gray-700">{{ entiteForm.get('nom')?.value || 'Aperçu...' }}</span>
            </div>

            <div class="flex gap-4 pt-4">
              <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting || !entiteForm.valid" class="!rounded-xl">
                <mat-icon *ngIf="!isSubmitting">save</mat-icon>
                <mat-spinner *ngIf="isSubmitting" diameter="20" class="inline-block mr-2"></mat-spinner>
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button mat-raised-button type="button" (click)="onCancel()" class="!rounded-xl">
                <mat-icon>close</mat-icon> Annuler
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .w-full { width: 100%; }
    mat-form-field { display: block; margin-bottom: 0.5rem; }
  `]
})
export class EntiteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private entiteService = inject(EntiteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  entiteForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  entiteId?: number;

  constructor() {
    this.entiteForm = this.fb.group({
      code: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      couleurTheme: ['#2E7D32']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.entiteId = +id;
      this.loadEntite();
    }
  }

  loadEntite(): void {
    if (!this.entiteId) return;
    this.entiteService.getEntiteById(this.entiteId).subscribe({
      next: (entite) => this.entiteForm.patchValue(entite),
      error: () => this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 5000 })
    });
  }

  onSubmit(): void {
    if (!this.entiteForm.valid) return;
    this.isSubmitting = true;

    const data = this.entiteForm.value;
    const obs = this.isEditMode && this.entiteId
      ? this.entiteService.updateEntite(this.entiteId, data)
      : this.entiteService.createEntite(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Entité mise à jour' : 'Entité créée avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/dashboard/entites']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erreur lors de l\'enregistrement', 'Fermer', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void { this.router.navigate(['/dashboard/entites']); }
}
