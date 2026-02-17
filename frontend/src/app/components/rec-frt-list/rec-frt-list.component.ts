import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecFrt } from '../../models/rec-frt.model';
import { RecFrtService } from '../../services/rec-frt.service';
import { CalendarService } from '../../services/calendar.service';
import { ConfirmationService } from 'primeng/api';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-rec-frt-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        Button,
        InputText,
        Tooltip,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: './rec-frt-list.component.html',
    styleUrls: ['./rec-frt-list.component.css']
})
export class RecFrtListComponent implements OnInit {
    trips: RecFrt[] = [];
    selectedBasisVersion: number | undefined;
    loading: boolean = false;
    globalFilter: string = '';

    constructor(
        private service: RecFrtService,
        private calendarService: CalendarService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedBasisVersion = version || undefined;
            this.loadData();
        });
    }

    loadData(): void {
        this.loading = true;
        this.service.getAll().subscribe({
            next: (data) => {
                // Filter by basis version if selected
                if (this.selectedBasisVersion) {
                    this.trips = data.filter(t => t.BASIS_VERSION === this.selectedBasisVersion);
                } else {
                    this.trips = data;
                }
                // Sort by start time
                this.trips.sort((a, b) => (a.FRT_START || 0) - (b.FRT_START || 0));
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    formatTime(seconds?: number): string {
        if (seconds === undefined || seconds === null) return '-';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    getFahrtartName(nr?: number): string {
        const map: { [key: number]: string } = {
            1: 'Regelfahrt',
            2: 'Ausrückfahrt',
            3: 'Einrückfahrt',
            4: 'Werkstattfahrt',
            5: 'Betriebsfahrt'
        };
        return nr ? (map[nr] || `#${nr}`) : '-';
    }

    deleteTrip(trip: RecFrt): void {
        this.confirmationService.confirm({
            message: `Fahrt ${trip.FRT_FID} wirklich löschen?`,
            header: 'Löschen bestätigen',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Löschen',
            rejectLabel: 'Abbrechen',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.service.delete(trip.BASIS_VERSION, trip.FRT_FID).subscribe(() => {
                    this.loadData();
                });
            }
        });
    }

    getDetailLink(trip: RecFrt): any[] {
        return ['/rec-frt', trip.BASIS_VERSION, trip.FRT_FID];
    }
}
