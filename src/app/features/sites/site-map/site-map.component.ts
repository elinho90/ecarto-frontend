import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map, shareReplay, forkJoin } from 'rxjs';

import { SiteService } from '../services/site.service';
import { Site } from '../../../shared/models/site.model';
import { MapComponent } from '../../../shared/components/map/map.component';
import { TypeSite } from '../../../shared/enums/type-site.enum';
import { StatutSite } from '../../../shared/enums/statut-site.enum';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SharedModule } from '../../../shared/shared.module';
import { ComiteService } from '../../comites/services/comite.service';
import { EntiteService } from '../../entites/services/entite.service';

@Component({
  selector: 'app-site-map',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MapComponent,
    ButtonComponent,
    SharedModule
  ],
  templateUrl: './site-map.component.html',
  styleUrls: ['./site-map.component.scss']
})
export class SiteMapComponent implements OnInit {
  sites: Site[] = [];
  filteredSites: Site[] = [];
  isLoading = true;
  sidebarOpen = true;
  showHeatmap = false;

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  TypeSite = TypeSite;
  StatutSite = StatutSite;

  filterForm: FormGroup;

  typeSiteOptions = Object.values(TypeSite);
  statutOptions = Object.values(StatutSite);
  regions: string[] = [];
  villes: string[] = [];
  comitesOptions: any[] = [];
  entitesOptions: any[] = [];

  isHandset$: Observable<boolean>;

  private siteService = inject(SiteService);
  private fb = inject(FormBuilder);
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private comiteService = inject(ComiteService);
  private entiteService = inject(EntiteService);

  constructor() {
    this.isHandset$ = this.breakpointObserver.observe(['(max-width: 768px)'])
      .pipe(
        map((result: any) => result.matches),
        shareReplay()
      );

    this.filterForm = this.fb.group({
      typeSite: [''],
      statut: [''],
      region: [''],
      ville: [''],
      comite: [''],
      entite: ['']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadReferentiels();

    this.isHandset$.subscribe((isHandset: boolean) => {
      this.sidebarOpen = !isHandset;
    });
  }

  loadReferentiels(): void {
    this.comiteService.getAllComites().subscribe({
      next: (data) => this.comitesOptions = data || [],
      error: () => {}
    });
    this.entiteService.getAllEntites().subscribe({
      next: (data) => this.entitesOptions = data || [],
      error: () => {}
    });
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      sites: this.siteService.getAllSitesForMap(),
      regions: this.siteService.getRegions()
    }).subscribe({
      next: ({ sites, regions }) => {
        this.sites = sites;
        this.filteredSites = sites;
        this.regions = regions;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onRefresh(): void {
    this.loadData();
  }

  onAddSite(): void {
    this.router.navigate(['/dashboard/sites/new']);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.filteredSites = this.sites.filter(site => {
      return (!filters.typeSite || site.type === filters.typeSite) &&
        (!filters.statut || site.statut === filters.statut) &&
        (!filters.region || site.region === filters.region) &&
        (!filters.ville || site.ville === filters.ville);
    });
  }

  onRegionChange(): void {
    const selectedRegion = this.filterForm.get('region')?.value;
    this.filterForm.get('ville')?.setValue('');

    if (selectedRegion) {
      this.siteService.getVillesByRegion(selectedRegion).subscribe({
        next: (villes: string[]) => {
          this.villes = villes;
        }
      });
    } else {
      this.villes = [];
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.villes = [];
  }

  getActiveFiltersCount(): number {
    let count = 0;
    Object.values(this.filterForm.value).forEach(value => {
      if (value) count++;
    });
    return count;
  }

  formatTypeSite(typeSite: TypeSite): string {
    return typeSite.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  formatStatut(statut: StatutSite): string {
    return statut.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleHeatmap(): void {
    if (this.mapComponent) {
      this.mapComponent.toggleHeatmap();
      this.showHeatmap = this.mapComponent.showHeatmap;
    }
  }

  onSiteClick(site: Site): void {
    console.log('Site cliqué:', site);
  }
}