import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RapportService } from '../services/rapport.service';
import { ProjetService } from '../../projets/services/projet.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Rapport } from '../../../shared/models/rapport.model';
import { Projet } from '../../../shared/models/projet.model';

@Component({
  selector: 'app-rapport-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Modifier le Rapport' : 'Nouveau Rapport' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="rapportForm" class="flex flex-col gap-4 mt-2">
        <mat-form-field appearance="outline">
          <mat-label>Nom du rapport</mat-label>
          <input matInput formControlName="nom" placeholder="Ex: Rapport de faisabilité Phase 1">
          <mat-error *ngIf="rapportForm.get('nom')?.invalid">Le nom est requis</mat-error>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Projet associé</mat-label>
            <mat-select formControlName="projetId">
              <mat-option *ngFor="let p of projets" [value]="p.id">{{ p.nom }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Niveau de risque</mat-label>
            <mat-select formControlName="risque">
              <mat-option value="FAIBLE">Faible</mat-option>
              <mat-option value="MOYEN">Moyen</mat-option>
              <mat-option value="ELEVE">Élevé</mat-option>
              <mat-option value="CRITIQUE">Critique</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Faisabilité (%)</mat-label>
            <input matInput type="number" formControlName="faisabilite" min="0" max="100">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Durée estimée (mois)</mat-label>
            <input matInput type="number" formControlName="dureeEstimeeMois">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Budget estimé (FCFA)</mat-label>
          <input matInput type="number" formControlName="budgetEstime">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Recommandations</mat-label>
          <textarea matInput formControlName="recommandations" rows="3"></textarea>
        </mat-form-field>

        <div class="file-upload-section" *ngIf="!isEdit">
          <label class="block text-sm font-medium text-gray-700 mb-2">Fichier du rapport (PDF)</label>
          <div class="flex items-center gap-3">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept=".pdf" class="hidden">
            <button mat-stroked-button type="button" (click)="fileInput.click()">
              <mat-icon>upload_file</mat-icon>
              Choisir un fichier
            </button>
            <span class="text-sm text-gray-500" *ngIf="selectedFile">{{ selectedFile.name }}</span>
            <span class="text-sm text-red-500" *ngIf="!selectedFile && formSubmitted">Fichier requis</span>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-2 p-4">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" [disabled]="isLoading" (click)="onSubmit()">
        {{ isLoading ? 'Traitement...' : (isEdit ? 'Mettre à jour' : 'Enregistrer') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
    }
  `]
})
export class RapportFormComponent implements OnInit {
  rapportForm: FormGroup;
  isEdit = false;
  isLoading = false;
  projets: Projet[] = [];
  selectedFile: File | null = null;
  formSubmitted = false;

  private fb = inject(FormBuilder);
  private rapportService = inject(RapportService);
  private projetService = inject(ProjetService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<RapportFormComponent>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  constructor() {
    this.rapportForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      projetId: [null],
      faisabilite: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      risque: ['MOYEN', Validators.required],
      budgetEstime: [null, [Validators.min(0.01)]],
      dureeEstimeeMois: [1, [Validators.required, Validators.min(1), Validators.max(120)]],
      recommandations: ['', [Validators.maxLength(5000)]],
      analyseAutomatique: [false]
    });
  }

  ngOnInit(): void {
    this.loadProjets();
    if (this.data?.rapport) {
      this.isEdit = true;
      this.rapportForm.patchValue(this.data.rapport);
    }
  }

  loadProjets(): void {
    this.projetService.getAllProjets(0, 100).subscribe({
      next: (page) => this.projets = page.content,
      error: (err) => console.error('Erreur chargement projets', err)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.rapportForm.invalid) return;
    if (!this.isEdit && !this.selectedFile) return;

    this.isLoading = true;
    const rapportData = this.rapportForm.value;

    if (this.isEdit) {
      this.rapportService.updateRapport(this.data.rapport.id, rapportData).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      const formData = new FormData();
      formData.append('file', this.selectedFile!);

      // On wrap le DTO dans un Blob pour Content-Type application/json
      const rapportBlob = new Blob([JSON.stringify(rapportData)], { type: 'application/json' });
      formData.append('rapport', rapportBlob);

      // Récupérer l'utilisateur connecté pour uploadePar
      const currentUser = this.authService.getCurrentUser();
      const uploadePar = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Utilisateur';

      this.rapportService.createRapport(formData, uploadePar).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Upload error', err);
          this.snackBar.open('Erreur lors de l\'upload du rapport', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}