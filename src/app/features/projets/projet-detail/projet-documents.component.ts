import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-projet-documents',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule],
  template: `
    <div class="documents-container space-y-4">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold flex items-center gap-2 text-indigo-900">
             <mat-icon color="primary">folder_shared</mat-icon> Base Documentaire du Projet
          </h2>
          <p class="text-sm text-gray-500">Gérez les livrables, rapports et pièces jointes rattachés aux étapes.</p>
        </div>
        <button mat-flat-button color="primary">
          <mat-icon>upload_file</mat-icon> Ajouter un document
        </button>
      </div>

      <mat-card class="shadow-sm border border-gray-100">
        <mat-card-content class="!p-0">
          <table mat-table [dataSource]="documents" class="w-full">
            
            <!-- Type Icon Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef class="w-16 text-center">Type</th>
              <td mat-cell *matCellDef="let doc" class="text-center">
                <mat-icon [class]="getIconColor(doc.type)">{{ getIcon(doc.type) }}</mat-icon>
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Nom du Fichier</th>
              <td mat-cell *matCellDef="let doc">
                <span class="font-semibold text-gray-800">{{ doc.nom }}</span>
                <div class="text-xs text-gray-400">Ajouté par {{ doc.auteur }}</div>
              </td>
            </ng-container>

            <!-- Liaison Column -->
            <ng-container matColumnDef="liaison">
              <th mat-header-cell *matHeaderCellDef>Étape Liée</th>
              <td mat-cell *matCellDef="let doc">
                <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {{ doc.etapeCible || 'Général' }}
                </span>
              </td>
            </ng-container>
            
            <!-- Size Column -->
            <ng-container matColumnDef="taille">
              <th mat-header-cell *matHeaderCellDef>Taille</th>
              <td mat-cell *matCellDef="let doc" class="text-gray-500 text-sm">{{ doc.taille }}</td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let doc" class="text-gray-500 text-sm">{{ doc.dateAjout | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
              <td mat-cell *matCellDef="let doc" class="text-right">
                <button mat-icon-button color="primary" title="Télécharger"><mat-icon>download</mat-icon></button>
                <button mat-icon-button color="warn" title="Supprimer"><mat-icon>delete_outline</mat-icon></button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true" class="bg-gray-50"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-blue-50/50 transition-colors"></tr>
          </table>

          <div *ngIf="documents.length === 0" class="p-8 text-center text-gray-400">
             <mat-icon class="text-6xl mb-2 opacity-30">inventory_2</mat-icon>
             <p>Le coffre-fort documentaire est vide.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProjetDocumentsComponent implements OnInit {
  @Input() projetId!: number;

  displayedColumns = ['type', 'nom', 'liaison', 'taille', 'date', 'actions'];
  
  // Données de simulation en attendant d'être branché au Backend (AWS S3 ou Base64)
  documents: any[] = [];

  ngOnInit() {
    // Si projet existant, on affiche de fausses données pour la simulation de maquette
    if (this.projetId) {
      this.documents = [
        { nom: 'Cahier_des_charges_v1.pdf', type: 'PDF', auteur: 'M. Konan', etapeCible: 'Cadrage Initial', taille: '2.4 MB', dateAjout: new Date(2026, 3, 5) },
        { nom: 'Maquettes_UI_Figma.fig', type: 'DESIGN', auteur: 'A. Touré', etapeCible: 'Maquettes UI/UX', taille: '14.1 MB', dateAjout: new Date(2026, 3, 25) },
        { nom: 'Rapport_Audit_Securite.docx', type: 'WORD', auteur: 'L. Bamba', etapeCible: 'Audit Technique', taille: '800 KB', dateAjout: new Date() }
      ];
    }
  }

  getIcon(type: string): string {
    switch(type) {
      case 'PDF': return 'picture_as_pdf';
      case 'WORD': return 'description';
      case 'EXCEL': return 'table_chart';
      case 'DESIGN': return 'brush';
      case 'ZIP': return 'folder_zip';
      default: return 'insert_drive_file';
    }
  }

  getIconColor(type: string): string {
    switch(type) {
      case 'PDF': return 'text-red-500';
      case 'WORD': return 'text-blue-600';
      case 'EXCEL': return 'text-green-600';
      case 'DESIGN': return 'text-purple-500';
      case 'ZIP': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  }
}
