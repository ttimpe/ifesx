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

import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-rec-umlauf-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule,
        TableModule, ButtonModule, InputTextModule, DropdownModule, CardModule, InputNumberModule, DialogModule, CheckboxModule],
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

    // Trip form (Create/Edit)
    currentTrip: RecFrt = new RecFrt();
    showTripForm = false;
    isTripEdit = false;

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

    constructor(
        private service: RecUmlaufService,
        private vehicleService: VehicleService,
        private calendarService: CalendarService,
        public recFrtService: RecFrtService, // Made public for template if needed, or strictly private but lint errors suggested access issues? No, just missing methods.

        private lineService: LineService,
        private bereichService: MengeBereichService,
        private route: ActivatedRoute,
        public router: Router // Used in save()
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
        this.currentTrip.LI_NR = undefined;
        this.currentTrip.STR_LI_VAR = undefined;
    }

    onLineVariantChange(): void {
        if (this.selectedLineVariant) {
            this.currentTrip.LI_NR = this.selectedLineVariant.LI_NR;
            this.currentTrip.STR_LI_VAR = this.selectedLineVariant.STR_LI_VAR;
        }
    }

    // Extended time picker (supports hours > 23 for VDV night service)
    get tripHours(): number {
        if (!this.currentTrip.FRT_START) return 0;
        return Math.floor(this.currentTrip.FRT_START / 3600);
    }
    set tripHours(value: number) {
        const minutes = this.tripMinutes;
        this.currentTrip.FRT_START = (value * 3600) + (minutes * 60);
    }

    get tripMinutes(): number {
        if (!this.currentTrip.FRT_START) return 0;
        return Math.floor((this.currentTrip.FRT_START % 3600) / 60);
    }
    set tripMinutes(value: number) {
        const hours = this.tripHours;
        this.currentTrip.FRT_START = (hours * 3600) + (value * 60);
    }

    loadTrips(): void {
        if (this.item.UM_UID) {
            this.recFrtService.getByUmlauf(this.item.UM_UID, this.item.TAGESART_NR).subscribe(trips => {
                this.trips = trips.sort((a, b) => (a.FRT_START || 0) - (b.FRT_START || 0));
            });
        }
    }

    toggleTripForm(): void {
        this.isTripEdit = false;
        this.currentTrip = new RecFrt();
        this.currentTrip.BASIS_VERSION = this.item.BASIS_VERSION;
        this.currentTrip.UM_UID = this.item.UM_UID;
        this.currentTrip.TAGESART_NR = this.item.TAGESART_NR;
        this.currentTrip.BEREICH_NR = 1; // Default
        this.currentTrip.FAHRTART_NR = 1; // Default

        // Reset selections
        this.selectedLineNr = undefined;
        this.selectedLineVariant = undefined;

        this.showTripForm = true;
    }

    editTrip(trip: RecFrt): void {
        this.isTripEdit = true;
        this.currentTrip = { ...trip }; // Clone

        // Set selections for dropdowns
        this.selectedLineNr = this.currentTrip.LI_NR;
        // Wait for variants to load? They are loaded in OnInit.
        // We need to set selectedLineVariant to match.
        if (this.selectedLineNr && this.currentTrip.STR_LI_VAR) {
            this.selectedLineVariant = this.lineVariants.find(v => v.LI_NR === this.selectedLineNr && v.STR_LI_VAR === this.currentTrip.STR_LI_VAR);
        }

        this.showTripForm = true;
    }

    cancelTripEdit(): void {
        this.showTripForm = false;
    }

    saveTrip(): void {
        if (this.isTripEdit) {
            // Update
            this.recFrtService.update(this.currentTrip).subscribe(() => {
                this.loadTrips();
                this.showTripForm = false;
            });
        } else {
            // Create
            this.recFrtService.getNextFrtFid(this.item.BASIS_VERSION).subscribe(res => {
                this.currentTrip.FRT_FID = res.nextFrtFid;
                this.recFrtService.create(this.currentTrip).subscribe(() => {
                    this.loadTrips();
                    this.showTripForm = false;
                });
            });
        }
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

    // --- ORPHAN TRIPS HANDLING ---
    showOrphanDialog = false;
    allOrphanTrips: RecFrt[] = [];
    showOnlyConnections = true;
    filterText = ''; // New filter text

    get displayedOrphanTrips(): RecFrt[] {
        let list = this.allOrphanTrips;

        // 0. Text Filter
        if (this.filterText && this.filterText.trim().length > 0) {
            const term = this.filterText.toLowerCase().trim();
            list = list.filter(t => {
                const line = (t.LIN_NAME || '').toLowerCase();
                const start = (t.START_STOP_NAME || '').toLowerCase();
                const dest = (t.DEST_STOP_NAME || '').toLowerCase();
                const displayDest = (t.DISPLAY_DEST_STOP_NAME || '').toLowerCase();
                const variant = (t.LI_NR + '-' + t.STR_LI_VAR).toLowerCase();

                return line.includes(term) || start.includes(term) || dest.includes(term) || displayDest.includes(term) || variant.includes(term);
            });
        }

        // 1. Filter valid time (must be after last trip start)
        // Ideally after End Time, but we use Start as proxy if End unknown
        if (this.trips.length > 0) {
            const lastTrip = this.trips[this.trips.length - 1];
            if (lastTrip.FRT_START) {
                list = list.filter(o => (o.FRT_START || 0) > (lastTrip.FRT_START || 0));
            }
        }

        // 2. Filter connections if enabled
        if (this.showOnlyConnections && this.trips.length > 0) {
            const lastTrip = this.trips[this.trips.length - 1];
            const lastDestNr = lastTrip.DEST_ORT_NR;
            const lastDestRefNr = lastTrip.DEST_REF_ORT_NR;

            // Match Logic:
            // - Exact: Last Dest == Orphan Start
            // - Parent: Last Dest Ref == Orphan Start Ref (or combinations)

            // STRICT MODE: Filter by Bereich (Area) to prevent mixing Tram (1) and Bus (2)
            // A vehicle typically stays in its domain.
            if (lastTrip.BEREICH_NR) {
                list = list.filter(o => o.BEREICH_NR === lastTrip.BEREICH_NR);
            }

            // Resolve effective parent for last trip (uses RefOrt if available, else OrtNr)
            const lastEffectiveParent = lastDestRefNr || lastDestNr;

            if (lastEffectiveParent) {
                list = list.filter(o => {
                    const startEffectiveParent = o.START_REF_ORT_NR || o.START_ORT_NR;
                    // Loose matching: If any ID matches
                    const matchExact = lastDestNr && o.START_ORT_NR && lastDestNr === o.START_ORT_NR;
                    const matchParent = startEffectiveParent === lastEffectiveParent;

                    return matchExact || matchParent;
                });
            }
        }

        // Sort by time
        return list.sort((a, b) => (a.FRT_START || 0) - (b.FRT_START || 0));
    }

    openOrphanDialog(): void {
        this.showOrphanDialog = true;
        this.loadOrphans();
    }

    loadOrphans(): void {
        this.service.getOrphanTrips(this.item.BASIS_VERSION, this.item.TAGESART_NR).subscribe(res => {
            this.allOrphanTrips = res;
        });
    }

    assignOrphan(trip: RecFrt): void {
        const update = { ...trip, UM_UID: this.item.UM_UID };
        this.recFrtService.update(update).subscribe(() => {
            this.loadTrips();
            this.loadOrphans(); // Refresh list
        });
    }
}

