import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProjetService } from '../services/projet.service';
import { SuiviService } from '../services/suivi.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ComiteService } from '../../comites/services/comite.service';
import { EntiteService } from '../../entites/services/entite.service';

@Component({
  selector: 'app-projet-kanban',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DragDropModule,
    MatCardModule, MatIconModule, MatTooltipModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatChipsModule
  ],
  template: `
    <div class="kanban-wrapper p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            <mat-icon class="text-4xl text-orange-500 scale-150 mr-2">view_week</mat-icon>
            Super Kanban Global
          </h1>
          <p class="text-gray-500 mt-2">Glissez et déposez les projets pour changer leur étape de cycle de vie (11 Statuts).</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm border border-gray-300 bg-white rounded-lg p-3 shadow-sm font-semibold text-gray-700">
             Total Projets : {{ totalProjets }}
          </span>
          <span *ngIf="activeFiltersCount > 0" class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold cursor-pointer" (click)="resetFilters()">
            {{ activeFiltersCount }} filtre(s) actif(s) ✕
          </span>
        </div>
      </div>

      <!-- Barre de Filtres Enrichis -->
      <div class="flex flex-wrap gap-3 mb-5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Comité</mat-label>
          <mat-select [(ngModel)]="filterComite" (selectionChange)="applyFilters()">
            <mat-option [value]="''">Tous les comités</mat-option>
            <mat-option *ngFor="let c of comites" [value]="c.id">{{ c.nom }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Entité</mat-label>
          <mat-select [(ngModel)]="filterEntite" (selectionChange)="applyFilters()">
            <mat-option [value]="''">Toutes les entités</mat-option>
            <mat-option *ngFor="let e of entites" [value]="e.id">{{ e.nom }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Responsable</mat-label>
          <mat-select [(ngModel)]="filterResponsable" (selectionChange)="applyFilters()">
            <mat-option [value]="''">Tous les responsables</mat-option>
            <mat-option *ngFor="let r of responsables" [value]="r">{{ r }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Recherche</mat-label>
          <input matInput [(ngModel)]="filterSearch" (input)="applyFilters()" placeholder="Nom du projet...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-8 snap-x" cdkDropListGroup>

        <!-- Colonnes (11 statuts) -->
        <div *ngFor="let col of colonnes" 
             class="kanban-column shrink-0 w-80 bg-gray-100 rounded-xl flex flex-col snap-start border border-gray-200">
          
          <!-- Entête Colonne -->
          <div class="flex items-center justify-between p-3 rounded-t-xl text-white shadow-sm" [style.background]="col.color">
            <div class="flex items-center gap-2 font-bold tracking-wide">
              <mat-icon>{{ col.icon }}</mat-icon>
              {{ col.titre }}
            </div>
            <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{{ projetsParStatut[col.id].length }}</span>
          </div>

          <!-- Zone de Drop -->
          <div class="flex-1 p-3 overflow-y-auto min-h-[300px]"
               cdkDropList
               [id]="col.id"
               [cdkDropListData]="projetsParStatut[col.id]"
               (cdkDropListDropped)="onDrop($event)">
               
            <!-- Cartes Projet -->
            <div *ngFor="let p of projetsParStatut[col.id]" 
                 cdkDrag 
                 (click)="voirProjet(p.id)"
                 class="projet-card bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all group relative">
              
               <div class="flex justify-between items-start mb-2">
                 <h4 class="font-bold text-gray-800 text-sm leading-tight pr-6">{{ p.nom }}</h4>
                 <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <mat-icon class="text-gray-400 scale-75">open_in_new</mat-icon>
                 </div>
               </div>
               
               <p class="text-xs text-gray-500 line-clamp-2 mb-3">{{ p.description || 'Aucune description' }}</p>

               <!-- Badges Informatifs -->
               <div class="flex items-center flex-wrap gap-1.5 text-xs font-semibold mb-2">
                  <span class="text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ p.progression || 0 }}%</span>
                  
                  <!-- Badge Comité -->
                  <span *ngIf="p.comiteNom" class="text-indigo-600 bg-indigo-50 px-2 py-1 rounded truncate max-w-[100px]"
                        [matTooltip]="p.comiteNom">
                    {{ p.comiteNom }}
                  </span>
                  
                  <!-- Badge Entité -->
                  <span *ngIf="p.entiteNom" class="px-2 py-1 rounded truncate max-w-[80px] text-white"
                        [style.background]="p.entiteCouleur || '#6b7280'"
                        [matTooltip]="p.entiteNom">
                    {{ p.entiteNom }}
                  </span>
               </div>

               <!-- Badge Retard (🔴 NOUVEAU) -->
               <div *ngIf="getJoursRetard(p) > 0" 
                    class="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-md mt-1 animate-pulse">
                 <mat-icon class="scale-75">warning</mat-icon>
                 🔴 {{ getJoursRetard(p) }} jour(s) de retard
               </div>

               <div class="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span *ngIf="p.chefProjetNom" class="flex items-center gap-1">
                    <mat-icon class="scale-50">person</mat-icon> {{ p.chefProjetNom }}
                  </span>
                  <span>{{ p.dateDebut | date:'dd/MM' }}</span>
               </div>
               
            </div>

            <!-- Placeholder vide -->
            <div *ngIf="!projetsParStatut[col.id] || projetsParStatut[col.id].length === 0" 
                 class="h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                Glisser ici
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-field { width: 180px; }
    .filter-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    
    ::-webkit-scrollbar { height: 12px; width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 6px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; border: 3px solid #f1f1f1; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      background: white;
      border: 2px solid #3b82f6;
    }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `]
})
export class ProjetKanbanComponent implements OnInit {

  colonnes = [
    { id: 'IDEE', titre: 'Idée', icon: 'lightbulb', color: '#fbbf24' },
    { id: 'CADRAGE', titre: 'Cadrage', icon: 'assignment', color: '#94a3b8' },
    { id: 'ETUDE_FAISABILITE', titre: 'Étude Faisabilité', icon: 'search', color: '#60a5fa' },
    { id: 'VALIDE', titre: 'Validé', icon: 'thumb_up', color: '#34d399' },
    { id: 'EN_COURS', titre: 'En Cours', icon: 'play_circle_outline', color: '#2563eb' },
    { id: 'EN_PAUSE', titre: 'En Pause', icon: 'pause_circle_outline', color: '#f87171' },
    { id: 'RECETTE', titre: 'Recette', icon: 'bug_report', color: '#a78bfa' },
    { id: 'DEPLOIEMENT', titre: 'Déploiement', icon: 'rocket_launch', color: '#f472b6' },
    { id: 'EN_PRODUCTION', titre: 'En Production', icon: 'verified', color: '#10b981' },
    { id: 'CLOTURE', titre: 'Clôturé', icon: 'archive', color: '#475569' },
    { id: 'REJETE', titre: 'Rejeté', icon: 'cancel', color: '#ef4444' },
  ];

  projetsParStatut: { [key: string]: any[] } = {};
  allProjets: any[] = [];
  totalProjets = 0;
  isLoading = false;
  hasError = false;

  // Filtres enrichis
  filterComite: string | number = '';
  filterEntite: string | number = '';
  filterResponsable: string = '';
  filterSearch: string = '';
  comites: any[] = [];
  entites: any[] = [];
  responsables: string[] = [];
  activeFiltersCount = 0;

  private projetService = inject(ProjetService);
  private suiviService = inject(SuiviService);
  private authService = inject(AuthService);
  private comiteService = inject(ComiteService);
  private entiteService = inject(EntiteService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.colonnes.forEach(c => this.projetsParStatut[c.id] = []);
    this.chargerReferentiels();
    this.chargerProjets();
  }

  chargerReferentiels(): void {
    forkJoin({
      comites: this.comiteService.getAllComites().pipe(catchError(() => of([]))),
      entites: this.entiteService.getAllEntites().pipe(catchError(() => of([])))
    }).subscribe(({ comites, entites }) => {
      this.comites = comites || [];
      this.entites = entites || [];
    });
  }

  chargerProjets() {
    this.isLoading = true;
    this.hasError = false;
    this.projetService.getAllProjets(0, 500).subscribe({
      next: (page) => {
        this.allProjets = page.content || [];
        this.totalProjets = this.allProjets.length;

        // Extraire les responsables uniques
        const resps = new Set<string>();
        this.allProjets.forEach((p: any) => {
          if (p.chefProjetNom) resps.add(p.chefProjetNom);
        });
        this.responsables = Array.from(resps).sort();

        this.applyFilters();
        this.isLoading = false;
      },
      error: (e) => {
        this.isLoading = false;
        this.hasError = true;
        const msg = e.status === 403 
          ? 'Accès refusé : droits insuffisants pour charger les projets.' 
          : 'Erreur de chargement des projets. Vérifiez votre connexion.';
        this.snackBar.open(msg, 'X', { duration: 5000 });
      }
    });
  }

  applyFilters(): void {
    // Compter les filtres actifs
    this.activeFiltersCount = 0;
    if (this.filterComite) this.activeFiltersCount++;
    if (this.filterEntite) this.activeFiltersCount++;
    if (this.filterResponsable) this.activeFiltersCount++;
    if (this.filterSearch) this.activeFiltersCount++;

    // Filtrer
    let filtered = [...this.allProjets];
    
    if (this.filterComite) {
      filtered = filtered.filter(p => p.comiteId === this.filterComite);
    }
    if (this.filterEntite) {
      filtered = filtered.filter(p => p.entiteId === this.filterEntite);
    }
    if (this.filterResponsable) {
      filtered = filtered.filter(p => p.chefProjetNom === this.filterResponsable);
    }
    if (this.filterSearch) {
      const s = this.filterSearch.toLowerCase();
      filtered = filtered.filter(p => p.nom?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }

    // Répartir dans les colonnes
    this.colonnes.forEach(c => this.projetsParStatut[c.id] = []);
    this.totalProjets = filtered.length;

    filtered.forEach((p: any) => {
      let s = p.statut;
      if (s === 'PREVU') s = 'IDEE';
      if (s === 'TERMINE') s = 'CLOTURE';
      if (s === 'ANNULE') s = 'REJETE';

      if (this.projetsParStatut[s]) {
        this.projetsParStatut[s].push(p);
      } else {
        this.projetsParStatut['IDEE'].push(p);
      }
    });
  }

  resetFilters(): void {
    this.filterComite = '';
    this.filterEntite = '';
    this.filterResponsable = '';
    this.filterSearch = '';
    this.applyFilters();
  }

  getJoursRetard(projet: any): number {
    if (!projet.dateFin) return 0;
    const dateFin = new Date(projet.dateFin);
    const today = new Date();
    if (dateFin >= today) return 0;
    const diffMs = today.getTime() - dateFin.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  voirProjet(id: number) {
    this.router.navigate(['/dashboard/projets', id]);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const projetData = event.previousContainer.data[event.previousIndex];
      const nouveauStatutId = event.container.id;
      const ancienStatutId = event.previousContainer.id;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const userId = this.authService.getCurrentUser()?.id || 1;

      this.suiviService.changerStatutProjet(projetData.id, {
        nouveauStatut: nouveauStatutId,
        utilisateurId: userId,
        motif: 'Changement de statut via Drag & Drop Kanban'
      }).subscribe({
        next: () => {
          this.snackBar.open(`Projet passé à ${nouveauStatutId} avec succès !`, 'OK', {duration:3000});
        },
        error: (err) => {
           console.error('Erreur changement statut', err);
           this.snackBar.open(err.error?.message || 'Action refusée par le système GS2E.', 'Fermer', {duration:5000});
           
           transferArrayItem(
             event.container.data,
             this.projetsParStatut[ancienStatutId],
             event.currentIndex,
             event.previousIndex
           );
        }
      });
    }
  }
}
