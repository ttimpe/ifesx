import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RecSel } from '../../models/rec-sel.model';
import { RecOrt } from '../../models/rec-ort.model';
import { RecSelService } from '../../services/rec-sel.service';
import { CalendarService } from '../../services/calendar.service';
import { StopService } from '../../services/stop.service';

import { forkJoin } from 'rxjs';
import * as L from 'leaflet';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { AutoComplete } from 'primeng/autocomplete';
import { Card } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// ... Leaflet fix code ...

@Component({
    selector: 'app-rec-sel-detail',
    templateUrl: './rec-sel-detail.component.html',
    styleUrls: ['./rec-sel-detail.component.css'],
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,

        TableModule,
        Button,
        InputNumber,
        AutoComplete,
        ToastModule
    ]
})
export class RecSelDetailComponent implements OnInit, AfterViewInit {
    sel: RecSel = new RecSel();
    isNew = true;
    orte: RecOrt[] = [];

    // AutoComplete
    filteredStartOrte: RecOrt[] = [];
    filteredDestOrte: RecOrt[] = [];
    selectedStartOrt: RecOrt | null = null;
    selectedDestOrt: RecOrt | null = null;

    private map?: L.Map;
    private startMarker?: L.Marker;
    private endMarker?: L.Marker;
    private connectionLine?: L.Polyline;

    isLoadingEFA = false;

    constructor(
        private route: ActivatedRoute,
        private selService: RecSelService,
        private stopService: StopService,
        private location: Location,
        private messageService: MessageService,
        private calendarService: CalendarService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.loadOrteAndData();
    }

    private loadOrteAndData() {
        this.stopService.getAllRecOrts().subscribe(orte => {
            this.orte = orte;
            this.handleRouteParams();
        });
    }

    private handleRouteParams() {
        const id = this.route.snapshot.paramMap.get('id');
        // Check for version query param
        const versionParam = this.route.snapshot.queryParamMap.get('version');

        if (id && id !== 'add') {
            this.isNew = false;
            const basisVersion = versionParam ? Number(versionParam) : 1;

            // Parse composite key format: ORT_NR-SEL_ZIEL
            const parts = id.split('-');
            if (parts.length >= 2) {
                const ortNr = +parts[0];
                const selZiel = +parts[1];
                this.selService.getByCompositeKey(ortNr, selZiel, basisVersion).subscribe(data => {
                    this.sel = data;
                    // Pre-fill autocomplete objects if found
                    this.selectedStartOrt = this.orte.find(o => o.ORT_NR === this.sel.ORT_NR) || null;
                    this.selectedDestOrt = this.orte.find(o => o.ORT_NR === this.sel.SEL_ZIEL) || null;

                    this.updateMap();
                });
            }
        } else {
            // New creation: subscribe to global version
            this.calendarService.selectedVersion$.subscribe(v => {
                this.sel.BASIS_VERSION = v || 1;
            });
        }
    }

    filterOrte(event: any, type: 'start' | 'dest') {
        const query = event.query.toLowerCase();
        const filtered = this.orte.filter(o =>
            o.ORT_NAME?.toLowerCase().includes(query) ||
            o.ORT_NR?.toString().includes(query)
        ).slice(0, 15);

        if (type === 'start') {
            this.filteredStartOrte = filtered;
        } else {
            this.filteredDestOrte = filtered;
        }
    }

    onStartSelect(event: any) {
        const ort = event.value ? event.value : event;
        this.sel.ORT_NR = ort.ORT_NR;
        this.sel.ONR_TYP_NR = ort.ONR_TYP_NR;
        this.sel.ORT_NAME = ort.ORT_NAME;
        this.updateMap();
    }

    onDestSelect(event: any) {
        const ort = event.value ? event.value : event;
        this.sel.SEL_ZIEL = ort.ORT_NR;
        this.sel.SEL_ZIEL_TYP = ort.ONR_TYP_NR;
        this.sel.SEL_ZIEL_NAME = ort.ORT_NAME;
        this.updateMap();
    }

    ngAfterViewInit(): void {
        this.initMap();
    }

    private initMap(): void {
        this.map = L.map('map').setView([51.1657, 10.4515], 6); // Default Germany center

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // If data loaded before map init
        if (this.sel.ORT_NR && this.sel.SEL_ZIEL) {
            this.updateMap();
        }
    }

    private updateMap(): void {
        if (!this.map || !this.sel.ORT_NR || !this.sel.SEL_ZIEL) return;

        // Clear existing markers
        if (this.startMarker) this.map.removeLayer(this.startMarker);
        if (this.endMarker) this.map.removeLayer(this.endMarker);
        if (this.connectionLine) this.map.removeLayer(this.connectionLine);

        // Load both start and end ort
        // We can reuse this.selectedStartOrt/DestOrt if available, but for safety fetch by ID in case they were set directly
        forkJoin({
            start: this.stopService.getRecOrtById(this.sel.ORT_NR),
            end: this.stopService.getRecOrtById(this.sel.SEL_ZIEL)
        }).subscribe(({ start, end }) => {
            const points: L.LatLng[] = [];

            if (start && start.ORT_POS_LAENGE && start.ORT_POS_BREITE) {
                const lat = start.ORT_POS_BREITE / 10000000;
                const lng = start.ORT_POS_LAENGE / 10000000;
                const pos = new L.LatLng(lat, lng);
                points.push(pos);

                this.startMarker = L.marker(pos).addTo(this.map!);
                this.startMarker.bindPopup(`<b>Start:</b> ${start.ORT_NAME}<br>ORT_NR: ${start.ORT_NR}`);
            }

            if (end && end.ORT_POS_LAENGE && end.ORT_POS_BREITE) {
                const lat = end.ORT_POS_BREITE / 10000000;
                const lng = end.ORT_POS_LAENGE / 10000000;
                const pos = new L.LatLng(lat, lng);
                points.push(pos);

                this.endMarker = L.marker(pos).addTo(this.map!);
                this.endMarker.bindPopup(`<b>Ziel:</b> ${end.ORT_NAME}<br>ORT_NR: ${end.ORT_NR}`);
            }

            // Draw connection line
            if (points.length === 2) {
                this.connectionLine = L.polyline(points, {
                    color: 'blue',
                    weight: 3,
                    dashArray: '10, 5'
                }).addTo(this.map!);

                // Add distance tooltip
                if (this.sel.SEL_LAENGE) {
                    this.connectionLine.bindTooltip(`${this.sel.SEL_LAENGE}m`, {
                        permanent: true,
                        direction: 'center'
                    });
                }

                // Fit map to show both markers
                const bounds = L.latLngBounds(points);
                this.map!.fitBounds(bounds, { padding: [50, 50] });
            } else if (points.length === 1) {
                this.map!.setView(points[0], 14);
            }
        });
    }

    getDistanceFromEFA() {
        if (!this.selectedStartOrt || !this.selectedDestOrt) {
            this.messageService.add({ severity: 'warn', summary: 'Warnung', detail: 'Bitte Start und Ziel auswählen' });
            return;
        }

        this.isLoadingEFA = true;

        // Use DHID (HST_NR_INTERNATIONAL) if available, otherwise fall back to name
        const originId = this.selectedStartOrt.HST_NR_INTERNATIONAL || this.selectedStartOrt.ORT_NAME;
        const destinationId = this.selectedDestOrt.HST_NR_INTERNATIONAL || this.selectedDestOrt.ORT_NAME;

        const url = `https://westfalenfahrplan.de/nwl-efa/XML_TRIP_REQUEST2?outputFormat=rapidJSON&name_origin=${encodeURIComponent(originId)}&name_destination=${encodeURIComponent(destinationId)}&type_origin=any&type_destination=any&itdTripDateTimeDepArr=dep&anyObjFilter_origin=2&anyObjFilter_destination=2`;

        console.log(`Querying EFA for distance: ${originId} -> ${destinationId}`);

        this.http.get<any>(url).subscribe({
            next: (data) => {
                this.isLoadingEFA = false;
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
                        this.sel.SEL_LAENGE = totalDistance;
                        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: `Distanz aus EFA geladen: ${totalDistance}m` });
                        console.log(`Found total distance from EFA: ${totalDistance}m`);
                        this.updateMap(); // Refresh map to show updated distance
                    } else {
                        console.warn('EFA found a journey but no distance info was provided in the legs.');
                        // Fallback: calculate straight-line distance
                        this.sel.SEL_LAENGE = Math.round(this.calculateStraightLineDistance());
                        this.messageService.add({ severity: 'info', summary: 'Info', detail: `Fallback: Luftliniendistanz ${this.sel.SEL_LAENGE}m` });
                        this.updateMap();
                    }
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Keine Route in EFA gefunden' });
                    console.error('No journeys found in EFA response.');
                }
            },
            error: (err) => {
                this.isLoadingEFA = false;
                console.error('Error fetching distance from EFA:', err);
                // Fallback to straight line on error
                this.sel.SEL_LAENGE = Math.round(this.calculateStraightLineDistance());
                this.messageService.add({ severity: 'warn', summary: 'Warnung', detail: `EFA Fehler - Fallback: Luftlinie ${this.sel.SEL_LAENGE}m` });
                this.updateMap();
            }
        });
    }

    private calculateStraightLineDistance(): number {
        if (!this.selectedStartOrt || !this.selectedDestOrt) return 0;

        const lat1 = (this.selectedStartOrt.ORT_POS_BREITE || 0) / 10000000;
        const lon1 = (this.selectedStartOrt.ORT_POS_LAENGE || 0) / 10000000;
        const lat2 = (this.selectedDestOrt.ORT_POS_BREITE || 0) / 10000000;
        const lon2 = (this.selectedDestOrt.ORT_POS_LAENGE || 0) / 10000000;

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

    save() {
        if (this.isNew) {
            this.selService.create(this.sel).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Relation erstellt' });
                    this.location.back();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Erstellen fehlgeschlagen' })
            });
        } else {
            this.selService.update(this.sel).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Relation gespeichert' });
                    this.location.back();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen' })
            });
        }
    }

    delete() {
        if (!this.isNew && this.sel.ORT_NR && this.sel.SEL_ZIEL) {
            this.selService.delete(this.sel.ORT_NR, this.sel.SEL_ZIEL, this.sel.BASIS_VERSION).subscribe(() => this.location.back());
        }
    }
}
