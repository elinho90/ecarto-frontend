import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';

import { AuthService } from '../../auth/services/auth.service';
import { Utilisateur } from '../../shared/models/utilisateur.model';
import { Role } from '../../shared/enums/role.enum';
import { SharedModule } from '../../shared/shared.module';
import { NotificationService, Notification } from '../../shared/services/notification.service';
import { ThemeService } from '../../shared/services/theme.service';

interface DashboardStats {
  projectsCount: number;
  activeProjects: number;
  activeSites: number;
  activeUsers: number;
  unreadNotifications: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
    SharedModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: Utilisateur | null = null;
  currentRoute = '';
  sidebarOpen = true;
  today = new Date(); // Added date property
  dashboardStats: DashboardStats = {
    projectsCount: 0,
    activeProjects: 0,
    activeSites: 0,
    activeUsers: 0,
    unreadNotifications: 0
  };

  recentNotifications: Notification[] = [];

  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  public themeService = inject(ThemeService);
  private breakpointObserver = inject(BreakpointObserver);
  private routerSubscription?: Subscription;
  private notificationSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit(): void {
    this.currentUser = this.getCurrentUser(); // ✅ Méthode sécurisée
    this.updateCurrentRoute();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentRoute();
      });

    this.loadDashboardStats();
    this.initNotifications();
  }

  private initNotifications(): void {
    this.notificationSubscription = this.notificationService.notifications$.subscribe(
      notifications => this.recentNotifications = notifications
    );

    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      count => this.dashboardStats.unreadNotifications = count
    );
  }

  markNotificationAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.currentUser?.role;
    if (!userRole) return false;
    return roles.includes(userRole);
  }

  // ✅ MÉTHODE SÉCURISÉE AJOUTÉE
  getSafeCurrentUser(): Utilisateur | null {
    return this.currentUser;
  }

  getCurrentUser(): Utilisateur | null {
    return this.authService.getCurrentUser();
  }

  // ✅ CORRECTIFS ENUMS
  getRoleLabel(role?: Role): string {
    switch (role) {
      case Role.ADMINISTRATEUR_SYSTEME:
        return 'Administrateur';
      case Role.CHEF_DE_PROJET:
        return 'Chef de Projet';
      case Role.DECIDEUR:
        return 'Décideur';
      case Role.ANALYSTE:
      case Role.DEVELOPPEUR:
        return 'Membre de l\'équipe';
      case Role.OBSERVATEUR:
        return 'Observateur';
      default:
        return 'Invité';
    }
  }

  getRoleVariant(role?: Role): 'primary' | 'success' | 'warning' | 'info' | 'neutral' {
    switch (role) {
      case Role.ADMINISTRATEUR_SYSTEME:
        return 'primary';
      case Role.CHEF_DE_PROJET:
        return 'success';
      case Role.DECIDEUR:
        return 'warning';
      case Role.OBSERVATEUR:
        return 'info';
      default:
        return 'neutral';
    }
  }

  updateCurrentRoute(): void {
    this.currentRoute = this.router.url.split('?')[0];
  }

  getCurrentRoute(): string {
    const segments = this.currentRoute.split('/').filter(segment => segment);
    if (segments.length === 0) return 'Tableau de bord';

    const lastSegment = segments[segments.length - 1];
    return this.formatRouteName(lastSegment);
  }

  getPageTitle(): string {
    const segments = this.currentRoute.split('/').filter(segment => segment);
    if (segments.length === 0) return 'Tableau de bord';

    const lastSegment = segments[segments.length - 1];
    return this.formatPageTitle(lastSegment);
  }

  getPageSubtitle(): string {
    const segments = this.currentRoute.split('/').filter(segment => segment);
    if (segments.length === 0) return 'Vue d\'ensemble de votre activité';

    const route = segments[0];
    switch (route) {
      case 'projets':
        return 'Gérez tous vos projets informatiques';
      case 'sites':
        return 'Visualisez et gérez vos sites';
      case 'rapports':
        return 'Consultez les rapports et statistiques';
      case 'types-projet':
        return 'Gérez les types de projet';
      case 'comites':
        return 'Organisez les comités de pilotage';
      case 'entites':
        return 'Gérez les entités commanditaires du groupe';
      case 'utilisateurs':
        return 'Administrez les utilisateurs de la plateforme';
      default:
        return '';
    }
  }

  showPageActions(): boolean {
    return this.currentRoute === '/dashboard';
  }

  private formatRouteName(route: string): string {
    return route
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatPageTitle(route: string): string {
    const formatted = this.formatRouteName(route);
    if (this.currentRoute === '/dashboard') {
      return 'Tableau de bord';
    }
    return formatted;
  }

  private loadDashboardStats(): void {
    setTimeout(() => {
      this.dashboardStats = {
        projectsCount: 24,
        activeProjects: 8,
        activeSites: 15,
        activeUsers: 42,
        unreadNotifications: 3
      };
    }, 500);
  }
}