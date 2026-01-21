import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MengeFgrService } from '../../services/menge-fgr.service';
import { MengeFgr } from '../../models/menge-fgr.model';

@Component({
    selector: 'app-rec-fgr-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TooltipModule
    ],
    templateUrl: './rec-fgr-list.component.html'
})
export class RecFgrListComponent implements OnInit {
    rows: MengeFgr[] = [];
    loadingIndicator = false;

    constructor(private service: MengeFgrService) { }

    ngOnInit(): void {
        this.load();
    }

    load() {
        this.loadingIndicator = true;
        this.service.getAll().subscribe({
            next: (data) => {
                this.rows = data;
                this.loadingIndicator = false;
            },
            error: (err) => {
                console.error(err);
                this.loadingIndicator = false;
            }
        });
    }

    applyFilterGlobal($event: any, stringVal: string) {
        // Basic filtering would be handled by p-table [globalFilterFields]
    }
}
