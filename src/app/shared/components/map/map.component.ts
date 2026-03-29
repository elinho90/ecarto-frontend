import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { Site, StatutSite } from '../../models/site.model';
import { TypeSite } from '../../enums/type-site.enum';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() sites: Site[] = [];
  @Input() height: string = '500px';
  @Input() showControls: boolean = true;
  @Output() siteClick = new EventEmitter<Site>();

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private markerClusterGroup: any; // L.MarkerClusterGroup
  private heatLayer: any; // L.HeatLayer
  private baseLayers: { [key: string]: L.TileLayer } = {};

  // State
  currentLayer: 'standard' | 'satellite' = 'standard';
  useClusters: boolean = false;
  showHeatmap: boolean = false;

  // Measure tool
  isMeasuring: boolean = false;
  measurePoints: L.LatLng[] = [];
  measurePolyline?: L.Polyline;
  measureMarkers: L.CircleMarker[] = [];
  measureDistance: number = 0;

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sites'] && !changes['sites'].firstChange) {
      this.updateMapContent();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Define Base Layers
    this.baseLayers['standard'] = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      maxZoom: 20
    });

    this.baseLayers['satellite'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19
    });

    this.map = L.map('map', {
      center: [7.54, -5.54], // Centre Côte d'Ivoire
      zoom: 7,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
      layers: [this.baseLayers['standard']]
    });

    if (this.showControls) L.control.zoom({ position: 'topright' }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));

    // Force resize
    setTimeout(() => this.map.invalidateSize(), 500);

    // Initialize Plugins
    this.markerClusterGroup = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true
    });

    this.updateMapContent();
  }

  // --- Layer Management ---

  setLayer(layer: 'standard' | 'satellite'): void {
    if (this.currentLayer === layer) return;

    this.map.removeLayer(this.baseLayers[this.currentLayer]);
    this.map.addLayer(this.baseLayers[layer]);
    this.currentLayer = layer;
  }

  toggleClusters(): void {
    this.useClusters = !this.useClusters;
    if (this.showHeatmap) {
      this.showHeatmap = false;
      if (this.heatLayer) this.map.removeLayer(this.heatLayer);
    }
    this.updateMapContent();
  }

  toggleHeatmap(): void {
    this.showHeatmap = !this.showHeatmap;
    this.updateMapContent();
  }

  // --- Content Updates ---

  private updateMapContent(): void {
    if (!this.map) return;

    // Clear existing content
    this.clearLayers();

    if (this.sites.length === 0) return;

    // Mode 1: Heatmap
    if (this.showHeatmap) {
      const heatPoints = this.sites
        .filter(s => s.latitude && s.longitude)
        .map(s => [s.latitude, s.longitude, 1]); // intensity 1

      if (heatPoints.length > 0) {
        this.heatLayer = (L as any).heatLayer(heatPoints, {
          radius: 25,
          blur: 15,
          maxZoom: 15,
          gradient: { 0.4: 'blue', 0.6: 'lime', 1: 'red' }
        }).addTo(this.map);
      }

      // Also fit bounds for heatmap
      this.fitBoundsToMarkers();
      return;
    }

    // Mode 2: Markers (Cluster or Normal)
    this.prepareMarkers();

    if (this.useClusters) {
      this.markerClusterGroup.clearLayers();
      this.markerClusterGroup.addLayers(this.markers);
      this.map.addLayer(this.markerClusterGroup);
    } else {
      this.markers.forEach(m => m.addTo(this.map));
    }

    // Fit bounds to show all markers
    this.fitBoundsToMarkers();
  }

  private fitBoundsToMarkers(): void {
    if (!this.map) return;

    const latLngs = this.sites
      .filter(s => s.latitude && s.longitude)
      .map(s => L.latLng(s.latitude, s.longitude));

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    } else {
      // Fallback: center on Côte d'Ivoire
      this.map.setView([7.54, -5.54], 7);
    }
  }

  private prepareMarkers(): void {
    this.markers = [];
    this.sites.forEach(site => {
      if (site.latitude && site.longitude) {
        const marker = this.createMarker(site);
        this.markers.push(marker);
      }
    });
  }

  private clearLayers(): void {
    // Remove Clusters
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
      this.map.removeLayer(this.markerClusterGroup);
    }

    // Remove Individual Markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Remove Heatmap
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = undefined;
    }
  }

  // --- Markers Helpers ---

  private createMarker(site: Site): L.Marker {
    const icon = this.createCustomIcon(site);
    const marker = L.marker([site.latitude!, site.longitude!], { icon });

    const popupContent = this.createPopupContent(site);
    marker.bindPopup(popupContent);

    marker.on('click', () => {
      this.siteClick.emit(site);
    });

    return marker;
  }

  private createCustomIcon(site: Site): L.DivIcon {
    // Color mapping based on site STATUS
    let colorClass = 'default-marker';
    const statut = (site.statut?.toString() || '').toUpperCase();

    if (statut === StatutSite.ACTIF) colorClass = 'actif-marker';
    else if (statut === StatutSite.INACTIF) colorClass = 'inactif-marker';
    else if (statut === StatutSite.EN_MAINTENANCE) colorClass = 'maintenance-marker';
    else if (statut === StatutSite.EN_CONSTRUCTION) colorClass = 'construction-marker';

    return L.divIcon({
      html: `<div class="site-marker-pulse ${colorClass}"><span class="pulse-ring"></span></div>`,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  private createPopupContent(site: Site): string {
    const adresse = site.adresse || '';
    const ville = site.ville || '';

    return `
      <div class="popup-content">
        <h3 class="popup-title">${site.nom}</h3>
        <div class="popup-info">
          <p><i class="fas fa-map-marker-alt"></i> ${adresse}, ${ville}</p>
          <p><i class="fas fa-tag"></i> ${this.formatTypeSite(site.type)}</p>
        </div>
        <div class="popup-actions center">
          <button onclick="window.open('https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${site.latitude},${site.longitude}', '_blank')" 
                  class="street-view-btn" title="Voir dans Street View">
            <i class="fas fa-street-view"></i>
          </button>
          <button onclick="window.location.href='/dashboard/sites/${site.id}'" 
                  class="popup-btn">
            Voir détails
          </button>
        </div>
      </div>
    `;
  }

  // --- Measurement Tool ---

  toggleMeasure(): void {
    this.isMeasuring = !this.isMeasuring;
    if (!this.isMeasuring) {
      this.clearMeasure();
    } else {
      // Disable other interactions?
      this.map.getContainer().style.cursor = 'crosshair';
    }
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    if (!this.isMeasuring) return;

    const latlng = e.latlng;
    this.addMeasurePoint(latlng);
  }

  private addMeasurePoint(latlng: L.LatLng): void {
    this.measurePoints.push(latlng);

    // Add point marker
    const marker = L.circleMarker(latlng, {
      radius: 4,
      color: '#FF6F00',
      fillColor: '#fff',
      fillOpacity: 1
    }).addTo(this.map);
    this.measureMarkers.push(marker);

    // Update Polyline
    if (this.measurePolyline) {
      this.measurePolyline.setLatLngs(this.measurePoints);
    } else {
      this.measurePolyline = L.polyline(this.measurePoints, { color: '#FF6F00', weight: 3, dashArray: '5, 10' }).addTo(this.map);
    }

    this.calculateDistance();
  }

  calculateDistance(): void {
    let dist = 0;
    for (let i = 0; i < this.measurePoints.length - 1; i++) {
      dist += this.measurePoints[i].distanceTo(this.measurePoints[i + 1]);
    }
    this.measureDistance = dist;
  }

  clearMeasure(): void {
    this.measurePoints = [];
    if (this.measurePolyline) this.map.removeLayer(this.measurePolyline);
    this.measureMarkers.forEach(m => this.map.removeLayer(m));
    this.measureMarkers = [];
    this.measurePolyline = undefined;
    this.measureDistance = 0;
    this.isMeasuring = false;
    if (this.map) this.map.getContainer().style.cursor = '';
  }

  formatDistance(meters: number): string {
    if (meters > 1000) {
      return (meters / 1000).toFixed(2) + ' km';
    }
    return Math.round(meters) + ' m';
  }

  // --- Utils ---

  private formatTypeSite(typeSite: TypeSite): string {
    return (typeSite || '').toString().replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  public centerOnSite(site: Site): void {
    if (site.latitude && site.longitude) {
      this.map.setView([site.latitude, site.longitude], 16);

      // If we are in cluster mode, we might need to zoom nicely to open the cluster
      if (this.useClusters && this.markerClusterGroup) {
        // The marker might be in a cluster
        // This navigation logic is enough for now, as zoom 16 usually opens clusters
      }
    }
  }
}