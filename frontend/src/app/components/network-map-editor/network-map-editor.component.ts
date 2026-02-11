import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';

import { RecOrt } from '../../models/rec-ort.model';
import { RecSel } from '../../models/rec-sel.model';
import { RecOm } from '../../models/rec-om.model';
import { StopService } from '../../services/stop.service';
import { RecSelService } from '../../services/rec-sel.service';
import { RecOmService } from '../../services/rec-om.service';
import { CalendarService } from '../../services/calendar.service';

import { RecSelZp } from '../../models/rec-sel-zp.model';
import { RecSelZpService } from '../../services/rec-sel-zp.service';

@Component({
  selector: 'app-network-map-editor',
  templateUrl: './network-map-editor.component.html',
  styleUrls: ['./network-map-editor.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class NetworkMapEditorComponent implements AfterViewInit {
  private map!: L.Map
  stops: RecOrt[] = []
  stop_distances: RecSel[] = []
  ortsmarken: RecOm[] = []
  lsas: RecSelZp[] = [] // Intermediate Points / LSAs

  // Editor Mode
  editorMode: 'distance' | 'ortsmarke' | 'lsa' = 'distance';

  // Selection (for distance mode)
  selectedOriginStop?: RecOrt
  selectedDestinationStop?: RecOrt
  selectedDistanceLine?: L.Polyline

  // New Ortsmarke (for ortsmarke mode)
  newOrtsmarke: RecOm = new RecOm();
  newOrtsmarkePosition?: L.LatLng;
  newOrtsmarkeMarker?: L.Marker;

  // New LSA (for lsa mode)
  newLsa: RecSelZp = new RecSelZp();
  newLsaMarker?: L.Marker;

  // Editor Values
  distance: number = 0 // SEL_LAENGE
  time: number = 60    // SEL_FZEIT

  // State
  selectedBasisVersion: number | undefined;

  constructor(
    private http: HttpClient,
    private stopService: StopService,
    private recSelService: RecSelService,
    private recOmService: RecOmService,
    private recSelZpService: RecSelZpService,
    private calendarService: CalendarService
  ) { }

  ngAfterViewInit() {
    this.initMap();

    // Subscribe to version changes
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedBasisVersion = version || undefined;
      // Reload data if map is initialized
      if (this.map) {
        this.clearMapLayers();
        this.loadStops();
      }
    });
  }

  clearMapLayers() {
    // Clear existing markers/lines
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        this.map.removeLayer(layer);
      }
    });
  }

  setEditorMode(mode: 'distance' | 'ortsmarke' | 'lsa') {
    this.editorMode = mode;
    this.clearSelection();
    this.clearNewOrtsmarke();
    this.clearNewLsa();
  }

  loadStops() {
    this.stopService.getAllRecOrts('', this.selectedBasisVersion).subscribe(stops => {
      // Filter: Only show Sub-Places (Steige), i.e. where ORT_REF_ORT is set (REC_REF_ORT Concept)
      this.stops = stops.filter(s => !!s.ORT_REF_ORT);
      this.createStopMarkers();

      // Load relations only after stops
      this.loadNetworkRelations();
      // Load ortsmarken
      this.loadOrtsmarken();
      // Load LSAs
      this.loadLsas();
    });
  }

  loadNetworkRelations() {
    this.recSelService.getAll(this.selectedBasisVersion).subscribe(relations => {
      this.stop_distances = relations;
      this.createDistancePolylines();
    });
  }

  loadOrtsmarken() {
    this.recOmService.getAll(this.selectedBasisVersion).subscribe(ortsmarken => {
      this.ortsmarken = ortsmarken;
      this.createOrtsmarkenMarkers();
    });
  }

  loadLsas() {
    this.recSelZpService.getAll(this.selectedBasisVersion).subscribe(lsas => {
      this.lsas = lsas;
      this.createLsaMarkers();
    });
  }

  saveDistance() {
    if (this.selectedDestinationStop && this.selectedOriginStop) {

      const newRelation = new RecSel();
      newRelation.BASIS_VERSION = this.selectedBasisVersion || 1;

      // Origin
      newRelation.ORT_NR = this.selectedOriginStop.ORT_NR;
      newRelation.ONR_TYP_NR = this.selectedOriginStop.ONR_TYP_NR;

      // Destination
      newRelation.SEL_ZIEL = this.selectedDestinationStop.ORT_NR;
      newRelation.SEL_ZIEL_TYP = this.selectedDestinationStop.ONR_TYP_NR;

      // Values
      newRelation.SEL_LAENGE = this.distance;

      console.log('Saving RecSel:', newRelation);

      this.recSelService.create(newRelation).subscribe((created) => {
        console.log('Created:', created);
        this.clearSelection();
        this.loadNetworkRelations(); // Refresh map
      });
    }
  }

  saveOrtsmarke() {
    if (this.newOrtsmarkePosition && this.newOrtsmarke.ORT_NR) {
      this.newOrtsmarke.BASIS_VERSION = this.selectedBasisVersion || 1;
      // Use existing or default to 1 (Ortsmarke)
      this.newOrtsmarke.ONR_TYP_NR = this.newOrtsmarke.ONR_TYP_NR || 1;

      console.log('Saving Ortsmarke:', this.newOrtsmarke);

      this.recOmService.create(this.newOrtsmarke).subscribe((created) => {
        console.log('Created Ortsmarke:', created);
        this.clearNewOrtsmarke();
        this.loadOrtsmarken(); // Refresh markers
      });
    }
  }

  saveLsa() {
    // Only if we have valid input
    if (this.newLsa.ORT_NR && this.newLsa.SEL_ZIEL && this.newLsa.ZP_LFD_NR && this.newLsa.ZP_TYP && (this.newLsa as any)._tempPosition) {
      this.newLsa.BASIS_VERSION = this.selectedBasisVersion || 1;

      // 1. Calculate distance from Start Ort to Click Position projected on the line
      // We need coordinates of Start and End Ort
      const startOrt = this.stops.find(s => s.ORT_NR === this.newLsa.ORT_NR);
      const endOrt = this.stops.find(s => s.ORT_NR === this.newLsa.SEL_ZIEL);

      if (startOrt?.ORT_POS_BREITE && startOrt?.ORT_POS_LAENGE && endOrt?.ORT_POS_BREITE && endOrt?.ORT_POS_LAENGE) {
        const startLat = this.vdvToDecimal(startOrt.ORT_POS_BREITE);
        const startLng = this.vdvToDecimal(startOrt.ORT_POS_LAENGE);

        // Calculate distance from Start to Click (Projected? Or just straight line distance from Start?)
        // VDV 452 usually means "Distance from Start Node along the path". 
        // Since we don't have the path geometry, we assume straight line for now or project onto S-D line.
        // Let's project onto S-D line for better accuracy if user clicked slightly off.

        const clickPos = (this.newLsa as any)._tempPosition as L.LatLng;
        const startPos = new L.LatLng(startLat, startLng);

        // Simple distance for now: Start -> Click
        // This is robust enough for simple straight connections.
        const dist = startPos.distanceTo(clickPos);

        this.newLsa.SEL_ZP_LAENGE = Math.round(dist);
      } else {
        // Fallback if no coordinates
        this.newLsa.SEL_ZP_LAENGE = 0;
      }

      // 2. Set ZP_ONR to 0 (Dummy / No specific Ort) as requested
      this.newLsa.ZP_ONR = 0;

      console.log('Saving LSA with Distance:', this.newLsa.SEL_ZP_LAENGE);
      this.recSelZpService.create(this.newLsa).subscribe(createdZp => {
        console.log('Created LSA:', createdZp);
        this.clearNewLsa();
        this.loadLsas();
      });
    }
  }

  private decimalToVdv(decimal: number): number {
    return Math.round(decimal * 10000000);
  }

  clearNewLsa() {
    this.newLsa = new RecSelZp();
    if (this.newLsaMarker) {
      this.newLsaMarker.removeFrom(this.map);
      this.newLsaMarker = undefined;
    }
  }

  createStopMarkers() {
    for (const stop of this.stops) {
      if (stop.ORT_POS_LAENGE && stop.ORT_POS_BREITE) {
        const lat = this.vdvToDecimal(stop.ORT_POS_BREITE);
        const lng = this.vdvToDecimal(stop.ORT_POS_LAENGE);

        if (lat === 0 || lng === 0) continue; // Skip invalid

        const location = new L.LatLng(lat, lng);

        // All markers now represent SubPlaces (Steige) per filter in loadStops
        const markerOptions: L.CircleMarkerOptions = {
          radius: 5,
          color: "#0ea5e9", // Sky blue for Steige/SubPlaces
          fillColor: "#0ea5e9",
          fillOpacity: 0.9,
          weight: 1
        };

        const marker = new L.CircleMarker(location, markerOptions);

        // Store stop data in options for click handler
        (marker.options as any).stop = stop;

        // Add tooltip with name and Steig Info
        const tooltipText = `${stop.ORT_NAME} (Steig ${stop.ORT_NR})`;
        marker.bindTooltip(tooltipText);

        marker.addTo(this.map);
        marker.on("click", (e) => this.onStopClick(e));
      }
    }
  }

  createOrtsmarkenMarkers() {
    for (const om of this.ortsmarken) {
      // Use coordinates from related ort if available
      const ort = om.ort; // Assuming populated by backend or service
      // If ort is not populated, we might need to find it from this.stops
      const relatedOrt = ort || this.stops.find(s => s.ORT_NR === om.ORT_NR);

      if (relatedOrt && relatedOrt.ORT_POS_LAENGE && relatedOrt.ORT_POS_BREITE) {
        const lat = this.vdvToDecimal(relatedOrt.ORT_POS_BREITE);
        const lng = this.vdvToDecimal(relatedOrt.ORT_POS_LAENGE);

        if (lat === 0 || lng === 0) continue;

        const location = new L.LatLng(lat, lng);

        const marker = new L.CircleMarker(location, {
          radius: 6,
          color: "orange",
          fill: true,
          fillOpacity: 0.9
        });

        // Add tooltip with text
        const tooltipText = om.ORM_TEXT || om.ORM_KUERZEL || `OM ${om.ORT_NR}`;
        marker.bindTooltip(tooltipText);

        marker.addTo(this.map);
      }
    }
  }

  createLsaMarkers() {
    // Clear existing LSA markers if any? 
    // Actually clearMapLayers clears everything, so we are good if called from loadStops
    // But if called independently, we might duplicate.
    // For now assume full redraw or we track them. 
    // Let's rely on clearMapLayers being called before loadStops.

    for (const lsa of this.lsas) {
      let lat = 0;
      let lng = 0;

      // 1. Try to use linked Ort coordinates
      if (lsa.zpOrt && lsa.zpOrt.ORT_POS_BREITE && lsa.zpOrt.ORT_POS_LAENGE) {
        lat = this.vdvToDecimal(lsa.zpOrt.ORT_POS_BREITE);
        lng = this.vdvToDecimal(lsa.zpOrt.ORT_POS_LAENGE);
      }
      // 2. Fallback: Interpolate on line if we have distance and relations loaded?
      // Too complex for now, mostly LSAs have an Ort location.

      if (lat === 0 || lng === 0) continue;

      const location = new L.LatLng(lat, lng);

      const marker = new L.CircleMarker(location, {
        radius: 4,
        color: "#dc2626", // Red for Traffic Light/LSA
        fillColor: "#fca5a5",
        fillOpacity: 1,
        weight: 1
      });

      const tooltipText = `LSA #${lsa.ZP_LFD_NR} (Ort ${lsa.ZP_ONR})`;
      marker.bindTooltip(tooltipText);
      marker.addTo(this.map);
    }
  }

  onStopClick(e: any) {
    if (this.editorMode !== 'distance') return;

    const stop = (e.target.options as any).stop as RecOrt;

    if (!this.selectedOriginStop && !this.selectedDestinationStop) {
      this.selectedOriginStop = stop;
    } else if (this.selectedOriginStop && !this.selectedDestinationStop) {
      if (stop.ORT_NR !== this.selectedOriginStop.ORT_NR) {
        this.selectedDestinationStop = stop;
        this.drawSelectionLine();
      }
    }
  }

  onMapClick(e: L.LeafletMouseEvent) {
    if (this.editorMode === 'ortsmarke') {
      this.newOrtsmarkePosition = e.latlng;

      // Remove old marker if exists
      if (this.newOrtsmarkeMarker) {
        this.newOrtsmarkeMarker.removeFrom(this.map);
      }

      // Add new temporary marker
      this.newOrtsmarkeMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'new-ortsmarke-icon',
          html: '<div style="background: orange; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map);
    } else if (this.editorMode === 'lsa') {
      // Handle LSA creation click
      // We probably want to find the nearest RecSel line to autofill ORT_NR / SEL_ZIEL?
      // For now just place the marker. logic to find line can be added later or user selects manually.

      this.clearNewLsa();

      // Add temporary LSA marker
      this.newLsaMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'new-lsa-icon',
          html: '<div style="background: red; width: 16px; height: 16px; border: 2px solid white; transform: rotate(45deg);"></div>', // Diamond shape
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(this.map);

      // We could define a new RecOrt position here?
      // Store visual position for save
      // We need a way to pass this position to the saving logic to creating the intermediate Ort if needed.
      (this.newLsa as any)._tempPosition = e.latlng;
    }
  }

  drawSelectionLine() {
    if (this.selectedOriginStop && this.selectedDestinationStop &&
      this.selectedOriginStop.ORT_POS_BREITE && this.selectedOriginStop.ORT_POS_LAENGE &&
      this.selectedDestinationStop.ORT_POS_BREITE && this.selectedDestinationStop.ORT_POS_LAENGE) {

      const lat1 = this.vdvToDecimal(this.selectedOriginStop.ORT_POS_BREITE);
      const lng1 = this.vdvToDecimal(this.selectedOriginStop.ORT_POS_LAENGE);
      const lat2 = this.vdvToDecimal(this.selectedDestinationStop.ORT_POS_BREITE);
      const lng2 = this.vdvToDecimal(this.selectedDestinationStop.ORT_POS_LAENGE);

      const p1 = new L.LatLng(lat1, lng1);
      const p2 = new L.LatLng(lat2, lng2);

      if (this.selectedDistanceLine) {
        this.selectedDistanceLine.removeFrom(this.map);
      }

      this.selectedDistanceLine = new L.Polyline([p1, p2], { color: 'red', weight: 3, dashArray: '5, 10' });
      this.selectedDistanceLine.addTo(this.map);
    }
  }

  createDistancePolylines() {
    const stopMap = new Map<number, RecOrt>();
    this.stops.forEach(s => stopMap.set(s.ORT_NR, s));

    for (const rel of this.stop_distances) {
      const start = stopMap.get(rel.ORT_NR);
      const end = stopMap.get(rel.SEL_ZIEL);

      if (start && end && start.ORT_POS_BREITE && start.ORT_POS_LAENGE && end.ORT_POS_BREITE && end.ORT_POS_LAENGE) {

        const lat1 = this.vdvToDecimal(start.ORT_POS_BREITE);
        const lng1 = this.vdvToDecimal(start.ORT_POS_LAENGE);
        const lat2 = this.vdvToDecimal(end.ORT_POS_BREITE);
        const lng2 = this.vdvToDecimal(end.ORT_POS_LAENGE);

        if (lat1 === 0 || lng1 === 0 || lat2 === 0 || lng2 === 0) continue;

        const p1 = new L.LatLng(lat1, lng1);
        const p2 = new L.LatLng(lat2, lng2);

        // Connections between SubPlaces (Steige) are often the ones of interest
        // Use a different color if it connects subplaces
        const isSubConnection = !!start.ORT_REF_ORT || !!end.ORT_REF_ORT;
        const color = isSubConnection ? '#10b981' : '#84cc16'; // Emerald for sub, Lime for main
        const weight = isSubConnection ? 2 : 1;

        const polyline = new L.Polyline([p1, p2], { color: color, weight: weight });

        const distText = rel.SEL_LAENGE ? `${rel.SEL_LAENGE}m` : '';
        if (distText) {
          polyline.bindTooltip(distText, { permanent: false, direction: 'center', className: 'bg-transparent border-0 text-xs font-bold text-slate-700' });
        }

        polyline.addTo(this.map);
      }
    }
  }

  private vdvToDecimal(vdv: number): number {
    if (!vdv) return 0;

    // IFES X assumes standard defined in VDV 452 for "Decimal Degrees"
    // Value is stored as Integer: Degrees * 10^7
    // Example: 520542000 -> 52.0542000

    // Note on "DMS" (Degrees Minutes Seconds):
    // Some VDV exports might use DMS (GGGMMSSNNN).
    // However, analysis of sample data (e.g. 517956980) shows minutes > 59 (79),
    // which invalidates DMS. Thus, we enforce Decimal interpretation.

    return vdv / 10000000;
  }

  clearSelection() {
    this.selectedDestinationStop = undefined;
    this.selectedOriginStop = undefined;
    this.distance = 0;
    this.time = 60;
    if (this.selectedDistanceLine) {
      this.selectedDistanceLine.removeFrom(this.map);
      this.selectedDistanceLine = undefined;
    }
  }

  clearNewOrtsmarke() {
    this.newOrtsmarke = new RecOm();
    this.newOrtsmarkePosition = undefined;
    if (this.newOrtsmarkeMarker) {
      this.newOrtsmarkeMarker.removeFrom(this.map);
      this.newOrtsmarkeMarker = undefined;
    }
  }

  initMap() {
    const tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

    this.map = L.map('map', {
      zoomControl: true,
      layers: [tileLayer],
      center: [52.0236952, 8.5315316],
      zoom: 13
    });

    // Add click handler for map
    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));

    // Wait for version selection? Or just try loading default?
    // The subscription in AfterViewInit will trigger load.

    // Initial triggering if version already selected?
    if (!this.selectedBasisVersion) {
      // Maybe calendar service has value?
      // But for now, we rely on the subscription to fire (BehaviorSubject).
    }

    setTimeout(() => {
      this.map.invalidateSize();
    }, 1000);
  }

  // EFA Integration - calculate distance between origin and destination
  getDistanceFromEfa() {
    if (!this.selectedOriginStop || !this.selectedDestinationStop) return;

    // Use DHID (HST_NR_INTERNATIONAL) if available, otherwise fall back to name
    const originId = this.selectedOriginStop.HST_NR_INTERNATIONAL || this.selectedOriginStop.ORT_NAME;
    const destinationId = this.selectedDestinationStop.HST_NR_INTERNATIONAL || this.selectedDestinationStop.ORT_NAME;

    // Type any works with both IDs and names
    // anyObjFilter_origin=2 / anyObjFilter_destination=2 restricts search to stops/stations
    const url = `https://westfalenfahrplan.de/nwl-efa/XML_TRIP_REQUEST2?outputFormat=rapidJSON&name_origin=${encodeURIComponent(originId)}&name_destination=${encodeURIComponent(destinationId)}&type_origin=any&type_destination=any&itdTripDateTimeDepArr=dep&anyObjFilter_origin=2&anyObjFilter_destination=2`;

    console.log(`Querying EFA for distance: ${originId} -> ${destinationId}`);

    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (data.journeys && data.journeys.length > 0) {
          const firstJourney = data.journeys[0];

          // Sum up distances of all legs in the first journey
          let totalDistance = 0;
          if (firstJourney.legs) {
            firstJourney.legs.forEach((leg: any) => {
              if (leg.distance) {
                totalDistance += leg.distance;
              }
            });
          }

          if (totalDistance > 0) {
            this.distance = totalDistance;
            console.log(`Found total distance from EFA: ${totalDistance}m`);
          } else {
            console.warn('EFA found a journey but no distance info was provided in the legs.');
            // Fallback: calculate straight-line distance if EFA fails to provide distance field
            this.distance = Math.round(this.calculateStraightLineDistance());
          }
        } else {
          console.error('No journeys found in EFA response.');
        }
      },
      error: (err) => {
        console.error('Error fetching distance from EFA:', err);
        // Fallback to straight line on error
        this.distance = Math.round(this.calculateStraightLineDistance());
      }
    });
  }

  // Helper for fallback distance calculation
  private calculateStraightLineDistance(): number {
    if (!this.selectedOriginStop || !this.selectedDestinationStop) return 0;

    const lat1 = this.vdvToDecimal(this.selectedOriginStop.ORT_POS_BREITE!);
    const lon1 = this.vdvToDecimal(this.selectedOriginStop.ORT_POS_LAENGE!);
    const lat2 = this.vdvToDecimal(this.selectedDestinationStop.ORT_POS_BREITE!);
    const lon2 = this.vdvToDecimal(this.selectedDestinationStop.ORT_POS_LAENGE!);

    // Haversine formula
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

