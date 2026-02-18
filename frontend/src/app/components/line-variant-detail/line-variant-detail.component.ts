import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LineService } from '../../services/line.service';

import { LidVerlauf } from '../../models/lid-verlauf.model';
import { RecLid } from '../../models/line.model';
import { StopService } from '../../services/stop.service';
import { RecOrt } from '../../models/rec-ort.model';
import { DestinationService } from '../../services/destination.service';
import { AnnouncementService } from '../../services/announcement.service';
import { RecZnr } from '../../models/destination.model';
import { Announcement } from '../../models/announcement.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-line-variant-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        TableModule, ButtonModule, InputTextModule, InputNumberModule, DropdownModule, CardModule, DialogModule, CheckboxModule
    ],
    templateUrl: './line-variant-detail.component.html',
    styleUrls: ['./line-variant-detail.component.css']
})
export class LineVariantDetailComponent implements OnInit {
    lineId!: number;
    strLiVar!: string;

    line?: RecLid;
    variant?: RecLid;
    stops: LidVerlauf[] = [];

    allStops: RecOrt[] = []; // Filtered list for dropdown
    rawAllStops: RecOrt[] = []; // Complete list from backend
    allDestinations: RecZnr[] = []; // For ZNR dropdown
    allAnnouncements: Announcement[] = []; // For ANR dropdown

    directionOptions = [
        { value: 0, label: '0: Z' },
        { value: 1, label: '1: H' },
        { value: 2, label: '2: R' }
    ];

    isNew = false;
    showAddStopDialog = false;
    showAllStops = false; // Toggle state
    newStopData: any = { ORT_NR: null };
    isSubmittingStop = false; // Guard flag to prevent double submission

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lineService: LineService,
        private stopService: StopService,
        private destinationService: DestinationService,
        private announcementService: AnnouncementService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(async params => {
            this.lineId = +params['lineId'];
            this.strLiVar = params['variantId']; // e.g., 'STD'

            // Fetch Line context
            this.lineService.getLineById(this.lineId).subscribe(l => this.line = l);

            // Load all stops
            this.stopService.getAllRecOrts().subscribe(s => {
                console.log('Total stops loaded:', s.length);
                this.rawAllStops = s;
                this.updateStopFilter();
            });

            // Load destinations and announcements for dropdowns
            this.destinationService.getAllDestinations().subscribe(d => this.allDestinations = d);
            this.announcementService.getAllAnnouncements().subscribe(a => this.allAnnouncements = a);

            if (this.strLiVar === 'new') {
                this.isNew = true;
                this.variant = new RecLid();
                this.variant.LI_NR = this.lineId;
                this.variant.STR_LI_VAR = '';
                this.variant.BASIS_VERSION = 1;
                // Defaults
                this.variant.STR_LID = this.line?.STR_LID || '';
                this.variant.LIN_NAME = this.line?.LIN_NAME || '';
            } else {
                this.isNew = false;
                this.loadVariant();
            }
        });
    }

    updateStopFilter() {
        if (this.showAllStops) {
            // Show everything
            this.allStops = this.rawAllStops;
        } else {
            // Show only sub-orte (platforms) as before, but handle empty case
            const subOrte = this.rawAllStops.filter(ort => ort.ORT_REF_ORT && ort.ORT_REF_ORT > 0);
            if (subOrte.length === 0) {
                // If no sub-stops exist at all, falling back to all stops might still be useful, 
                // but typically we want to respect the filter. 
                // Matches original fallback logic just in case data is weird.
                this.allStops = this.rawAllStops;
            } else {
                this.allStops = subOrte;
            }
        }
    }

    loadVariant() {
        this.lineService.getLineVariants(this.lineId).subscribe(variants => {
            const match = variants.find(v => v.STR_LI_VAR === this.strLiVar);
            if (match) {
                this.variant = match;
                this.loadStops();
            }
        }); // Optimization: Could add getVariantById endpoint but this works
    }

    loadStops() {
        if (!this.variant) return;
        console.log('[loadStops] Loading stops for LI_NR:', this.lineId, 'STR_LI_VAR:', this.variant.STR_LI_VAR);
        this.lineService.getVariantStops(this.lineId, this.variant.STR_LI_VAR).subscribe(stops => {
            console.log('[loadStops] Received', stops.length, 'stops:', stops);
            this.stops = stops;
        });
    }

    saveHeader() {
        if (!this.variant) return;

        if (this.isNew) {
            this.lineService.createVariant(this.variant).subscribe(v => {
                this.isNew = false;
                this.strLiVar = v.STR_LI_VAR;
                // Navigate to real ID so reload works
                this.router.navigate(['/lines', this.lineId, 'variants', v.STR_LI_VAR], { replaceUrl: true });
            });
        } else {
            // Check for rename
            const oldId = this.strLiVar;
            const newId = this.variant.STR_LI_VAR;
            const renamed = oldId !== newId;

            this.lineService.updateVariant(this.variant, renamed ? oldId : undefined).subscribe((res: any) => {
                if (renamed && res.newStrLiVar) {
                    // Update local ID and URL
                    this.strLiVar = res.newStrLiVar;
                    this.router.navigate(['/lines', this.lineId, 'variants', this.strLiVar], { replaceUrl: true });
                }
            });
        }
    }

    deleteVariant() {
        if (confirm('Variante wirklich löschen?')) {
            this.lineService.deleteVariant(this.lineId, this.strLiVar).subscribe(() => {
                this.router.navigate(['/lines', this.lineId]);
            });
        }
    }

    // Stop Management
    openAddStop() {
        if (!this.variant?.STR_LI_VAR) {
            alert('Bitte speichere zuerst die Variante, bevor du Haltestellen hinzufügst.');
            return;
        }
        this.showAddStopDialog = true;
        this.newStopData = { ORT_NR: null };
    }

    addStop() {
        console.log('[addStop] Called - isSubmittingStop:', this.isSubmittingStop, 'ORT_NR:', this.newStopData.ORT_NR);

        if (!this.variant || !this.newStopData.ORT_NR || this.isSubmittingStop) {
            console.log('[addStop] Exiting early - guard check failed');
            return;
        }

        this.isSubmittingStop = true;
        console.log('[addStop] Guard flag set, proceeding with API call');

        // Find the full stop object to get the correct ONR_TYP_NR
        // Use rawAllStops to be sure we find it even if filter state is weird
        const selectedStop = this.rawAllStops.find(s => s.ORT_NR === this.newStopData.ORT_NR);
        const onrTypNr = selectedStop?.ONR_TYP_NR || 1; // Fallback to 1 if not found

        const payload = {
            LI_NR: this.lineId,
            STR_LI_VAR: this.variant.STR_LI_VAR,
            ORT_NR: this.newStopData.ORT_NR,
            ONR_TYP_NR: onrTypNr,
            HALTEPUNKT_NR: 0 // Optional
        };

        console.log('[addStop] Payload:', payload);

        this.lineService.addVariantStop(payload).subscribe({
            next: () => {
                console.log('[addStop] Success - reloading stops');
                this.showAddStopDialog = false;
                this.loadStops();
                this.newStopData = { ORT_NR: null };
                this.isSubmittingStop = false;
                console.log('[addStop] Guard flag reset');
            },
            error: (err: any) => {
                console.error('[addStop] Error:', err);
                this.isSubmittingStop = false;
            }
        });
    }

    removeStop(stop: LidVerlauf) {
        console.log('[removeStop] Called with stop:', stop);
        console.log('[removeStop] Will delete - LI_NR:', this.lineId, 'STR_LI_VAR:', this.strLiVar, 'LI_LFD_NR:', stop.LI_LFD_NR);

        if (confirm('Halt entfernen?')) {
            console.log('[removeStop] User confirmed, calling API');
            this.lineService.removeVariantStop(this.lineId, this.strLiVar, stop.LI_LFD_NR).subscribe({
                next: () => {
                    console.log('[removeStop] Delete successful, reloading stops');
                    this.loadStops();
                },
                error: (err: any) => {
                    console.error('[removeStop] Error:', err);
                }
            });
        } else {
            console.log('[removeStop] User cancelled');
        }
    }

    updateStop(stop: LidVerlauf) {
        // Update the stop in the backend when user changes dropdown/checkbox
        this.lineService.updateVariantStop(this.lineId, this.strLiVar, stop.LI_LFD_NR, stop).subscribe({
            next: () => {
                console.log('Stop updated successfully');
            },
            error: (err: any) => console.error('Error updating stop:', err)
        });
    }

    moveStop(stop: LidVerlauf, direction: 'up' | 'down') {
        if (!this.stops || this.stops.length < 2) return;

        const currentIndex = this.stops.indexOf(stop);
        if (currentIndex === -1) return;

        let targetIndex = -1;
        if (direction === 'up') {
            if (currentIndex === 0) return; // Already top
            targetIndex = currentIndex - 1;
        } else {
            if (currentIndex === this.stops.length - 1) return; // Already bottom
            targetIndex = currentIndex + 1;
        }

        const targetStop = this.stops[targetIndex];

        // Perform Swap via Backend
        const lfd1 = stop.LI_LFD_NR;
        const lfd2 = targetStop.LI_LFD_NR;

        this.lineService.swapVariantStops(this.lineId, this.strLiVar, lfd1, lfd2).subscribe({
            next: () => {
                this.loadStops(); // Reload to see change
            },
            error: (err) => {
                console.error('Swap failed', err);
                alert('Swap failed: ' + err.message);
            }
        });
    }

    getDestinationName(znrNr: number): string {
        const dest = this.allDestinations.find(d => d.ZNR_NR === znrNr);
        if (!dest) return '';
        return dest.FAHRERKURZTEXT || dest.ZNR_TEXT?.split('\n')[0] || '';
    }
}
