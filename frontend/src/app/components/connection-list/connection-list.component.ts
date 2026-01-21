import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { ConnectionService } from '../../services/connection.service';
import { Einzelanschluss } from '../../models/connection.model';
import { CalendarService } from '../../services/calendar.service';

import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-connection-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FontAwesomeModule, TableModule, Button, InputText],
    templateUrl: './connection-list.component.html',
    styleUrls: ['./connection-list.component.css']
})
export class ConnectionListComponent implements OnInit {
    connections: Einzelanschluss[] = [];
    selectedBasisVersion: number | undefined;

    faPlus = faPlus;
    faTrash = faTrash;
    faExchangeAlt = faExchangeAlt;

    @ViewChild('dt') dt: Table | undefined;

    constructor(
        private service: ConnectionService,
        private calendarService: CalendarService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedBasisVersion = version || undefined;
            this.loadData();
        });
    }

    loadData(): void {
        this.service.getAll(this.selectedBasisVersion).subscribe(data => {
            this.connections = data;
        });
    }

    applyFilterGlobal($event: any, stringVal: any) {
        this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }

    create(): void {
        this.router.navigate(['/connections/new']);
    }

    edit(item: Einzelanschluss): void {
        this.router.navigate(['/connections', item.EINAN_NR]);
    }
}
