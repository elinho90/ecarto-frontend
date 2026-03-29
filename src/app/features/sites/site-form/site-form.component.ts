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
import { Site, TypeSite, StatutSite } from '../../../shared/models/site.model';
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
            <mat-icon class="mr-2">location_on</mat-icon>
            {{ isEditMode ? 'Modifier le Site' : 'Ajouter un Nouveau Site' }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="siteForm" (ngSubmit)="onSubmit()" class="form-grid">
            
            <!-- Section: Informations Générales -->
            <h3 class="section-title">Informations Générales</h3>
            
            <!-- Nom -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom du site *</mat-label>
              <input matInput formControlName="nom" placeholder="Entrez le nom du site">
              <mat-error *ngIf="siteForm.get('nom')?.hasError('required')">Le nom est requis</mat-error>
              <mat-error *ngIf="siteForm.get('nom')?.hasError('minlength')">Minimum 3 caractères</mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Description du site"></textarea>
            </mat-form-field>

            <!-- Type -->
            <mat-form-field appearance="outline">
              <mat-label>Type de site *</mat-label>
              <mat-select formControlName="type">
                <mat-option *ngFor="let t of typesSite" [value]="t.value">{{ t.label }}</mat-option>
              </mat-select>
              <mat-error *ngIf="siteForm.get('type')?.hasError('required')">Le type est requis</mat-error>
            </mat-form-field>

            <!-- Statut -->
            <mat-form-field appearance="outline">
              <mat-label>Statut *</mat-label>
              <mat-select formControlName="statut">
                <mat-option *ngFor="let s of statutsSite" [value]="s.value">{{ s.label }}</mat-option>
              </mat-select>
              <mat-error *ngIf="siteForm.get('statut')?.hasError('required')">Le statut est requis</mat-error>
            </mat-form-field>

            <!-- Section: Localisation -->
            <h3 class="section-title">Localisation</h3>

            <!-- Adresse -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse *</mat-label>
              <input matInput formControlName="adresse" placeholder="Adresse complète">
              <mat-error *ngIf="siteForm.get('adresse')?.hasError('required')">L'adresse est requise</mat-error>
            </mat-form-field>

            <!-- Ville -->
            <mat-form-field appearance="outline">
              <mat-label>Ville *</mat-label>
              <input matInput formControlName="ville" placeholder="Entrez la ville">
              <mat-error *ngIf="siteForm.get('ville')?.hasError('required')">La ville est requise</mat-error>
            </mat-form-field>

            <!-- Région -->
            <mat-form-field appearance="outline">
              <mat-label>Région *</mat-label>
              <input matInput formControlName="region" placeholder="Entrez la région">
              <mat-error *ngIf="siteForm.get('region')?.hasError('required')">La région est requise</mat-error>
            </mat-form-field>

            <!-- Pays -->
            <mat-form-field appearance="outline">
              <mat-label>Pays</mat-label>
              <input matInput formControlName="pays" placeholder="Pays">
            </mat-form-field>

            <!-- Latitude -->
            <mat-form-field appearance="outline">
              <mat-label>Latitude *</mat-label>
              <input matInput type="number" step="0.0001" formControlName="latitude" placeholder="Ex: 5.3600">
              <mat-error *ngIf="siteForm.get('latitude')?.hasError('required')">La latitude est requise</mat-error>
              <mat-error *ngIf="siteForm.get('latitude')?.hasError('min') || siteForm.get('latitude')?.hasError('max')">Entre -90 et 90</mat-error>
            </mat-form-field>

            <!-- Longitude -->
            <mat-form-field appearance="outline">
              <mat-label>Longitude *</mat-label>
              <input matInput type="number" step="0.0001" formControlName="longitude" placeholder="Ex: -4.0083">
              <mat-error *ngIf="siteForm.get('longitude')?.hasError('required')">La longitude est requise</mat-error>
              <mat-error *ngIf="siteForm.get('longitude')?.hasError('min') || siteForm.get('longitude')?.hasError('max')">Entre -180 et 180</mat-error>
            </mat-form-field>

            <!-- Section: Contact -->
            <h3 class="section-title">Informations de Contact</h3>

            <!-- Contact Personne -->
            <mat-form-field appearance="outline">
              <mat-label>Personne de contact</mat-label>
              <input matInput formControlName="contactPersonne" placeholder="Nom du contact">
            </mat-form-field>

            <!-- Contact Téléphone -->
            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="contactTelephone" placeholder="+225 XX XX XX XX">
              <mat-error *ngIf="siteForm.get('contactTelephone')?.hasError('pattern')">Format invalide</mat-error>
            </mat-form-field>

            <!-- Contact Email -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="contactEmail" placeholder="contact@example.com">
              <mat-error *ngIf="siteForm.get('contactEmail')?.hasError('email')">Email invalide</mat-error>
            </mat-form-field>

            <!-- Section: Détails Opérationnels -->
            <h3 class="section-title">Détails Opérationnels</h3>

            <!-- Nombre Employés -->
            <mat-form-field appearance="outline">
              <mat-label>Nombre d'employés</mat-label>
              <input matInput type="number" formControlName="nombreEmployes" placeholder="0">
              <mat-error *ngIf="siteForm.get('nombreEmployes')?.hasError('min')">Doit être positif</mat-error>
            </mat-form-field>

            <!-- Horaires Ouverture -->
            <mat-form-field appearance="outline">
              <mat-label>Horaires d'ouverture</mat-label>
              <input matInput formControlName="horairesOuverture" placeholder="Ex: Lun-Ven 8h-17h">
            </mat-form-field>

            <!-- Équipements -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Équipements</mat-label>
              <textarea matInput formControlName="equipements" rows="2" placeholder="Liste des équipements disponibles"></textarea>
            </mat-form-field>

            <!-- Boutons -->
            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()" [disabled]="isSubmitting">
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="siteForm.invalid || isSubmitting">
                <mat-icon *ngIf="!isSubmitting">save</mat-icon>
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                {{ isEditMode ? 'Enregistrer' : 'Créer le Site' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .site-form-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .section-title {
      grid-column: 1 / -1;
      margin: 16px 0 8px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f57c00;
      color: #f57c00;
      font-size: 1.1rem;
    }
    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
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

  // Options pour les selects - alignées avec le backend
  typesSite = [
    { value: TypeSite.SIEGE_SOCIAL, label: 'Siège Social' },
    { value: TypeSite.BUREAU_REGIONAL, label: 'Bureau Régional' },
    { value: TypeSite.CENTRE_OPERATIONNEL, label: 'Centre Opérationnel' },
    { value: TypeSite.DATACENTER, label: 'Datacenter' },
    { value: TypeSite.SITE_CLIENT, label: 'Site Client' },
    { value: TypeSite.FORMATION, label: 'Centre de Formation' }
  ];

  statutsSite = [
    { value: StatutSite.ACTIF, label: 'Actif' },
    { value: StatutSite.INACTIF, label: 'Inactif' },
    { value: StatutSite.EN_CONSTRUCTION, label: 'En Construction' },
    { value: StatutSite.EN_MAINTENANCE, label: 'En Maintenance' }
  ];

  constructor() {
    this.siteForm = this.fb.group({
      // Informations générales
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      type: [TypeSite.BUREAU_REGIONAL, [Validators.required]],
      statut: [StatutSite.ACTIF, [Validators.required]],
      // Localisation
      adresse: ['', [Validators.required]],
      ville: ['', [Validators.required]],
      region: ['', [Validators.required]],
      pays: ["Côte d'Ivoire"],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      // Contact
      contactPersonne: [''],
      contactTelephone: ['', [Validators.pattern(/^\+?[0-9\s\-()]+$/)]],
      contactEmail: ['', [Validators.email]],
      // Détails opérationnels
      nombreEmployes: [null, [Validators.min(1)]],
      horairesOuverture: [''],
      equipements: ['']
    });
  }

  ngOnInit(): void {
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