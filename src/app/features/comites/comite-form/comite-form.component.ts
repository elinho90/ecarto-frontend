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

import { ComiteService } from '../services/comite.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UtilisateurService } from '../../utilisateurs/services/utilisateur.service';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-comite-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatSelectModule
  ],
  template: `
    <div class="comite-form-container p-6 max-w-2xl mx-auto">
      <mat-card class="!rounded-2xl">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !text-xl !text-indigo-800">
            <mat-icon>{{ isEditMode ? 'edit' : 'add_circle' }}</mat-icon>
            {{ isEditMode ? 'Modifier le Comité' : 'Nouveau Comité' }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="!pt-6">
          <form [formGroup]="comiteForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code du comité *</mat-label>
              <input matInput formControlName="code" placeholder="Ex: SI_CLIENTS, IOT_SMART_GRID">
              <mat-error *ngIf="comiteForm.get('code')?.hasError('required')">Le code est requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nom du comité *</mat-label>
              <input matInput formControlName="nom" placeholder="Ex: Comité SI Expérience Clients">
              <mat-error *ngIf="comiteForm.get('nom')?.hasError('required')">Le nom est requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Décrivez le rôle de ce comité"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Président du comité</mat-label>
              <mat-select formControlName="presidentId">
                <mat-option [value]="null">-- Aucun --</mat-option>
                <mat-option *ngFor="let u of utilisateurs" [value]="u.id">{{ u.nom }} {{ u.prenom }}</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex gap-4 pt-4">
              <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting || !comiteForm.valid" class="!rounded-xl">
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
export class ComiteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private comiteService = inject(ComiteService);
  private utilisateurService = inject(UtilisateurService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  comiteForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  comiteId?: number;
  utilisateurs: any[] = [];

  constructor() {
    this.comiteForm = this.fb.group({
      code: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      description: [''],
      presidentId: [null]
    });
  }

  ngOnInit(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => this.utilisateurs = users || [],
      error: () => {}
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.comiteId = +id;
      this.loadComite();
    }
  }

  loadComite(): void {
    if (!this.comiteId) return;
    this.comiteService.getComiteById(this.comiteId).subscribe({
      next: (comite) => this.comiteForm.patchValue(comite),
      error: () => this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 5000 })
    });
  }

  onSubmit(): void {
    if (!this.comiteForm.valid) return;
    this.isSubmitting = true;

    const data = this.comiteForm.value;
    const obs = this.isEditMode && this.comiteId
      ? this.comiteService.updateComite(this.comiteId, data)
      : this.comiteService.createComite(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Comité mis à jour' : 'Comité créé avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/dashboard/comites']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erreur lors de l\'enregistrement', 'Fermer', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void { this.router.navigate(['/dashboard/comites']); }
}
