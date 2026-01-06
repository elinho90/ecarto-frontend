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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjetService } from '../services/projet.service';
import { TypeProjetService } from '../../types-projet/services/type-projet.service';
import { SiteService } from '../../sites/services/site.service';
import { UtilisateurService } from '../../utilisateurs/services/utilisateur.service';
import { Projet } from '../../../shared/models/projet.model';
import { TypeProjet } from '../../../shared/models/type-projet.model';
import { Site } from '../../../shared/models/site.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { StatutProjet } from '../../../shared/enums/statut-projet.enum';
import { PrioriteProjet } from '../../../shared/enums/priorite-projet.enum';

@Component({
  selector: 'app-projet-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './projet-form.component.html',
  styleUrls: ['./projet-form.component.scss']
})
export class ProjetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projetService = inject(ProjetService);
  private typeProjetService = inject(TypeProjetService);
  private siteService = inject(SiteService);
  private utilisateurService = inject(UtilisateurService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  projetForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  projetId?: number;

  typesProjet: TypeProjet[] = [];
  sites: Site[] = [];
  utilisateurs: Utilisateur[] = [];

  statuts = [
    { value: StatutProjet.PREVU, label: 'À Venir' },
    { value: StatutProjet.EN_COURS, label: 'En Cours' },
    { value: StatutProjet.TERMINE, label: 'Terminé' },
    { value: StatutProjet.ANNULE, label: 'Annulé' }
  ];

  priorites = [
    { value: PrioriteProjet.FAIBLE, label: 'Basse' },
    { value: PrioriteProjet.MOYENNE, label: 'Moyenne' },
    { value: PrioriteProjet.HAUTE, label: 'Haute' },
    { value: PrioriteProjet.CRITIQUE, label: 'Critique' }
  ];

  constructor() {
    this.projetForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: [''],
      statut: [StatutProjet.PREVU, [Validators.required]],
      priorite: [PrioriteProjet.MOYENNE, [Validators.required]],
      responsable: ['', [Validators.required]],
      dateDebut: [new Date(), [Validators.required]],
      dateFinPrevue: [null],
      budget: [null, [Validators.min(0)]],
      progression: [0, [Validators.min(0), Validators.max(100)]],
      typeProjetId: [null, [Validators.required]],
      siteId: [null, [Validators.required]],
      equipe: [[]],
      tags: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projetId = +id;
      this.loadProjet();
    }
    this.loadTypesProjet();
    this.loadSites();
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => this.utilisateurs = users,
      error: (err) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  loadTypesProjet(): void {
    this.typeProjetService.getAllTypesProjet().subscribe({
      next: (types) => this.typesProjet = types,
      error: (err) => console.error('Erreur chargement types projet', err)
    });
  }

  loadSites(): void {
    this.siteService.getAllSitesForMap().subscribe({
      next: (sites) => this.sites = sites,
      error: (err) => console.error('Erreur chargement sites', err)
    });
  }

  loadProjet(): void {
    if (!this.projetId) return;
    this.isLoading = true;
    this.projetService.getProjetById(this.projetId).subscribe({
      next: (projet) => {
        this.projetForm.patchValue({
          ...projet,
          dateDebut: projet.dateDebut ? new Date(projet.dateDebut) : null,
          dateFinPrevue: projet.dateFinPrevue ? new Date(projet.dateFinPrevue) : null
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement projet', err);
        this.snackBar.open('Erreur lors du chargement du projet', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/projets']);
      }
    });
  }

  onSubmit(): void {
    if (this.projetForm.invalid) return;

    this.isSubmitting = true;
    const projetData: Projet = this.projetForm.value;

    const request = this.isEditMode && this.projetId
      ? this.projetService.updateProjet(this.projetId, projetData)
      : this.projetService.createProjet(projetData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Projet ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès`,
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/dashboard/projets']);
      },
      error: (err) => {
        console.error('Erreur enregistrement projet', err);
        this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/projets']);
  }
}