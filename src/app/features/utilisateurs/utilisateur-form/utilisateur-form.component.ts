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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UtilisateurService } from '../services/utilisateur.service';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { Role, RoleLabels } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-utilisateur-form',
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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './utilisateur-form.component.html',
  styleUrls: ['./utilisateur-form.component.scss']
})
export class UtilisateurFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private utilisateurService = inject(UtilisateurService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  utilisateurForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  utilisateurId?: number;

  // Expose Role enum and labels to template
  roles = Object.values(Role);
  roleLabels = RoleLabels;

  constructor() {
    this.utilisateurForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      password: ['', [Validators.minLength(6)]],
      role: [Role.OBSERVATEUR, [Validators.required]],
      telephone: ['', [Validators.maxLength(20)]],
      departement: ['', [Validators.maxLength(100)]],
      poste: ['', [Validators.maxLength(100)]],
      actif: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.utilisateurId = +id;
      this.loadUtilisateur();
      // Password not required for edit mode
      this.utilisateurForm.get('password')?.clearValidators();
      this.utilisateurForm.get('password')?.updateValueAndValidity();
    } else {
      // Password required for new users
      this.utilisateurForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.utilisateurForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUtilisateur(): void {
    if (!this.utilisateurId) return;
    this.isLoading = true;
    this.utilisateurService.getUtilisateurById(this.utilisateurId).subscribe({
      next: (utilisateur) => {
        this.utilisateurForm.patchValue({
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          role: utilisateur.role,
          telephone: utilisateur.telephone,
          departement: utilisateur.departement,
          poste: utilisateur.poste,
          actif: utilisateur.actif
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateur', err);
        this.snackBar.open('Erreur lors du chargement de l\'utilisateur', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/utilisateurs']);
      }
    });
  }

  onSubmit(): void {
    if (this.utilisateurForm.invalid) {
      this.utilisateurForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const utilisateurData: Utilisateur = this.utilisateurForm.value;

    // Don't send password if it's empty in edit mode
    if (this.isEditMode && !utilisateurData.password) {
      delete (utilisateurData as any).password;
    }

    const request = this.isEditMode && this.utilisateurId
      ? this.utilisateurService.updateUtilisateur(this.utilisateurId, utilisateurData)
      : this.utilisateurService.createUtilisateur(utilisateurData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Utilisateur ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès`,
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/dashboard/utilisateurs']);
      },
      error: (err) => {
        console.error('Erreur enregistrement utilisateur', err);
        this.snackBar.open(
          err.error?.message || 'Erreur lors de l\'enregistrement',
          'Fermer',
          { duration: 5000 }
        );
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/utilisateurs']);
  }

  getRoleLabel(role: Role): string {
    return this.roleLabels[role];
  }
}