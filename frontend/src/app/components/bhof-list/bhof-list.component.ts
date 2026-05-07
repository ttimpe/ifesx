import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MengeBhof } from '../../models/menge-bhof.model';
import { BhofService } from '../../services/bhof.service';
import { CalendarService } from '../../services/calendar.service';

import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-bhof-list',
    standalone: true,
    imports: [
        FontAwesomeModule,
        CommonModule,
        RouterModule,
        TableModule,
        Button,
        InputText,
        ConfirmDialogModule,
        ToastModule
    
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './bhof-list.component.html',
    styleUrls: ['./bhof-list.component.css']
})
export class BhofListComponent implements OnInit {
    faBuilding = faBuilding;
    rows: MengeBhof[] = [];
    basisVersion: number = 1;

    @ViewChild('dt') dt: Table | undefined;

    constructor(
        private service: BhofService,
        private calendarService: CalendarService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        const currentVersion = this.calendarService.getCurrentVersion();
        if (currentVersion) {
            this.basisVersion = currentVersion;
        }
        this.loadData();
    }

    loadData(): void {
        this.service.getAll(this.basisVersion).subscribe(data => {
            // Sort by BHOF_NR (Int-Index)
            this.rows = data.sort((a, b) => a.BHOF_NR - b.BHOF_NR);
        });
    }

    delete(item: MengeBhof): void {
        this.confirmationService.confirm({
            message: `Betriebshof "${item.BHOF_TEXT}" wirklich löschen?`,
            header: 'Bestätigung',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.service.delete(item.BHOF_NR, this.basisVersion).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Betriebshof gelöscht' });
                        this.loadData();
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Löschen fehlgeschlagen' });
                    }
                });
            }
        });
    }

    applyFilterGlobal($event: any, stringVal: any) {
        this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }
}
