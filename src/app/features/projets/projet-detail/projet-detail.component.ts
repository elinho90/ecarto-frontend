import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { ProjetService } from '../services/projet.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SharedModule } from '../../../shared/shared.module';
import { KanbanBoardComponent } from '../../../shared/components/kanban/kanban-board.component';

import { SuiviWorkflowComponent } from './suivi-workflow.component';
import { ProjetDocumentsComponent } from './projet-documents.component';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    ButtonComponent,
    SharedModule,
    FormsModule,
    KanbanBoardComponent,
    SuiviWorkflowComponent,
    ProjetDocumentsComponent
  ],
  template: `
    <div class="detail-container animate-fade-in" *ngIf="!isLoading; else loading">
      <!-- Header -->
      <div class="detail-header mb-6">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <button mat-icon-button (click)="goBack()" matTooltip="Retour à la liste">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <h1 class="text-3xl font-bold text-gray-900">{{ projet?.nom }}</h1>
              <app-badge [variant]="getStatusVariant(projet?.statut!)">{{ projet?.statut }}</app-badge>
            </div>
            <p class="text-gray-500 ml-12">Code Projet: #{{ projet?.id }} | Créé le {{ projet?.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>
          
          <div class="flex gap-3">
            <app-button variant="secondary" icon="fas fa-edit" (clicked)="editProjet()">Modifier</app-button>
            <app-button variant="primary" icon="fas fa-file-pdf" (clicked)="exportPDF()" [loading]="isExporting">Exporter PDF</app-button>
            <app-button variant="ghost" icon="fas fa-envelope" (clicked)="sendByEmail()" [loading]="isEmailing">Envoyer par Email</app-button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <mat-tab-group class="project-tabs" animationDuration="200ms">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">info</mat-icon>
            Détails
          </ng-template>
          
          <div class="tab-content">
            <div class="grid grid-cols-3 gap-6">
              <!-- Main Info -->
              <div class="col-span-2 space-y-6">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar color="primary">description</mat-icon>
                    <mat-card-title>Description et Détails</mat-card-title>
                  </mat-card-header>
                  <mat-card-content class="pt-4">
                    <p class="text-gray-700 leading-relaxed mb-6">{{ projet?.description || 'Aucune description fournie.' }}</p>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div class="detail-item">
                        <span class="label">Responsable</span>
                        <span class="value font-semibold">{{ projet?.responsable }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Type de Projet</span>
                        <span class="value">{{ projet?.typeProjetNom || 'Non spécifié' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Site</span>
                        <span class="value">{{ projet?.siteNom || 'Non spécifié' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Priorité</span>
                        <app-badge [variant]="getPriorityVariant(projet?.priorite!)" size="sm">{{ projet?.priorite }}</app-badge>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="team-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar color="accent">group</mat-icon>
                    <mat-card-title>Équipe du Projet</mat-card-title>
                  </mat-card-header>
                  <mat-card-content class="pt-4">
                    <div class="flex flex-wrap gap-4">
                      <div *ngFor="let member of projet?.equipe" class="team-member-chip">
                         <div class="avatar">{{ member.charAt(0) }}</div>
                         <span>{{ member }}</span>
                      </div>
                      <div *ngIf="!projet?.equipe || projet?.equipe?.length === 0" class="text-gray-400 italic">
                        Aucun membre assigné.
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Sidebar Info -->
              <div class="space-y-6">
                <mat-card class="progress-card bg-orange-50">
                  <mat-card-content class="pt-6">
                    <div class="text-center">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-orange-600 font-bold uppercase tracking-wider">Progression</span>
                        <button mat-icon-button color="primary" (click)="toggleEditProgress()" *ngIf="!isEditingProgress" size="small">
                          <mat-icon style="font-size: 18px;">edit</mat-icon>
                        </button>
                      </div>
                      
                      <div *ngIf="!isEditingProgress">
                        <div class="text-5xl font-black text-orange-500 my-2">{{ projet?.progression }}%</div>
                        <div class="w-full bg-orange-200 rounded-full h-3 mt-4">
                          <div class="bg-orange-500 h-3 rounded-full shadow-sm transition-all duration-500" [style.width]="projet?.progression + '%'"></div>
                        </div>
                      </div>

                      <div *ngIf="isEditingProgress" class="py-4 px-2 animate-fade-in">
                        <input type="range" class="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                               [(ngModel)]="tempProgress" min="0" max="100">
                        <div class="flex justify-between items-center mt-4">
                          <span class="text-2xl font-bold text-orange-600">{{ tempProgress }}%</span>
                          <div class="flex gap-2">
                             <button mat-icon-button color="warn" (click)="toggleEditProgress()">
                               <mat-icon>close</mat-icon>
                             </button>
                             <button mat-icon-button color="primary" (click)="saveProgress()">
                               <mat-icon>check</mat-icon>
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="budget-card">
                  <mat-card-content class="pt-6">
                    <div class="flex items-center gap-4">
                      <div class="icon-box bg-blue-50 text-blue-600">
                        <mat-icon>payments</mat-icon>
                      </div>
                      <div>
                        <span class="text-sm text-gray-500 block">Budget Alloué</span>
                        <span class="text-2xl font-bold text-gray-900">{{ (projet?.budget || 0).toLocaleString() }} FCFA</span>
                      </div>
                    </div>
                    
                    <mat-divider class="my-4"></mat-divider>
                    
                    <div class="space-y-3">
                      <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Date Début</span>
                        <span class="text-sm font-medium">{{ projet?.dateDebut | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Fin Prévue</span>
                        <span class="text-sm font-medium">{{ projet?.dateFinPrevue | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="flex justify-between" *ngIf="projet?.dateFinReelle">
                         <span class="text-sm text-gray-500">Fin Réelle</span>
                         <span class="text-sm font-medium text-green-600">{{ projet?.dateFinReelle | date:'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="tags-card">
                  <mat-card-header>
                    <mat-card-title class="text-base">Mots-clés</mat-card-title>
                  </mat-card-header>
                  <mat-card-content class="pt-2">
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let tag of getTags()" class="tag">{{ tag }}</span>
                      <span *ngIf="!projet?.tags" class="text-gray-400 text-sm">Aucun tag</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">view_column</mat-icon>
            Kanban
          </ng-template>
          
          <div class="tab-content">
            <app-kanban-board 
              [projetId]="projet?.id" 
              (taskUpdated)="loadProjet(projet?.id)">
            </app-kanban-board>
          </div>
        </mat-tab>

        <!-- NOUVEL ONGLET : SUIVI TEMPS RÉEL -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon text-blue-500">timeline</mat-icon>
            Suivi &amp; Workflow
          </ng-template>
          
          <div class="tab-content p-4">
            <app-suivi-workflow *ngIf="projet?.id" [projetId]="projet.id"></app-suivi-workflow>
          </div>
        </mat-tab>

        <!-- NOUVEL ONGLET : GESTION DOCUMENTAIRE -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon text-indigo-500">folder_open</mat-icon>
            Base Documentaire
          </ng-template>
          
          <div class="tab-content p-4">
            <app-projet-documents *ngIf="projet?.id" [projetId]="projet.id"></app-projet-documents>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <ng-template #loading>
      <div class="flex flex-col items-center justify-center py-24">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="mt-4 text-gray-500 font-medium">Chargement des détails du projet...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 1rem auto;
      padding: 0 1rem;
    }

    .info-card, .team-card, .progress-card, .budget-card, .tags-card {
      border-radius: 12px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .detail-item .label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .team-member-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem 0.5rem 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .team-member-chip .avatar {
      width: 28px;
      height: 28px;
      background: #FF8C00;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .icon-box {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }

    .animate-fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProjetDetailComponent implements OnInit {
  projet: any;
  isLoading = true;
  isExporting = false;
  isEmailing = false;
  isEditingProgress = false;
  tempProgress = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projetService = inject(ProjetService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadProjet(id);
    }
  }

  loadProjet(id: number): void {
    this.isLoading = true;
    this.projetService.getProjetById(id).subscribe({
      next: (data) => {
        this.projet = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement projet', err);
        this.snackBar.open('Erreur lors du chargement du projet', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/projets']);
  }

  editProjet(): void {
    this.router.navigate(['/dashboard/projets/edit', this.projet.id]);
  }

  exportPDF(): void {
    this.isExporting = true;
    this.projetService.generateReport(this.projet.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapport_Projet_${this.projet.nom.replace(/\s+/g, '_')}.pdf`;
        a.click();

        // Délai pour s'assurer que le téléchargement commence avant de révoquer l'URL
        setTimeout(() => window.URL.revokeObjectURL(url), 100);

        this.isExporting = false;
        this.snackBar.open('Rapport exporté avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erreur export PDF', err);
        this.snackBar.open('Erreur lors de l\'export PDF', 'Fermer', { duration: 3000 });
        this.isExporting = false;
      }
    });
  }

  sendByEmail(): void {
    const email = prompt('Entrez l\'adresse email du destinataire:');
    if (!email) return;

    this.isEmailing = true;
    this.snackBar.open('Envoi de l\'email...', 'Fermer', { duration: 2000 });
    this.projetService.sendReport(this.projet.id, email).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || 'Rapport envoyé par email avec succès', 'Fermer', { duration: 4000 });
        this.isEmailing = false;
      },
      error: (err) => {
        console.error('Erreur envoi email', err);
        const errorMsg = err.error?.message || 'Erreur lors de l\'envoi de l\'email. Vérifiez votre configuration SMTP.';
        this.snackBar.open(errorMsg, 'Fermer', { duration: 6000 });
        this.isEmailing = false;
      }
    });
  }

  getTags(): string[] {
    if (!this.projet?.tags) return [];
    return this.projet.tags.split(',').map((t: string) => t.trim());
  }

  getStatusVariant(statut: string): 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral' {
    const map: Record<string, 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral'> = {
      'EN_COURS': 'success',
      'TERMINE': 'primary',
      'ANNULE': 'error',
      'PREVU': 'info'
    };
    return map[statut] || 'neutral';
  }

  getPriorityVariant(priorite: string): 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral' {
    const map: Record<string, 'success' | 'primary' | 'error' | 'warning' | 'info' | 'neutral'> = {
      'CRITIQUE': 'error',
      'HAUTE': 'warning',
      'MOYENNE': 'info',
      'FAIBLE': 'success'
    };
    return map[priorite] || 'neutral';
  }

  toggleEditProgress(): void {
    this.isEditingProgress = !this.isEditingProgress;
    if (this.isEditingProgress) {
      this.tempProgress = this.projet?.progression || 0;
    }
  }

  saveProgress(): void {
    if (this.tempProgress === this.projet.progression) {
      this.isEditingProgress = false;
      return;
    }

    this.projetService.updateProjectProgress(this.projet.id, this.tempProgress).subscribe({
      next: (updatedProjet: any) => {
        this.projet.progression = updatedProjet.progression;
        this.projet.statut = updatedProjet.statut;
        this.isEditingProgress = false;
        this.snackBar.open('Progression mise à jour', 'Fermer', { duration: 2000 });
      },
      error: (err) => {
        console.error('Erreur MAJ progression', err);
        this.snackBar.open('Erreur mise à jour', 'Fermer', { duration: 3000 });
      }
    });
  }
}