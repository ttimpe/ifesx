import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecOm } from '../../models/rec-om.model';
import { RecOmService } from '../../services/rec-om.service';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { CalendarService } from '../../services/calendar.service';

@Component({
    selector: 'app-rec-om-list',
    templateUrl: './rec-om-list.component.html',
    styleUrls: ['./rec-om-list.component.css'],
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
export class RecOmListComponent implements OnInit {
    rows: RecOm[] = [];
    selectedVersion: number | null = null;
    loading: boolean = false;

    constructor(
        private omService: RecOmService,
        private calendarService: CalendarService
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedVersion = version;
            this.loadData();
        });
    }

    loadData() {
        this.loading = true;
        const version = this.selectedVersion || undefined;
        this.omService.getAll(version).subscribe({
            next: (data) => {
                this.rows = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading RecOm:', err);
                this.loading = false;
            }
        });
    }

    deleteRecOm(om: RecOm) {
        // TODO: Implement delete logic
        console.log('Delete logic to be implemented', om);
    }
}
