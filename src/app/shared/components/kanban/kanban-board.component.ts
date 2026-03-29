import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Task, TaskStatus, TasksGrouped } from '../../models/task.model';
import { TaskService } from '../../../features/projets/services/task.service';
import { TaskFormDialogComponent } from './task-form-dialog.component';

@Component({
    selector: 'app-kanban-board',
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    template: `
    <div class="kanban-container">
      <div class="kanban-header">
        <h2>
          <mat-icon>view_column</mat-icon>
          Tableau Kanban
        </h2>
        <div class="stats" *ngIf="stats">
          <span class="stat-badge todo">{{ stats.todo }} À faire</span>
          <span class="stat-badge progress">{{ stats.inProgress }} En cours</span>
          <span class="stat-badge done">{{ stats.done }} Terminé</span>
        </div>
      </div>

      <div class="kanban-board" *ngIf="!isLoading">
        <!-- À Faire Column -->
        <div class="kanban-column todo">
          <div class="column-header">
            <span class="column-title">
              <mat-icon>pending_actions</mat-icon>
              À Faire
            </span>
            <span class="task-count">{{ todoTasks.length }}</span>
          </div>
          <div
            class="task-list"
            cdkDropList
            #todoList="cdkDropList"
            [cdkDropListData]="todoTasks"
            [cdkDropListConnectedTo]="[inProgressList, doneList]"
            (cdkDropListDropped)="onDrop($event, 'TODO')">
            <div class="task-card" *ngFor="let task of todoTasks" cdkDrag>
              <div class="task-content">
                <h4>{{ task.title }}</h4>
                <p *ngIf="task.description">{{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}</p>
              </div>
              <div class="task-actions">
                <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editTask(task)">
                    <mat-icon>edit</mat-icon> Modifier
                  </button>
                  <button mat-menu-item (click)="deleteTask(task)" class="delete-btn">
                    <mat-icon>delete</mat-icon> Supprimer
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
          <button class="add-task-btn" (click)="addTask('TODO')">
            <mat-icon>add</mat-icon> Ajouter une tâche
          </button>
        </div>

        <!-- En Cours Column -->
        <div class="kanban-column in-progress">
          <div class="column-header">
            <span class="column-title">
              <mat-icon>sync</mat-icon>
              En Cours
            </span>
            <span class="task-count">{{ inProgressTasks.length }}</span>
          </div>
          <div
            class="task-list"
            cdkDropList
            #inProgressList="cdkDropList"
            [cdkDropListData]="inProgressTasks"
            [cdkDropListConnectedTo]="[todoList, doneList]"
            (cdkDropListDropped)="onDrop($event, 'IN_PROGRESS')">
            <div class="task-card" *ngFor="let task of inProgressTasks" cdkDrag>
              <div class="task-content">
                <h4>{{ task.title }}</h4>
                <p *ngIf="task.description">{{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}</p>
              </div>
              <div class="task-actions">
                <button mat-icon-button [matMenuTriggerFor]="menu2" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu2="matMenu">
                  <button mat-menu-item (click)="editTask(task)">
                    <mat-icon>edit</mat-icon> Modifier
                  </button>
                  <button mat-menu-item (click)="deleteTask(task)" class="delete-btn">
                    <mat-icon>delete</mat-icon> Supprimer
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
          <button class="add-task-btn" (click)="addTask('IN_PROGRESS')">
            <mat-icon>add</mat-icon> Ajouter une tâche
          </button>
        </div>

        <!-- Terminé Column -->
        <div class="kanban-column done">
          <div class="column-header">
            <span class="column-title">
              <mat-icon>check_circle</mat-icon>
              Terminé
            </span>
            <span class="task-count">{{ doneTasks.length }}</span>
          </div>
          <div
            class="task-list"
            cdkDropList
            #doneList="cdkDropList"
            [cdkDropListData]="doneTasks"
            [cdkDropListConnectedTo]="[todoList, inProgressList]"
            (cdkDropListDropped)="onDrop($event, 'DONE')">
            <div class="task-card" *ngFor="let task of doneTasks" cdkDrag>
              <div class="task-content">
                <h4>{{ task.title }}</h4>
                <p *ngIf="task.description">{{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}</p>
              </div>
              <div class="task-actions">
                <button mat-icon-button [matMenuTriggerFor]="menu3" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu3="matMenu">
                  <button mat-menu-item (click)="editTask(task)">
                    <mat-icon>edit</mat-icon> Modifier
                  </button>
                  <button mat-menu-item (click)="deleteTask(task)" class="delete-btn">
                    <mat-icon>delete</mat-icon> Supprimer
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
          <button class="add-task-btn" (click)="addTask('DONE')">
            <mat-icon>add</mat-icon> Ajouter une tâche
          </button>
        </div>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Chargement des tâches...</p>
      </div>
    </div>
  `,
    styles: [`
    .kanban-container {
      padding: 20px;
    }

    .kanban-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 700;
        color: #1A237E;
        margin: 0;

        mat-icon {
          color: #FF6F00;
        }
      }

      .stats {
        display: flex;
        gap: 12px;

        .stat-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;

          &.todo { background: #FFF3E0; color: #E65100; }
          &.progress { background: #E3F2FD; color: #1565C0; }
          &.done { background: #E8F5E9; color: #2E7D32; }
        }
      }
    }

    .kanban-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      min-height: 500px;
    }

    .kanban-column {
      background: #F8FAFC;
      border-radius: 16px;
      padding: 16px;
      min-height: 400px;
      display: flex;
      flex-direction: column;

      &.todo .column-header { border-left-color: #FF6F00; }
      &.in-progress .column-header { border-left-color: #1976D2; }
      &.done .column-header { border-left-color: #2E7D32; }
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-radius: 12px;
      border-left: 4px solid #1A237E;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);

      .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 15px;
        color: #1A237E;

        mat-icon { font-size: 20px; width: 20px; height: 20px; }
      }

      .task-count {
        background: #1A237E;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
      }
    }

    .task-list {
      flex: 1;
      min-height: 200px;
    }

    .task-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: grab;
      transition: all 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      &:active { cursor: grabbing; }

      .task-content {
        flex: 1;
        
        h4 {
          margin: 0 0 6px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1A237E;
        }

        p {
          margin: 0;
          font-size: 12px;
          color: #6C757D;
          line-height: 1.4;
        }
      }

      .task-actions {
        button { 
          color: #ADB5BD; 
          &:hover { color: #1A237E; }
        }
      }
    }

    .cdk-drag-preview {
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border-radius: 12px;
    }

    .cdk-drag-placeholder {
      opacity: 0.4;
    }

    .cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .add-task-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: transparent;
      border: 2px dashed #DDE2E6;
      border-radius: 12px;
      color: #6C757D;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: auto;

      &:hover {
        background: white;
        border-color: #FF6F00;
        color: #FF6F00;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 16px;
      color: #6C757D;
    }

    .delete-btn { color: #DC3545 !important; }

    @media (max-width: 1024px) {
      .kanban-board {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
    @Input() projetId!: number;
    @Output() taskUpdated = new EventEmitter<void>();

    todoTasks: Task[] = [];
    inProgressTasks: Task[] = [];
    doneTasks: Task[] = [];
    isLoading = true;
    stats: { total: number; todo: number; inProgress: number; done: number } | null = null;

    constructor(
        private taskService: TaskService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadTasks();
    }

    loadTasks(): void {
        this.isLoading = true;
        this.taskService.getTasksGrouped(this.projetId).subscribe({
            next: (grouped) => {
                this.todoTasks = grouped.TODO || [];
                this.inProgressTasks = grouped.IN_PROGRESS || [];
                this.doneTasks = grouped.DONE || [];
                this.updateStats();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', { duration: 3000 });
            }
        });
    }

    updateStats(): void {
        this.stats = {
            total: this.todoTasks.length + this.inProgressTasks.length + this.doneTasks.length,
            todo: this.todoTasks.length,
            inProgress: this.inProgressTasks.length,
            done: this.doneTasks.length
        };
    }

    onDrop(event: CdkDragDrop<Task[]>, targetStatus: string): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }

        const task = event.container.data[event.currentIndex];
        this.taskService.reorderTask(task.id!, {
            newStatut: targetStatus as TaskStatus,
            newOrder: event.currentIndex
        }).subscribe({
            next: () => {
                this.updateStats();
                this.taskUpdated.emit();
            },
            error: () => {
                this.loadTasks();
                this.snackBar.open('Erreur lors du déplacement', 'Fermer', { duration: 3000 });
            }
        });
    }

    addTask(status: string): void {
        const dialogRef = this.dialog.open(TaskFormDialogComponent, {
            width: '500px',
            data: { projetId: this.projetId, statut: status }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadTasks();
                this.taskUpdated.emit();
            }
        });
    }

    editTask(task: Task): void {
        const dialogRef = this.dialog.open(TaskFormDialogComponent, {
            width: '500px',
            data: { task, projetId: this.projetId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadTasks();
                this.taskUpdated.emit();
            }
        });
    }

    deleteTask(task: Task): void {
        if (confirm('Supprimer cette tâche ?')) {
            this.taskService.deleteTask(task.id!).subscribe({
                next: () => {
                    this.loadTasks();
                    this.snackBar.open('Tâche supprimée', 'Fermer', { duration: 2000 });
                    this.taskUpdated.emit();
                },
                error: () => {
                    this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
                }
            });
        }
    }
}
