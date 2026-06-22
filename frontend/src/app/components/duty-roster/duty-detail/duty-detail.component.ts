import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DutyRosterService, RecEinzeldienst, MengeDienstart } from '../../../services/duty-roster.service';
import { CalendarService } from '../../../services/calendar.service';
import { StopService } from '../../../services/stop.service';
import { RecTagesartService } from '../../../services/rec-tagesart.service';
import { RecTagesart } from '../../../models/rec-tagesart.model';

@Component({
    selector: 'app-duty-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule, CardModule, RouterModule, DropdownModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex items-center gap-4">
                <a routerLink="/planning/duties">
                    <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary"></p-button>
                </a>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {{ isNew ? 'Neuer Dienst' : 'Dienst Bearbeiten' }}
                </h1>
            </div>
            <div class="flex gap-2">
                <p-button label="Speichern" icon="pi pi-save" severity="success" (onClick)="save()"></p-button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            <div class="max-w-5xl mx-auto">
                <p-card styleClass="shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <!-- Primary Keys -->
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">EBD Version</label>
                            <input pInputText [(ngModel)]="duty.EDB_VERSION" [disabled]="!isNew" class="w-full" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Tagesart</label>
                            <p-dropdown [options]="tagesarts" [(ngModel)]="duty.TAGESART_AUSWAHL" optionLabel="TAGESART_TEXT" optionValue="TAGESART_NR" placeholder="Wähle Tagesart" styleClass="w-full"></p-dropdown>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Dienst Nr (ED_NR)</label>
                            <p-inputNumber [(ngModel)]="duty.ED_NR" [disabled]="!isNew" class="w-full" styleClass="w-full"></p-inputNumber>
                        </div>

                        <!-- Main Attributes -->
                        <div class="border-t border-slate-100 dark:border-slate-700 col-span-full my-2"></div>

                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Start Ort</label>
                            <p-dropdown [options]="stops" [(ngModel)]="duty.ANF_ORT" optionLabel="ORT_NAME" optionValue="ORT_NR" [filter]="true" filterBy="ORT_NAME,ORT_NR" placeholder="Wähle Start Ort" styleClass="w-full" [virtualScroll]="true" [virtualScrollItemSize]="38"></p-dropdown>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Startzeit</label>
                            <input pInputText [ngModel]="formatTime(duty.ED_ANF_ZEIT)" (blur)="parseTime($event, 'ED_ANF_ZEIT')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                         <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Dauer</label>
                             <input pInputText [ngModel]="formatDuration(duty.ED_DAUER)" (blur)="parseTime($event, 'ED_DAUER')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">End Ort</label>
                            <p-dropdown [options]="stops" [(ngModel)]="duty.END_ORT" optionLabel="ORT_NAME" optionValue="ORT_NR" [filter]="true" filterBy="ORT_NAME,ORT_NR" placeholder="Wähle End Ort" styleClass="w-full" [virtualScroll]="true" [virtualScrollItemSize]="38"></p-dropdown>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Endzeit</label>
                            <input pInputText [ngModel]="formatTime(duty.ED_END_ZEIT)" (blur)="parseTime($event, 'ED_END_ZEIT')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                        <div class="flex flex-col gap-2">
                             <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Dienstart</label>
                            <p-dropdown [options]="dienstarts" [(ngModel)]="duty.DIENSTART_NR" optionLabel="DIENSTART_TEXT" optionValue="DIENSTART_NR" placeholder="Wähle Dienstart" styleClass="w-full"></p-dropdown>
                        </div>

                        <!-- Statistics / Times -->
                         <div class="border-t border-slate-100 dark:border-slate-700 col-span-full my-2">
                            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Zeiten & Statistik</span>
                         </div>
                        
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Lenkzeit</label>
                            <input pInputText [ngModel]="formatDuration(duty.ED_LENK)" (blur)="parseTime($event, 'ED_LENK')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                         <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Pause</label>
                             <input pInputText [ngModel]="formatDuration(duty.ED_PAUSE)" (blur)="parseTime($event, 'ED_PAUSE')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Vorbereitungszeit</label>
                             <input pInputText [ngModel]="formatDuration(duty.ED_VORB)" (blur)="parseTime($event, 'ED_VORB')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Nachbereitungszeit</label>
                             <input pInputText [ngModel]="formatDuration(duty.ED_NACHB)" (blur)="parseTime($event, 'ED_NACHB')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                        
                    </div>
                </p-card>
            </div>
        </div>
    </div>
  `
})
export class DutyDetailComponent implements OnInit {
    duty: RecEinzeldienst = {
        BASIS_VERSION: 1,
        EDB_VERSION: '',
        TAGESART_AUSWAHL: 0,
        ED_NR: 0
    };
    isNew = true;

    stops: any[] = [];
    tagesarts: RecTagesart[] = [];
    dienstarts: MengeDienstart[] = [];

    constructor(
        private service: DutyRosterService,
        private calendarService: CalendarService,
        private stopService: StopService,
        private tagesartService: RecTagesartService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.calendarService.selectedVersion$.subscribe(v => {
            if (v) {
                if (this.isNew) this.duty.BASIS_VERSION = v;
                this.loadOptions(v);
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['basis']) {
                this.isNew = false;
                this.duty.BASIS_VERSION = +params['basis'];
                this.duty.EDB_VERSION = params['ebd'];
                this.duty.TAGESART_AUSWAHL = +params['tagesart'];
                this.duty.ED_NR = +params['ed'];
                // Similarly assuming create-only or blind edit for now
            }
        });
    }

    loadOptions(version: number) {
        this.stopService.getAllRecOrts('', version).subscribe(data => this.stops = data);
        this.tagesartService.getAll(version).subscribe(data => this.tagesarts = data);
        this.service.getAllDienstarts().subscribe(data => this.dienstarts = data);
    }

    formatTime(seconds: number | undefined): string {
        if (seconds === undefined || seconds === null) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    formatDuration(seconds: number | undefined): string {
        if (seconds === undefined || seconds === null) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    parseTime(event: any, field: keyof RecEinzeldienst) {
        const val = event.target.value;
        if (!val) return;
        const parts = val.split(':');
        if (parts.length >= 2) {
            const h = parseInt(parts[0], 10) || 0;
            const m = parseInt(parts[1], 10) || 0;
            const s = parseInt(parts[2] || '0', 10) || 0;
            (this.duty as any)[field] = (h * 3600) + (m * 60) + s;
        }
    }

    save() {
        if (this.isNew) {
            this.service.createDuty(this.duty).subscribe(() => {
                this.router.navigate(['/planning/duties']);
            });
        } else {
            alert("Editing not fully implemented in this iteration.");
        }
    }
}
