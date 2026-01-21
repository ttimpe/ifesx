import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecUmlauf } from '../../models/rec-umlauf.model';
import { RecUmlaufService } from '../../services/rec-umlauf.service';
import { VehicleService } from '../../services/vehicle.service';
import { CalendarService } from '../../services/calendar.service';
import { MengeFzgTyp } from '../../models/menge-fzg-typ.model';
import { Tagesart } from '../../models/tagesart.model';

import { RecFrtService } from '../../services/rec-frt.service';
import { RecFrt } from '../../models/rec-frt.model';

import { LineService } from '../../services/line.service';
import { RecLid } from '../../models/line.model';
import { MengeBereichService } from '../../services/menge-bereich.service';
import { MengeBereich } from '../../models/menge-bereich.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'app-rec-umlauf-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule,
        TableModule, ButtonModule, InputTextModule, DropdownModule, CardModule, InputNumberModule],
    templateUrl: './rec-umlauf-detail.component.html',
    styleUrls: ['./rec-umlauf-detail.component.css']
})
export class RecUmlaufDetailComponent implements OnInit {
    item: RecUmlauf = new RecUmlauf();
    isNew = true;
    trips: RecFrt[] = [];
    lineVariants: RecLid[] = [];

    vehicleTypes: MengeFzgTyp[] = [];
    tagesarten: Tagesart[] = [];
    bereiche: MengeBereich[] = [];
    fahrtarten = [
        { label: 'Normalfahrt', value: 1 },
        { label: 'Betriebshofausfahrt', value: 2 },
        { label: 'Betriebshofeinfahrt', value: 3 },
        { label: 'Zufahrt', value: 4 }
    ];

    // New trip form
    newTrip: RecFrt = new RecFrt();
    showTripForm = false;

    // Cascading selects: Line -> Variant
    selectedLineNr?: number;
    selectedLineVariant?: RecLid;

    // Get unique lines from variants
    get uniqueLines(): { LI_NR: number, LIN_NAME: string, LIN_FARBE: string }[] {
        const lineMap = new Map<number, { LI_NR: number, LIN_NAME: string, LIN_FARBE: string }>();
        this.lineVariants.forEach(v => {
            if (!lineMap.has(v.LI_NR)) {
                // RecLid has LIN_NAME (or LIDNAME) directly now
                // Also has LI_KUERZEL (or STR_LID)
                const lid = v;
                // Use LI_KUERZEL (Nummer) and LIDNAME (Bezeichnung) to construct a display string for the LINE
                // But this getter groups by LI_NR.
                // We just need a representative name.
                lineMap.set(v.LI_NR, { LI_NR: v.LI_NR, LIN_NAME: `${lid.LI_KUERZEL} - ${lid.LIDNAME}`, LIN_FARBE: lid.LIN_FARBE || '#333' });
            }
        });
        return Array.from(lineMap.values());
    }

    // Get variants filtered by selected line
    get filteredVariants(): RecLid[] {
        if (!this.selectedLineNr) return [];
        return this.lineVariants.filter(v => v.LI_NR === this.selectedLineNr);
    }
    // ...
    constructor(
        private service: RecUmlaufService,
        private vehicleService: VehicleService,
        private calendarService: CalendarService,
        private recFrtService: RecFrtService,

        private lineService: LineService,
        private bereichService: MengeBereichService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.vehicleService.getAllTypes().subscribe(t => this.vehicleTypes = t);
        this.calendarService.getTagesarten().subscribe(t => this.tagesarten = t);

        this.lineService.getLineVariants(0).subscribe(v => {
            this.lineVariants = v.map(x => Object.assign(new RecLid(), x));
        });
        this.bereichService.getAll().subscribe(b => this.bereiche = b);

        if (this.router.url.includes('/new')) {
            this.isNew = true;
            this.item.BASIS_VERSION = 1;
        } else {
            // Check params for ID (UM_UID)
            this.route.params.subscribe(params => {
                const id = params['id'];
                if (id) {
                    this.isNew = false;
                    // We also need TAGESART_NR from query params or assume 1? 
                    // The list sends it in queryParams.
                    this.route.queryParams.subscribe(queries => {
                        const tagesart = queries['tagesart'] || 1;
                        const lookupParams = { UM_UID: id, TAGESART_NR: tagesart };

                        this.service.getOne(lookupParams).subscribe(data => {
                            this.item = data;
                            this.loadTrips();
                        });
                    });
                }
            });
        }
    }

    onLineChange(): void {
        this.selectedLineVariant = undefined;
        this.newTrip.LI_NR = undefined;
        this.newTrip.STR_LI_VAR = undefined;
    }

    onLineVariantChange(): void {
        if (this.selectedLineVariant) {
            this.newTrip.LI_NR = this.selectedLineVariant.LI_NR;
            this.newTrip.STR_LI_VAR = this.selectedLineVariant.STR_LI_VAR;
        }
    }

    // Extended time picker (supports hours > 23 for VDV night service)
    get newTripHours(): number {
        if (!this.newTrip.FRT_START) return 0;
        return Math.floor(this.newTrip.FRT_START / 3600);
    }
    set newTripHours(value: number) {
        const minutes = this.newTripMinutes;
        this.newTrip.FRT_START = (value * 3600) + (minutes * 60);
    }

    get newTripMinutes(): number {
        if (!this.newTrip.FRT_START) return 0;
        return Math.floor((this.newTrip.FRT_START % 3600) / 60);
    }
    set newTripMinutes(value: number) {
        const hours = this.newTripHours;
        this.newTrip.FRT_START = (hours * 3600) + (value * 60);
    }

    loadTrips(): void {
        if (this.item.UM_UID) {
            this.recFrtService.getByUmlauf(this.item.UM_UID, this.item.TAGESART_NR).subscribe(trips => {
                this.trips = trips.sort((a, b) => (a.FRT_START || 0) - (b.FRT_START || 0));
            });
        }
    }

    toggleTripForm(): void {
        this.showTripForm = !this.showTripForm;
        if (this.showTripForm) {
            this.newTrip = new RecFrt();
            this.newTrip.BASIS_VERSION = this.item.BASIS_VERSION;
            this.newTrip.UM_UID = this.item.UM_UID;

            this.newTrip.TAGESART_NR = this.item.TAGESART_NR;
            this.newTrip.BEREICH_NR = 1; // Default to Standard
            this.newTrip.FAHRTART_NR = 1; // Default to Normalfahrt
        }
    }

    addTrip(): void {
        this.recFrtService.getNextFrtFid(this.item.BASIS_VERSION).subscribe(res => {
            this.newTrip.FRT_FID = res.nextFrtFid;
            this.recFrtService.create(this.newTrip).subscribe(() => {
                this.loadTrips();
                this.showTripForm = false;
            });
        });
    }

    deleteTrip(trip: RecFrt): void {
        if (confirm('Fahrt wirklich löschen?')) {
            this.recFrtService.delete(trip.BASIS_VERSION, trip.FRT_FID).subscribe(() => {
                this.loadTrips();
            });
        }
    }

    formatTime(seconds?: number): string {
        if (!seconds) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    getVariantDisplayName(liNr?: number, strLiVar?: string): string {
        if (!liNr || !strLiVar) return '-';
        const variant = this.lineVariants.find(v => v.LI_NR === liNr && v.STR_LI_VAR === strLiVar);
        return variant ? `${variant.STR_LI_VAR} (${variant.LIDNAME})` : `${strLiVar}`;
    }

    getBereichName(bereichNr?: number): string {
        if (!bereichNr) return '-';
        const b = this.bereiche.find(x => x.BEREICH_NR === bereichNr);
        return b ? `${b.STR_BEREICH} (${b.BEREICH_NR})` : `${bereichNr}`;
    }

    getFahrtartName(fahrtartNr?: number): string {
        if (!fahrtartNr) return '-';
        const f = this.fahrtarten.find(x => x.value === fahrtartNr);
        return f ? f.label : `${fahrtartNr}`;
    }

    save(): void {
        if (this.isNew) {
            this.service.create(this.item).subscribe(() => {
                this.router.navigate(['/rec-umlauf']);
            });
        } else {
            this.router.navigate(['/rec-umlauf']);
        }
    }
}

