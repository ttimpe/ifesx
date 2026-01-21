import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { RecOm } from '../../models/rec-om.model';
import { RecOmService } from '../../services/rec-om.service';
import { StopService } from '../../services/stop.service';


// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { Card } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber'; // Keep as module as it's not listed for standalone change
import { MessageService } from 'primeng/api';

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
    selector: 'app-rec-om-detail',
    templateUrl: './rec-om-detail.component.html',
    styleUrls: ['./rec-om-detail.component.css'],
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,

        TableModule,
        Button,
        InputText,
        ToastModule,
        InputNumberModule // Re-added as it was removed by the instruction but is a module and likely still needed
    ]
})
export class RecOmDetailComponent implements OnInit, AfterViewInit {
    om: RecOm = new RecOm();
    isNew = true;
    private map?: L.Map;
    private marker?: L.Marker;

    constructor(
        private route: ActivatedRoute,
        private omService: RecOmService,
        private stopService: StopService,
        private location: Location,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'add') {
            this.isNew = false;
            this.omService.getById(+id).subscribe({
                next: (data) => {
                    this.om = data;
                    this.updateMap();
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Ortsmarke nicht laden.' });
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this.initMap();
    }

    private initMap(): void {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        this.map = L.map('map').setView([51.1657, 10.4515], 6); // Default Germany center

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // If we already have the data, update the map
        if (!this.isNew && this.om) {
            this.updateMap();
        }
    }

    private updateMap(): void {
        if (!this.map) return;

        // Try to find coordinates via joined ORT or fetch it
        if (this.om.ort && this.om.ort.ORT_POS_LAENGE && this.om.ort.ORT_POS_BREITE) {
            this.setMapMarker(this.om.ort);
        } else if (this.om.ORT_NR) {
            this.stopService.getRecOrtById(this.om.ORT_NR).subscribe(ort => {
                if (ort) {
                    this.setMapMarker(ort);
                }
            });
        }
    }

    private setMapMarker(ort: any) {
        if (!this.map || !ort.ORT_POS_BREITE || !ort.ORT_POS_LAENGE) return;

        const lat = ort.ORT_POS_BREITE / 10000000;
        const lng = ort.ORT_POS_LAENGE / 10000000;

        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        this.map.setView([lat, lng], 15);
        this.marker = L.marker([lat, lng]).addTo(this.map);
        this.marker.bindPopup(`<b>${ort.ORT_NAME || 'Zugehöriger Ort'}</b><br>ORT_NR: ${ort.ORT_NR}`).openPopup();
    }

    save() {
        const obs = this.isNew
            ? this.omService.create(this.om)
            : this.omService.update(this.om);

        obs.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Gespeichert!' });
                setTimeout(() => this.location.back(), 500);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen.' });
            }
        });
    }

    delete() {
        if (!this.isNew && this.om.id) {
            // Use PrimeNG confirm dialog in real app, simple confirm for now to match interface
            if (confirm('Wirklich löschen?')) {
                this.omService.delete(this.om.id).subscribe(() => this.location.back());
            }
        }
    }
}
