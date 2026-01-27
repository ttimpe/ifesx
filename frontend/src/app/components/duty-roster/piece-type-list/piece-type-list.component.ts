import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DutyRosterService, MengeDienststueckart } from '../../../services/duty-roster.service';

@Component({
    selector: 'app-piece-type-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, RouterModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
            <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Dienststückarten</h1>
            <a routerLink="new">
                <p-button label="Erstellen" icon="pi pi-plus" size="small"></p-button>
            </a>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            <div class="max-w-7xl mx-auto">
                <p-table [value]="types" styleClass="p-datatable-sm shadow-sm border border-slate-200 rounded-xl overflow-hidden" [rowHover]="true">
                    <ng-template pTemplate="header">
                        <tr class="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <th style="width: 15%">Art (Code)</th>
                            <th>Bezeichnung</th>
                            <th style="width: 10%">Aktionen</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-type>
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="font-mono font-medium text-blue-600">{{ type.DIENSTSTUECKART }}</td>
                            <td>{{ type.DIENSTSTUECKART_TEXT || '-' }}</td>
                            <td>
                                <a [routerLink]="[type.DIENSTSTUECKART]">
                                    <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"></p-button>
                                </a>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="3" class="text-center p-8 text-slate-400">Keine Dienststückarten gefunden.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    </div>
  `
})
export class PieceTypeListComponent implements OnInit {
    types: MengeDienststueckart[] = [];

    constructor(private service: DutyRosterService) { }

    ngOnInit() {
        this.service.getAllPieceTypes().subscribe((data: MengeDienststueckart[]) => this.types = data);
    }
}
