import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TypeProjetService } from '../services/type-projet.service';
import { TypeProjet } from '../../../shared/models/type-projet.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Role } from '../../../shared/enums/role.enum';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-type-projet-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTooltipModule,
    ButtonComponent,
    SharedModule
  ],
  templateUrl: './type-projet-list.component.html',
  styleUrls: ['./type-projet-list.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class TypeProjetListComponent implements OnInit {
  typesProjet: TypeProjet[] = [];
  filteredTypes: TypeProjet[] = [];
  isLoading = true;
  canEdit = false;
  searchControl = new FormControl('');

  // Stats
  totalCount = 0;

  private typeProjetService = inject(TypeProjetService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = !!(currentUser && [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET].includes(currentUser.role as Role));
    this.setupSearch();
    this.loadTypesProjet();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.applyFilter(value || '');
      });
  }

  loadTypesProjet(): void {
    this.isLoading = true;
    console.log('Chargement des types de projet...');
    this.typeProjetService.getAllTypesProjet().subscribe({
      next: (types) => {
        console.log('Types de projet reçus:', types);
        this.typesProjet = types || [];
        this.applyFilter(this.searchControl.value || '');
        this.totalCount = this.typesProjet.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des types:', error);
        this.snackBar.open('Erreur de communication avec le serveur', 'Fermer', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  private applyFilter(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredTypes = this.typesProjet.filter(type =>
      type.nom.toLowerCase().includes(filterValue) ||
      (type.description && type.description.toLowerCase().includes(filterValue))
    );
  }

  onAddNew(): void {
    this.router.navigate(['/dashboard/types-projet/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/types-projet/edit', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type?')) {
      // Logic for delete if service supports it
      this.snackBar.open('Fonctionnalité de suppression à venir', 'Fermer', { duration: 3000 });
    }
  }
}