import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DutyRosterService, RecEinzeldienst } from '../../../services/duty-roster.service';

@Component({
    selector: 'app-duty-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, RouterModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Dienste (RecEinzeldienst)</h1>
            <a routerLink="new">
                <p-button label="Erstellen" icon="pi pi-plus" size="small"></p-button>
            </a>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            <div class="max-w-7xl mx-auto">
                <p-table [value]="duties" styleClass="p-datatable-sm shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden" [rowHover]="true"
                    [paginator]="true" [rows]="50" [rowsPerPageOptions]="[50,100,200]">
                    <ng-template pTemplate="header">
                        <tr class="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">
                            <th>Dienst Nr</th>
                            <th>Art</th>
                            <th>Start</th>
                            <th>Ende</th>
                            <th>Dauer</th>
                            <th>Start Ort</th>
                            <th>End Ort</th>
                            <th style="width: 10%">Aktionen</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-d>
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td class="font-mono">{{ d.ED_NR }}</td>
                            <td>{{ d.DIENSTART_NR }}</td>
                             <!-- Assuming naming RecEinzeldienst fields same as provided definitions -->
                            <td>{{ formatTime(d.ED_ANF_ZEIT) }}</td>
                            <td>{{ formatTime(d.ED_END_ZEIT) }}</td>
                            <td>{{ formatDuration(d.ED_DAUER) }}</td>
                            <td>{{ d.ANF_ORT }}</td>
                            <td>{{ d.END_ORT }}</td>
                            <td>
                                 <!-- Complex PK, using query params for edit -->
                                 <a [routerLink]="['edit']" [queryParams]="{
                                    basis: d.BASIS_VERSION, 
                                    ebd: d.EDB_VERSION, 
                                    tagesart: d.TAGESART_AUSWAHL, 
                                    ed: d.ED_NR
                                }">
                                    <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"></p-button>
                                </a>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="8" class="text-center p-8 text-slate-400 dark:text-slate-500">Keine Dienste gefunden.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    </div>
  `
})
export class DutyListComponent implements OnInit {
    duties: RecEinzeldienst[] = [];

    constructor(private service: DutyRosterService) { }

    ngOnInit() {
        this.service.getAllDuties().subscribe((data: RecEinzeldienst[]) => this.duties = data);
    }

    formatTime(seconds: number | undefined): string {
        if (seconds === undefined || seconds === null) return '-';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    formatDuration(seconds: number | undefined): string {
        if (!seconds) return '-';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
}
