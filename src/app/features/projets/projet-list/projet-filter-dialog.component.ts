import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

// Définition locale des enums (identique à projet-list.component.ts)
enum StatutProjet {
    PLANIFIE = 'PLANIFIE',
    EN_COURS = 'EN_COURS',
    EN_PAUSE = 'EN_PAUSE',
    TERMINE = 'TERMINE',
    ANNULE = 'ANNULE'
}

enum PrioriteProjet {
    BASSE = 'BASSE',
    MOYENNE = 'MOYENNE',
    HAUTE = 'HAUTE',
    CRITIQUE = 'CRITIQUE'
}

@Component({
    selector: 'app-projet-filter-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule
    ],
    template: `
    <h2 mat-dialog-title>Filtrer les projets</h2>
    <mat-dialog-content>
      <div class="filter-container">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="selectedStatut">
            <mat-option [value]="null">Tous les statuts</mat-option>
            <mat-option [value]="StatutProjet.PLANIFIE">Planifié</mat-option>
            <mat-option [value]="StatutProjet.EN_COURS">En cours</mat-option>
            <mat-option [value]="StatutProjet.EN_PAUSE">En pause</mat-option>
            <mat-option [value]="StatutProjet.TERMINE">Terminé</mat-option>
            <mat-option [value]="StatutProjet.ANNULE">Annulé</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Priorité</mat-label>
          <mat-select [(ngModel)]="selectedPriorite">
            <mat-option [value]="null">Toutes les priorités</mat-option>
            <mat-option [value]="PrioriteProjet.BASSE">Basse</mat-option>
            <mat-option [value]="PrioriteProjet.MOYENNE">Moyenne</mat-option>
            <mat-option [value]="PrioriteProjet.HAUTE">Haute</mat-option>
            <mat-option [value]="PrioriteProjet.CRITIQUE">Critique</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-button (click)="onReset()">Réinitialiser</button>
      <button mat-raised-button color="primary" (click)="onApply()">Appliquer</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .filter-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 300px;
      padding: 1rem 0;
    }
    .w-full {
      width: 100%;
    }
  `]
})
export class ProjetFilterDialogComponent {
    selectedStatut: StatutProjet | null;
    selectedPriorite: PrioriteProjet | null;

    // Rendre les enums accessibles au template
    StatutProjet = StatutProjet;
    PrioriteProjet = PrioriteProjet;

    constructor(
        public dialogRef: MatDialogRef<ProjetFilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.selectedStatut = data?.statut || null;
        this.selectedPriorite = data?.priorite || null;
    }

    onApply(): void {
        this.dialogRef.close({
            statut: this.selectedStatut,
            priorite: this.selectedPriorite
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onReset(): void {
        this.selectedStatut = null;
        this.selectedPriorite = null;
    }
}