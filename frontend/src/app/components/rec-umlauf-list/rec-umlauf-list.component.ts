import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecUmlauf } from '../../models/rec-umlauf.model';
import { RecUmlaufService } from '../../services/rec-umlauf.service';
import { CalendarService } from '../../services/calendar.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-rec-umlauf-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        Button,
        InputText,
        Tooltip
    ],
    templateUrl: './rec-umlauf-list.component.html',
    styleUrls: ['./rec-umlauf-list.component.css']
})
export class RecUmlaufListComponent implements OnInit {
    rows: RecUmlauf[] = [];
    selectedBasisVersion: number | undefined;
    loading: boolean = false;

    constructor(
        private service: RecUmlaufService,
        private calendarService: CalendarService
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedBasisVersion = version || undefined;
            this.loadData();
        });
    }

    loadData(): void {
        this.service.getAll(this.selectedBasisVersion).subscribe(data => {
            this.rows = data.sort((a, b) => a.UM_UID - b.UM_UID);
        });
    }

    getDetailParams(row: RecUmlauf): any {
        return {
            BASIS_VERSION: row.BASIS_VERSION,
            TAGESART_NR: row.TAGESART_NR,
            UM_UID: row.UM_UID
        };
    }

    deleteUmlauf(row: RecUmlauf): void {
        if (confirm('Wirklich löschen?')) {
            this.service.delete(row.UM_UID).subscribe(() => {
                this.loadData();
            });
        }
    }
}
