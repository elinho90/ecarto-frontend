import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SiteService } from '../services/site.service';
import { Site } from '../../../shared/models/site.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-site-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="site-form-container p-6">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <i class="fas fa-map-marker-alt mr-2"></i>
            {{ isEditMode ? 'Modifier le Site' : 'Ajouter un Nouveau Site' }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="siteForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Nom -->
            <mat-form-field class="w-full">
              <mat-label>Nom du site *</mat-label>
              <input matInput formControlName="nom" placeholder="Entrez le nom du site">
              <mat-error *ngIf="siteForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <!-- Ville -->
            <mat-form-field class="w-full">
              <mat-label>Ville *</mat-label>
              <input matInput formControlName="ville" placeholder="Entrez la ville">
              <mat-error *ngIf="siteForm.get('ville')?.hasError('required')">
                La ville est requise
              </mat-error>
            </mat-form-field>

            <!-- Région -->
            <mat-form-field class="w-full">
              <mat-label>Région *</mat-label>
              <input matInput formControlName="region" placeholder="Entrez la région">
              <mat-error *ngIf="siteForm.get('region')?.hasError('required')">
                La région est requise
              </mat-error>
            </mat-form-field>

            <!-- Type -->
            <mat-form-field class="w-full">
              <mat-label>Type de site *</mat-label>
              <mat-select formControlName="type">
                <mat-option value="BUREAU_REGIONAL">Bureau Régional</mat-option>
                <mat-option value="SITE_CLIENT">Site Client</mat-option>
                <mat-option value="CENTRE_OPERATIONS">Centre d'Opérations</mat-option>
                <mat-option value="DEPOT">Dépôt</mat-option>
              </mat-select>
              <mat-error *ngIf="siteForm.get('type')?.hasError('required')">
                Le type est requis
              </mat-error>
            </mat-form-field>

            <!-- Statut -->
            <mat-form-field class="w-full">
              <mat-label>Statut *</mat-label>
              <mat-select formControlName="statut">
                <mat-option value="ACTIF">Actif</mat-option>
                <mat-option value="INACTIF">Inactif</mat-option>
                <mat-option value="MAINTENANCE">En Maintenance</mat-option>
              </mat-select>
              <mat-error *ngIf="siteForm.get('statut')?.hasError('required')">
                Le statut est requis
              </mat-error>
            </mat-form-field>

            <!-- Latitude -->
            <mat-form-field class="w-full">
              <mat-label>Latitude</mat-label>
              <input matInput type="number" formControlName="latitude" placeholder="Ex: 10.1234">
            </mat-form-field>

            <!-- Longitude -->
            <mat-form-field class="w-full">
              <mat-label>Longitude</mat-label>
              <input matInput type="number" formControlName="longitude" placeholder="Ex: -5.5678">
            </mat-form-field>

            <!-- Adresse -->
            <mat-form-field class="w-full">
              <mat-label>Adresse</mat-label>
              <textarea matInput formControlName="adresse" placeholder="Entrez l'adresse complète"></textarea>
            </mat-form-field>

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
    .site-form-container {
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
export class SiteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private siteService = inject(SiteService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  siteForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  siteId?: number;
  canEdit = false;

  constructor() {
    this.siteForm = this.fb.group({
      nom: ['', [Validators.required]],
      ville: ['', [Validators.required]],
      region: ['', [Validators.required]],
      type: ['BUREAU_REGIONAL', [Validators.required]],
      statut: ['ACTIF', [Validators.required]],
      latitude: [null],
      longitude: [null],
      adresse: ['']
    });
  }

  ngOnInit(): void {
    // Vérifier les permissions
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = !!(currentUser && [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET].includes(currentUser.role as Role));

    if (!this.canEdit) {
      this.snackBar.open('Accès refusé: vous n\'avez pas la permission d\'ajouter des sites', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/dashboard/sites']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.siteId = +id;
      this.loadSite();
    }
  }

  loadSite(): void {
    if (!this.siteId) return;
    
    this.isLoading = true;
    this.siteService.getSiteById(this.siteId).subscribe({
      next: (site) => {
        this.siteForm.patchValue(site);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du site', error);
        this.snackBar.open('Erreur lors du chargement du site', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.siteForm.valid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isSubmitting = true;
    const siteData: Site = this.siteForm.value;

    if (this.isEditMode && this.siteId) {
      this.siteService.updateSite(this.siteId, siteData).subscribe({
        next: () => {
          this.snackBar.open('Site mis à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/sites']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.snackBar.open('Erreur lors de la mise à jour du site', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.siteService.createSite(siteData).subscribe({
        next: () => {
          this.snackBar.open('Site créé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/sites']);
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.snackBar.open('Erreur lors de la création du site', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/sites']);
  }
}