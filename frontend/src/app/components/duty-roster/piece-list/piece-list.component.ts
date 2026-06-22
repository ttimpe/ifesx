import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DutyRosterService, RecDienststueck } from '../../../services/duty-roster.service';

@Component({
    selector: 'app-piece-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, RouterModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Dienststücke (RecDienststueck)</h1>
            <a routerLink="new">
                <p-button label="Erstellen" icon="pi pi-plus" size="small"></p-button>
            </a>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            <div class="max-w-7xl mx-auto">
                <p-table [value]="pieces" styleClass="p-datatable-sm shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden" [rowHover]="true"
                    [paginator]="true" [rows]="50" [rowsPerPageOptions]="[50,100,200]">
                    <ng-template pTemplate="header">
                        <tr class="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">
                            <th>ED Nr</th>
                            <th>Art</th>
                            <th>Beginn</th>
                            <th>Ende</th>
                            <th>Dauer</th>
                            <th>Start Ort</th>
                            <th>End Ort</th>
                            <th style="width: 10%">Aktionen</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-p>
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td class="font-mono">{{ p.ED_NR }}</td>
                            <td>{{ p.DIENSTSTUECKART_NR }}</td>
                            <td>{{ formatTime(p.DST_ANF_ZEIT) }}</td>
                            <td>{{ formatTime(p.DST_END_ZEIT) }}</td>
                            <td>{{ formatDuration(p.DST_DAUER) }}</td>
                            <td>{{ p.ANF_ORT }}</td>
                            <td>{{ p.END_ORT }}</td>
                            <td>
                                <!-- Complex PK, using query params for edit -->
                                <a [routerLink]="['edit']" [queryParams]="{
                                    basis: p.BASIS_VERSION, 
                                    tagesart: p.TAGESART_AUSWAHL, 
                                    ebd: p.EBD_VERSION, 
                                    ed: p.ED_NR,
                                    time: p.DST_ANF_ZEIT
                                }">
                                    <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"></p-button>
                                </a>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="8" class="text-center p-8 text-slate-400 dark:text-slate-500">Keine Dienststücke gefunden.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    </div>
  `
})
export class PieceListComponent implements OnInit {
    pieces: RecDienststueck[] = [];

    constructor(private service: DutyRosterService) { }

    ngOnInit() {
        this.service.getAllPieces().subscribe((data: RecDienststueck[]) => this.pieces = data);
    }

    formatTime(seconds: number | undefined): string {
        if (seconds === undefined || seconds === null) return '-';
        // Handle VDV time (seconds past midnight, can be > 24h)
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    formatDuration(seconds: number | undefined): string {
        if (!seconds) return '-';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
}
