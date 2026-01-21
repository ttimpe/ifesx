import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RecUeb } from '../../models/rec-ueb.model';
import { RecUebService } from '../../services/rec-ueb.service';

import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-rec-ueb-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FontAwesomeModule, TableModule, Button, InputText],
    templateUrl: './rec-ueb-list.component.html',
    styleUrls: ['./rec-ueb-list.component.css']
})
export class RecUebListComponent implements OnInit {
    rows: RecUeb[] = [];
    faPlus = faPlus;

    @ViewChild('dt') dt: Table | undefined;

    applyFilterGlobal($event: any, stringVal: any) {
        this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }

    constructor(private service: RecUebService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.service.getAll().subscribe(data => {
            this.rows = data;
        });
    }

    onSelect({ selected }: { selected: RecUeb[] }) {
        // Navigate handled in template via link logic or double click if implemented
    }

    getDetailParams(row: RecUeb): any {
        return {
            BASIS_VERSION: row.BASIS_VERSION,
            BEREICH_NR: row.BEREICH_NR,
            ONR_TYP_NR: row.ONR_TYP_NR,
            ORT_NR: row.ORT_NR,
            UEB_ZIEL_TYP: row.UEB_ZIEL_TYP,
            UEB_ZIEL: row.UEB_ZIEL
        };
    }
}
