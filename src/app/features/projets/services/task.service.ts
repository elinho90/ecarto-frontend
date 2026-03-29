import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskReorder, TasksGrouped } from '../../../shared/models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private readonly API_URL = 'http://localhost:8080/api/v1';

    constructor(private http: HttpClient) { }

    getTasksByProjet(projetId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.API_URL}/projets/${projetId}/tasks`);
    }

    getTasksGrouped(projetId: number): Observable<TasksGrouped> {
        return this.http.get<TasksGrouped>(`${this.API_URL}/projets/${projetId}/tasks/grouped`);
    }

    getTaskStatistics(projetId: number): Observable<{ total: number, todo: number, inProgress: number, done: number }> {
        return this.http.get<any>(`${this.API_URL}/projets/${projetId}/tasks/statistics`);
    }

    createTask(projetId: number, task: Partial<Task>): Observable<Task> {
        return this.http.post<Task>(`${this.API_URL}/projets/${projetId}/tasks`, task);
    }

    updateTask(taskId: number, task: Partial<Task>): Observable<Task> {
        return this.http.put<Task>(`${this.API_URL}/tasks/${taskId}`, task);
    }

    reorderTask(taskId: number, reorder: TaskReorder): Observable<Task> {
        return this.http.put<Task>(`${this.API_URL}/tasks/${taskId}/reorder`, reorder);
    }

    deleteTask(taskId: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/tasks/${taskId}`);
    }
}
