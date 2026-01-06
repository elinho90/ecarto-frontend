import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Site } from '../../models/site.model';
import { TypeSite } from '../../enums/type-site.enum';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() sites: Site[] = [];
  @Input() height: string = '400px';
  @Input() showControls: boolean = true;
  @Output() siteClick = new EventEmitter<Site>();

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private markerClusterGroup?: L.LayerGroup;

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sites'] && !changes['sites'].firstChange) {
      this.updateMarkers();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    // Forcer le rendu après l'initialisation pour éviter les bugs de taille
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('Conteneur de la carte non trouvé');
      return;
    }

    this.map = L.map('map', {
      center: [7.54, -5.54], // Côte d'Ivoire (Centre)
      zoom: 7,
      zoomControl: this.showControls
    });

    // Utilisation de CartoDB Voyager
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    (this.map as any)._loaded = true;

    // Écouter le redimensionnement de la fenêtre pour ajuster la carte
    window.addEventListener('resize', () => {
      if (this.map && (this.map as any)._loaded) {
        this.map.invalidateSize();
      }
    });

    this.updateMarkers();
  }

  private updateMarkers(): void {
    this.clearMarkers();

    if (this.sites.length === 0) {
      return;
    }

    const bounds: L.LatLngTuple[] = [];

    this.sites.forEach(site => {
      if (site.latitude && site.longitude) {
        const marker = this.createMarker(site);
        this.markers.push(marker);
        bounds.push([site.latitude, site.longitude]);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Très important pour Leaflet quand le conteneur change de taille ou apparaît
    setTimeout(() => this.map.invalidateSize(), 100);
  }

  private createMarker(site: Site): L.Marker {
    const icon = this.createCustomIcon(site.type);
    const marker = L.marker([site.latitude, site.longitude], { icon });

    const popupContent = this.createPopupContent(site);
    marker.bindPopup(popupContent);

    marker.on('click', () => {
      this.siteClick.emit(site);
    });

    marker.addTo(this.map);
    return marker;
  }

  private createCustomIcon(typeSite: TypeSite): L.DivIcon {
    return L.divIcon({
      html: `<div class="site-marker-pulse"></div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  private createPopupContent(site: Site): string {
    const adresse = site.adresse || '';
    const ville = site.ville || '';
    const contact = site.contactPersonne || 'N/A';
    const telephone = site.contactTelephone || 'N/A';

    return `
      <div class="popup-content">
        <h3>${site.nom}</h3>
        <p><strong>Adresse:</strong> ${adresse}, ${ville}</p>
        <p><strong>Type:</strong> ${this.formatTypeSite(site.type)}</p>
        <p><strong>Statut:</strong> ${this.formatStatut(site.statut)}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Tél:</strong> ${telephone}</p>
        <div class="popup-actions">
          <button onclick="window.location.href='/dashboard/sites/${site.id}'" 
                  class="mat-button mat-primary">
            Voir détails
          </button>
        </div>
      </div>
    `;
  }

  private formatTypeSite(typeSite: TypeSite): string {
    return typeSite.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatStatut(statut: string): string {
    return statut.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  public updateSites(newSites: Site[]): void {
    this.sites = newSites;
    this.updateMarkers();
  }

  public centerOnSite(site: Site): void {
    if (site.latitude && site.longitude) {
      this.map.setView([site.latitude, site.longitude], 15);
    }
  }
}