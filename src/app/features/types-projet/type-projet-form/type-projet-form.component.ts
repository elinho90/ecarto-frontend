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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TypeProjetService } from '../services/type-projet.service';
import { TypeProjet } from '../../../shared/models/type-projet.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-type-projet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="type-projet-form-container p-6">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <i class="fas fa-tag mr-2"></i>
            {{ isEditMode ? 'Modifier le Type de Projet' : 'Ajouter un Nouveau Type de Projet' }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="typeForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Nom -->
            <mat-form-field class="w-full">
              <mat-label>Nom du type *</mat-label>
              <input matInput formControlName="nom" placeholder="Ex: Maintenance, Migration, Refactoring">
              <mat-error *ngIf="typeForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <!-- Libellé -->
            <mat-form-field class="w-full">
              <mat-label>Libellé</mat-label>
              <input matInput formControlName="libelle" placeholder="Libellé affiché">
            </mat-form-field>

            <!-- Description -->
            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" 
                        placeholder="Décrivez le type de projet"
                        rows="4"></textarea>
            </mat-form-field>

            <!-- Couleur -->
            <mat-form-field class="w-full">
              <mat-label>Couleur</mat-label>
              <mat-select formControlName="couleur">
                <mat-option value="#FF8C00">🟠 Orange</mat-option>
                <mat-option value="#1A237E">🔵 Bleu Marine</mat-option>
                <mat-option value="#4CAF50">🟢 Vert</mat-option>
                <mat-option value="#F44336">🔴 Rouge</mat-option>
                <mat-option value="#9C27B0">🟣 Violet</mat-option>
                <mat-option value="#00BCD4">🔵 Cyan</mat-option>
                <mat-option value="#795548">🟤 Marron</mat-option>
                <mat-option value="#607D8B">⚫ Gris</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Icône -->
            <mat-form-field class="w-full">
              <mat-label>Icône</mat-label>
              <mat-select formControlName="icone">
                <mat-option value="folder">📁 Dossier</mat-option>
                <mat-option value="build">🔧 Construction</mat-option>
                <mat-option value="settings">⚙️ Paramètres</mat-option>
                <mat-option value="code">💻 Code</mat-option>
                <mat-option value="cloud">☁️ Cloud</mat-option>
                <mat-option value="security">🔒 Sécurité</mat-option>
                <mat-option value="analytics">📊 Analytique</mat-option>
                <mat-option value="support">🎧 Support</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Actif -->
            <div class="py-4">
              <mat-slide-toggle formControlName="estActif" color="primary">
                Type actif
              </mat-slide-toggle>
            </div>

            <!-- Boutons -->
            <div class="flex gap-4 mt-6">
              <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting">
                <mat-icon *ngIf="!isSubmitting">save</mat-icon>
                <mat-spinner *ngIf="isSubmitting" diameter="20" class="inline-block mr-2"></mat-spinner>
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button mat-raised-button type="button" (click)="onCancel()">
                <mat-icon>close</mat-icon>
                Annuler
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .type-projet-form-container {
      max-width: 600px;
      margin: 0 auto;
    }
    mat-form-field {
      display: block;
      margin-bottom: 1rem;
    }
    .space-y-4 > * {
      margin-bottom: 1rem;
    }
  `]
})
export class TypeProjetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private typeProjetService = inject(TypeProjetService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  typeForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  typeId?: number;
  canEdit = false;

  constructor() {
    this.typeForm = this.fb.group({
      nom: ['', [Validators.required]],
      libelle: [''],
      description: [''],
      couleur: ['#FF8C00'],
      icone: ['folder'],
      estActif: [true]
    });
  }

  ngOnInit(): void {
    // Vérifier les permissions
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = !!(currentUser && [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET].includes(currentUser.role as Role));

    if (!this.canEdit) {
      this.snackBar.open('Accès refusé: vous n\'avez pas la permission', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/dashboard/types-projet']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.typeId = +id;
      this.loadType();
    }
  }

  loadType(): void {
    if (!this.typeId) return;

    this.isLoading = true;
    this.typeProjetService.getTypeProjetById(this.typeId).subscribe({
      next: (type) => {
        this.typeForm.patchValue(type);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du type', error);
        this.snackBar.open('Erreur lors du chargement du type', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.typeForm.valid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isSubmitting = true;
    const typeData: TypeProjet = this.typeForm.value;

    if (this.isEditMode && this.typeId) {
      this.typeProjetService.updateTypeProjet(this.typeId, typeData).subscribe({
        next: () => {
          this.snackBar.open('Type mis à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/types-projet']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.typeProjetService.createTypeProjet(typeData).subscribe({
        next: () => {
          this.snackBar.open('Type créé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/types-projet']);
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.snackBar.open('Erreur lors de la création', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/types-projet']);
  }
}