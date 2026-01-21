import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecSel } from '../../models/rec-sel.model';
import { RecSelService } from '../../services/rec-sel.service';
import { CalendarService } from '../../services/calendar.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-rec-sel-list',
    templateUrl: './rec-sel-list.component.html',
    styleUrls: ['./rec-sel-list.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TableModule,
        Button,
        InputText,
        Tooltip
    ]
})
export class RecSelListComponent implements OnInit {
    rows: RecSel[] = [];
    selectedBasisVersion: number | undefined;
    loading: boolean = false;

    constructor(
        private selService: RecSelService,
        private calendarService: CalendarService
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedBasisVersion = version || undefined;
            this.loadData();
        });
    }

    loadData() {
        this.loading = true;
        this.selService.getAll(this.selectedBasisVersion).subscribe({
            next: (data) => {
                this.rows = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    deleteRelation(row: RecSel) {
        // Implement delete logic if needed
    }
}
