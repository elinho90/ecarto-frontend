import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, timer } from 'rxjs';
import { Page } from '../models/page.model';

export interface Notification {
    id: number;
    utilisateurId: number;
    type: string;
    titre: string;
    message: string;
    lu: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly API_URL = 'http://localhost:8080/api/v1/notifications';
    private http = inject(HttpClient);

    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    constructor() {
        // Poll for notifications every 60 seconds
        timer(0, 60000).pipe(
            switchMap(() => this.getRecentNotifications())
        ).subscribe(notifications => {
            this.notificationsSubject.next(notifications);
            this.updateUnreadCount();
        });
    }

    getNotifications(page: number = 0, size: number = 20): Observable<Page<Notification>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<Notification>>(this.API_URL, { params });
    }

    getRecentNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.API_URL}/recent`).pipe(
            tap(notifications => this.notificationsSubject.next(notifications))
        );
    }

    updateUnreadCount(): void {
        this.http.get<{ unreadCount: number }>(`${this.API_URL}/unread-count`).subscribe({
            next: (res) => this.unreadCountSubject.next(res.unreadCount),
            error: (err) => console.error('Error fetching unread count', err)
        });
    }

    markAsRead(id: number): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/${id}/read`, {}).pipe(
            tap(() => {
                const current = this.notificationsSubject.value;
                const updated = current.map(n => n.id === id ? { ...n, lu: true } : n);
                this.notificationsSubject.next(updated);
                this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
            })
        );
    }

    markAllAsRead(): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/read-all`, {}).pipe(
            tap(() => {
                const current = this.notificationsSubject.value;
                const updated = current.map(n => ({ ...n, lu: true }));
                this.notificationsSubject.next(updated);
                this.unreadCountSubject.next(0);
            })
        );
    }
}

