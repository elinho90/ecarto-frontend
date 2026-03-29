import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../../features/projets/services/task.service';

@Component({
    selector: 'app-task-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatSnackBarModule
    ],
    template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="taskForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" placeholder="Titre de la tâche">
          <mat-error *ngIf="taskForm.get('title')?.hasError('required')">Le titre est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Description optionnelle"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Statut</mat-label>
          <mat-select formControlName="statut">
            <mat-option value="TODO">À Faire</mat-option>
            <mat-option value="IN_PROGRESS">En Cours</mat-option>
            <mat-option value="DONE">Terminé</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!taskForm.valid || isSaving">
        {{ isSaving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer') }}
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class TaskFormDialogComponent {
    taskForm: FormGroup;
    isEdit = false;
    isSaving = false;

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<TaskFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { task?: Task; projetId: number; statut?: string }
    ) {
        this.isEdit = !!data.task;
        this.taskForm = this.fb.group({
            title: [data.task?.title || '', Validators.required],
            description: [data.task?.description || ''],
            statut: [data.task?.statut || data.statut || 'TODO']
        });
    }

    save(): void {
        if (!this.taskForm.valid) return;

        this.isSaving = true;
        const taskData = {
            ...this.taskForm.value,
            projetId: this.data.projetId
        };

        const request = this.isEdit
            ? this.taskService.updateTask(this.data.task!.id!, taskData)
            : this.taskService.createTask(this.data.projetId, taskData);

        request.subscribe({
            next: () => {
                this.snackBar.open(this.isEdit ? 'Tâche modifiée' : 'Tâche créée', 'Fermer', { duration: 2000 });
                this.dialogRef.close(true);
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
            }
        });
    }
}
