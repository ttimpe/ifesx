import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTrash, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { RecAnr } from '../../models/rec-anr.model';
import { RecAnrService } from '../../services/rec-anr.service';


import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-rec-anr-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FontAwesomeModule, TableModule, Button, InputText],
    templateUrl: './rec-anr-list.component.html',
    styleUrls: ['./rec-anr-list.component.css']
})
export class RecAnrListComponent implements OnInit {
    rows: RecAnr[] = [];
    faPlus = faPlus;
    faVolumeHigh = faVolumeHigh;

    @ViewChild('dt') dt: Table | undefined;

    constructor(private service: RecAnrService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.service.getAll().subscribe(data => {
            this.rows = data;
        });
    }

    applyFilterGlobal($event: any, stringVal: any) {
        this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }
}
