import { Component, OnInit, AfterViewInit } from '@angular/core';
import { StopService } from '../../services/stop.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { RecOrt } from '../../models/rec-ort.model';
import * as L from 'leaflet';
import { RecHp } from '../../models/rec-hp.model';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// Fix Leaflet marker icon issues in Angular
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-stop-detail',
  templateUrl: './stop-detail.component.html',
  styleUrls: ['./stop-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    Button,
    InputText,
    Tooltip,
    InputNumber,
    LeafletModule,
    DropdownModule
  ]
})
export class StopDetailComponent implements OnInit, AfterViewInit {
  recOrt?: RecOrt
  private map?: L.Map;
  private ortMarker?: L.Marker;
  private hpMarkers: L.Marker[] = [];
  isNew: boolean = false; // Track if creating new stop
  isGroup: boolean = false;
  groupRefId: number = 0;
  groupChildren: any[] = [];

  onrTypOptions = [
    { label: 'Haltepunkt', value: 1 },
    { label: 'Betriebshofpunkt', value: 2 },
    { label: 'Ortsmarke', value: 3 },
    { label: 'LSA-Punkt', value: 4 }
  ];

  // Decimal degree display values
  latDecimal: number = 0;
  lonDecimal: number = 0;

  constructor(private route: ActivatedRoute, private router: Router, private stopService: StopService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const stopId = params['stopId']; // This maps to ORT_NR now or 'group'

      // Check if creating a new stop (handle both 'add' and 'new')
      if (stopId === 'add' || stopId === 'new' || !stopId) {
        this.isNew = true;
        this.isGroup = false;
        this.recOrt = new RecOrt();
        this.recOrt.ONR_TYP_NR = 1;
        this.recOrt.BASIS_VERSION = 1; // Default
        this.recOrt.ORT_NR = 0; // Will be set by user or backend

        // Check if creating a sub-stop
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['parentOrtNr']) {
            this.recOrt!.ORT_REF_ORT = +queryParams['parentOrtNr'];
          }
          if (queryParams['basisVersion']) {
            this.recOrt!.BASIS_VERSION = +queryParams['basisVersion'];
          }
        });

        this.syncDecimalFromVdv();
        setTimeout(() => {
          if (!this.map) this.initMap();
          else this.updateMap();
        }, 0);
      } else if (stopId === 'group') {
        // GROUP MODE
        this.isGroup = true;
        this.isNew = false;
        this.route.queryParams.subscribe(queryParams => {
          this.groupRefId = +queryParams['refId'];
          const basisVersion = +queryParams['basisVersion'] || 1;

          this.stopService.getGroupDetails(this.groupRefId, basisVersion).subscribe(data => {
            this.recOrt = data.parent;
            this.groupChildren = data.children;

            // Map Logic for Group: Center on first child if available
            this.syncDecimalFromVdv();
            setTimeout(() => {
              if (!this.map) this.initMap();
              else this.updateMap();
            }, 0);
          });
        });

      } else {
        // Loading existing stop
        this.isGroup = false;
        this.route.queryParams.subscribe(queryParams => { // Subscribe to query params
          const basisVersion = queryParams['basisVersion'];
          this.stopService.getRecOrtById(+stopId, basisVersion).subscribe(ort => {
            this.recOrt = ort;
            this.syncDecimalFromVdv();
            setTimeout(() => {
              if (!this.map) this.initMap();
              else this.updateMap();
            }, 0);
          });
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (!document.getElementById('map')) return;
    if (this.map) return;

    this.map = L.map('map').setView([52.022862, 8.532795], 13); // Bielefeld Jahnplatz

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    if (this.recOrt) {
      this.updateMap();
    }
  }

  private updateMap(): void {
    if (!this.map || !this.recOrt) return;

    // Clear existing markers
    if (this.ortMarker) this.map.removeLayer(this.ortMarker);
    this.hpMarkers.forEach(m => this.map?.removeLayer(m));
    this.hpMarkers = [];

    // Determine Coords
    // For Group: Use its own valid coords if real Parent, or avg of children?
    // Current Logic: recOrt is Parent Info. Does it have coords? 
    // If virtual: No.
    // If real: Yes.
    // If no coords, try to use first child?
    let lat = 52.022862; // Bielefeld Jahnplatz
    let lng = 8.532795;

    if (this.recOrt.ORT_POS_BREITE && this.recOrt.ORT_POS_LAENGE) {
      lat = this.recOrt.ORT_POS_BREITE / 10000000;
      lng = this.recOrt.ORT_POS_LAENGE / 10000000;
    } else if (this.isGroup && this.groupChildren.length > 0) {
      // Use first child for map center
      const child = this.groupChildren[0];
      if (child.ORT_POS_BREITE) {
        lat = child.ORT_POS_BREITE / 10000000;
        lng = child.ORT_POS_LAENGE / 10000000;
      }
    }

    this.map.setView([lat, lng], 16);
    this.recOrt.ORT_POS_BREITE = Math.round(lat * 10000000); // Sync back if virtual for display
    this.recOrt.ORT_POS_LAENGE = Math.round(lng * 10000000);

    // Marker
    // If Virtual Group, maybe don't show a draggable marker that implies editing?
    // Or show it but it doesn't save coords unless we implement group coord update (on parentRecOrt).
    if (!this.isGroup || (this.recOrt as any).virtual === false) {
      this.ortMarker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.ortMarker.bindPopup(`<b>${this.recOrt.ORT_NAME}</b><br>ORT_NR: ${this.recOrt.ORT_NR}`);

      this.ortMarker.on('dragend', (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        if (this.recOrt) {
          this.recOrt.ORT_POS_BREITE = Math.round(position.lat * 10000000);
          this.recOrt.ORT_POS_LAENGE = Math.round(position.lng * 10000000);
          // Sync decimal display values
          this.latDecimal = position.lat;
          this.lonDecimal = position.lng;
        }
      });
    }

    // Show Children markers for group?
    if (this.isGroup) {
      this.groupChildren.forEach(child => {
        if (child.ORT_POS_BREITE) {
          const cLat = child.ORT_POS_BREITE / 10000000;
          const cLng = child.ORT_POS_LAENGE / 10000000;
          const marker = L.marker([cLat, cLng], {
            icon: L.divIcon({ className: 'bg-blue-500 rounded-full w-2 h-2' })
          }).addTo(this.map!);
          marker.bindPopup(`<b>${child.ORT_NAME}</b><br>${child.ORT_NR}`);
          this.hpMarkers.push(marker);
        }
      });
    }


    if (this.recOrt.recHps) {
      // Logic for HP markers could go here if they have coordinates
    }
  }

  // Called when decimal inputs change - update VDV values and map
  onCoordinateChange(): void {
    if (!this.recOrt) return;

    // Convert decimal to VDV integer format
    this.recOrt.ORT_POS_BREITE = Math.round(this.latDecimal * 10000000);
    this.recOrt.ORT_POS_LAENGE = Math.round(this.lonDecimal * 10000000);

    // Update marker position on map
    if (this.map && this.ortMarker) {
      const newPos = new L.LatLng(this.latDecimal, this.lonDecimal);
      this.ortMarker.setLatLng(newPos);
      this.map.setView(newPos, this.map.getZoom());
    }
  }

  // Update decimal values from VDV format
  private syncDecimalFromVdv(): void {
    if (this.recOrt) {
      this.latDecimal = this.recOrt.ORT_POS_BREITE ? this.recOrt.ORT_POS_BREITE / 10000000 : 52.022862;
      this.lonDecimal = this.recOrt.ORT_POS_LAENGE ? this.recOrt.ORT_POS_LAENGE / 10000000 : 8.532795;
    }
  }

  onSubmit(): void {
    if (!this.recOrt || !this.recOrt.ORT_NR) {
      console.error('ORT_NR is required');
      return;
    }

    if (this.isGroup) {
      // Update Group
      // We use groupRefId for identification
      // We send basically ORT_NAME (mapped to ORT_REF_ORT_NAME), ORT_REF_ORT_LangNr (from ORT_REF_ORT_LangNr field)
      // Adjust payload
      const payload = {
        ORT_REF_ORT_NAME: this.recOrt.ORT_NAME,
        ORT_REF_ORT_LangNr: this.recOrt.ORT_REF_ORT_LangNr,
        ORT_REF_ORT_KUERZEL: this.recOrt.ORT_REF_ORT_KUERZEL
      };

      this.stopService.updateGroup(this.groupRefId, payload, this.recOrt.BASIS_VERSION).subscribe({
        next: () => {
          console.log('Group updated');
          // Maybe reload?
        },
        error: err => console.error('Error updating group', err)
      });
      return;
    }

    if (this.isNew) {
      // Create new stop
      this.stopService.createRecOrt(this.recOrt).subscribe({
        next: (created: any) => {
          this.recOrt = created;
          this.isNew = false;
          this.updateMap();
          console.log('Stop created successfully');
        },
        error: (err: any) => {
          console.error('Error creating stop:', err);
        }
      });
    } else {
      // Update existing stop
      this.stopService.updateRecOrt(this.recOrt.ORT_NR, this.recOrt).subscribe({
        next: (updated: any) => {
          this.recOrt = updated;
          this.updateMap();
          console.log('Stop updated successfully');
        },
        error: (err: any) => {
          console.error('Error updating stop:', err);
        }
      });
    }
  }

  addHp(): void {
    if (!this.recOrt) return;
    const newHp = new RecHp();
    newHp.ORT_NR = this.recOrt.ORT_NR;
    newHp.BASIS_VERSION = this.recOrt.BASIS_VERSION;
    // Find max HP_NR? Or let backend handle it? 
    // For now, let's just push it to the list and let user edit.
    if (!this.recOrt.recHps) this.recOrt.recHps = [];
    newHp.HALTEPUNKT_NR = this.recOrt.recHps.length + 1;
    this.recOrt.recHps.push(newHp);
  }

  saveHp(hp: RecHp): void {
    // Check if new or existing? 
    // If it exists in backend, update. If not, create.
    // Simple check: try update, if fails, create? Or easier: separate create/update based on some flag.
    // For now, let's assume if it has data it's an update, but we just created it in frontend.
    // Better: Helper method in service?
    // Let's just try create always if we assume 'upsert' or use update if it was loaded.

    // We can use the service methods we added.
    this.stopService.updateRecHp(hp).subscribe({
      next: () => console.log('HP updated'),
      error: () => {
        // If 404, maybe create?
        this.stopService.createRecHp(hp).subscribe(() => console.log('HP created'));
      }
    });
  }

  deleteHp(hp: RecHp): void {
    if (!confirm('Haltepunkt wirklich löschen?')) return;
    this.stopService.deleteRecHp(hp.ORT_NR, hp.HALTEPUNKT_NR).subscribe(() => {
      if (this.recOrt && this.recOrt.recHps) {
        this.recOrt.recHps = this.recOrt.recHps.filter(h => h.HALTEPUNKT_NR !== hp.HALTEPUNKT_NR);
      }
    });
  }

  addSubOrt(): void {
    // Navigate to new stop creation with parent ORT_NR as query param
    if (this.recOrt && this.recOrt.ORT_NR) {
      this.router.navigate(['/stops/add'], {
        queryParams: {
          parentOrtNr: this.recOrt.ORT_NR,
          basisVersion: this.recOrt.BASIS_VERSION
        }
      });
    }
  }
}
