import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-validation-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatRadioModule, 
    MatInputModule, 
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2 text-indigo-700">
      <mat-icon>verified</mat-icon>
      Validation de l'Étape
    </h2>
    
    <mat-dialog-content class="mat-typography !pt-4 space-y-6">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p class="text-sm text-gray-500 mb-1">Étape à valider :</p>
        <p class="font-bold text-lg text-gray-800">{{ data.etapeNom }}</p>
      </div>

      <div class="space-y-4">
        <h3 class="text-md font-semibold text-gray-700">Votre Décision :</h3>
        <mat-radio-group [(ngModel)]="decision" class="flex flex-col gap-3">
          <mat-radio-button value="APPROUVEE" color="primary">
            <span class="flex items-center gap-2">
               <mat-icon class="text-green-500">check_circle</mat-icon>
               <span class="font-medium text-green-700">Approuver l'étape</span>
            </span>
          </mat-radio-button>
          
          <mat-radio-button value="DEMANDE_MODIFICATION" color="accent">
            <span class="flex items-center gap-2">
               <mat-icon class="text-orange-500">edit_note</mat-icon>
               <span class="font-medium text-orange-700">Demander une modification</span>
            </span>
          </mat-radio-button>

          <mat-radio-button value="REJETEE" color="warn">
            <span class="flex items-center gap-2">
               <mat-icon class="text-red-500">cancel</mat-icon>
               <span class="font-medium text-red-700">Rejeter l'étape</span>
            </span>
          </mat-radio-button>
        </mat-radio-group>
      </div>

      <div class="pt-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Commentaire (obligatoire si rejet ou modification)</mat-label>
          <textarea matInput [(ngModel)]="commentaire" rows="4" placeholder="Ex: Veuillez corriger le point 3..."></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pb-6 !pr-6">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" [disabled]="!isFormValid()" (click)="confirmer()">
        Confirmer la décision
      </button>
    </mat-dialog-actions>
  `
})
export class ValidationDialogComponent {
  decision: string = 'APPROUVEE';
  commentaire: string = '';

  constructor(
    public dialogRef: MatDialogRef<ValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { etapeNom: string }
  ) {}

  isFormValid(): boolean {
    if ((this.decision === 'REJETEE' || this.decision === 'DEMANDE_MODIFICATION') && !this.commentaire.trim()) {
      return false;
    }
    return true;
  }

  confirmer(): void {
    if (this.isFormValid()) {
      this.dialogRef.close({ decision: this.decision, commentaire: this.commentaire });
    }
  }
}
