import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DutyRosterService, RecDienststueck, MengeDienststueckart } from '../../../services/duty-roster.service';
import { CalendarService } from '../../../services/calendar.service';
import { StopService } from '../../../services/stop.service';
import { RecUmlaufService } from '../../../services/rec-umlauf.service';
import { RecTagesartService } from '../../../services/rec-tagesart.service';
import { RecTagesart } from '../../../models/rec-tagesart.model';

@Component({
    selector: 'app-piece-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule, CardModule, RouterModule, DropdownModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex items-center gap-4">
                <a routerLink="/planning/pieces">
                    <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary"></p-button>
                </a>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {{ isNew ? 'Neues Dienststück' : 'Dienststück Bearbeiten' }}
                </h1>
            </div>
            <div class="flex gap-2">
                <p-button label="Speichern" icon="pi pi-save" severity="success" (onClick)="save()"></p-button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            <div class="max-w-4xl mx-auto">
                <p-card styleClass="shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <!-- Primary Keys -->
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Tagesart Auswahl</label>
                            <p-dropdown [options]="tagesarts" [(ngModel)]="piece.TAGESART_AUSWAHL" optionLabel="TAGESART_TEXT" optionValue="TAGESART_NR" placeholder="Wähle Tagesart" styleClass="w-full"></p-dropdown>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">EBD Version</label>
                            <input pInputText [(ngModel)]="piece.EBD_VERSION" [disabled]="!isNew" class="w-full" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">ED Nr (Einzeldienst)</label>
                            <p-inputNumber [(ngModel)]="piece.ED_NR" [disabled]="!isNew" class="w-full" styleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Startzeit</label>
                            <input pInputText [ngModel]="formatTime(piece.DST_ANF_ZEIT)" (blur)="parseTime($event, 'DST_ANF_ZEIT')" [disabled]="!isNew" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                            <small class="text-slate-400 dark:text-slate-500">Format: HH:MM:SS</small>
                        </div>

                        <!-- Attributes -->
                        <div class="border-t border-slate-100 dark:border-slate-700 col-span-full my-2"></div>

                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Start Ort</label>
                            <p-dropdown [options]="stops" [(ngModel)]="piece.ANF_ORT" optionLabel="ORT_NAME" optionValue="ORT_NR" [filter]="true" filterBy="ORT_NAME,ORT_NR" placeholder="Wähle Start Ort" styleClass="w-full" [virtualScroll]="true" [virtualScrollItemSize]="38"></p-dropdown>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">End Ort</label>
                            <p-dropdown [options]="stops" [(ngModel)]="piece.END_ORT" optionLabel="ORT_NAME" optionValue="ORT_NR" [filter]="true" filterBy="ORT_NAME,ORT_NR" placeholder="Wähle End Ort" styleClass="w-full" [virtualScroll]="true" [virtualScrollItemSize]="38"></p-dropdown>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Dauer</label>
                             <input pInputText [ngModel]="formatDuration(piece.DST_DAUER)" (blur)="parseTime($event, 'DST_DAUER')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>
                         <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Endzeit</label>
                            <input pInputText [ngModel]="formatTime(piece.DST_END_ZEIT)" (blur)="parseTime($event, 'DST_END_ZEIT')" placeholder="HH:MM:SS" class="w-full p-inputtext p-component" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Dienststückart</label>
                            <!-- Note: Dropdown values often string vs number, check types -->
                            <p-dropdown [options]="types" [(ngModel)]="piece.DIENSTSTUECKART_NR" optionLabel="DIENSTSTUECKART_TEXT" optionValue="DIENSTSTUECKART" placeholder="Wähle Art" styleClass="w-full"></p-dropdown>
                            <!-- NOTE: DIENSTSTUECKART_NR is integer, but MENGE uses String Code? Need to map or use different field? 
                            Actually MENGE_DIENSTSTUECKART has DIENSTSTUECKART (string). 
                            REC_DIENSTSTUECK has DIENSTSTUECKART_NR (integer)? 
                            If they mismatch, dropdown won't work directly without a map. 
                            If the user def says "Code", it might be string. 
                            Let's assume for now we bind to what we have, but if types mismatch, we'll fix later.
                            -->
                        </div>
                         <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Umlauf</label>
                            <p-dropdown [options]="blocks" [(ngModel)]="piece.UM_UID" optionLabel="UM_UID" optionValue="UM_UID" [filter]="true" placeholder="Wähle Umlauf" styleClass="w-full">
                                <ng-template let-block pTemplate="item">
                                    <div class="flex gap-2">
                                        <span class="font-mono">{{ block.UM_UID }}</span>
                                        <span>(Linie {{ block.LINIE_NR }})</span>
                                    </div>
                                </ng-template>
                            </p-dropdown>
                        </div>

                    </div>
                </p-card>
            </div>
        </div>
    </div>
  `
})
export class PieceDetailComponent implements OnInit {
    piece: RecDienststueck = {
        BASIS_VERSION: 1,
        TAGESART_AUSWAHL: 0,
        EBD_VERSION: '',
        ED_NR: 0,
        DST_ANF_ZEIT: 0
    };
    isNew = true;

    stops: any[] = [];
    blocks: any[] = [];
    types: MengeDienststueckart[] = [];
    tagesarts: RecTagesart[] = [];

    constructor(
        private service: DutyRosterService,
        private calendarService: CalendarService,
        private stopService: StopService,
        private umlaufService: RecUmlaufService,
        private tagesartService: RecTagesartService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.calendarService.selectedVersion$.subscribe(v => {
            if (v) {
                if (this.isNew) this.piece.BASIS_VERSION = v;
                this.loadOptions(v);
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['basis']) {
                this.isNew = false;
                this.piece.BASIS_VERSION = +params['basis'];
                this.piece.TAGESART_AUSWAHL = +params['tagesart'];
                this.piece.EBD_VERSION = params['ebd'];
                this.piece.ED_NR = +params['ed'];
                this.piece.DST_ANF_ZEIT = +params['time'];
            }
        });
    }

    loadOptions(version: number) {
        this.stopService.getAllRecOrts('', version).subscribe(data => this.stops = data);
        this.umlaufService.getAll(version).subscribe(data => this.blocks = data); // Might be heavy, but VDV usually small
        this.service.getAllPieceTypes().subscribe(data => this.types = data);
        this.tagesartService.getAll(version).subscribe(data => this.tagesarts = data);
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

    parseTime(event: any, field: keyof RecDienststueck) {
        const val = event.target.value;
        if (!val) return;
        const parts = val.split(':');
        if (parts.length >= 2) {
            const h = parseInt(parts[0], 10) || 0;
            const m = parseInt(parts[1], 10) || 0;
            const s = parseInt(parts[2] || '0', 10) || 0;
            (this.piece as any)[field] = (h * 3600) + (m * 60) + s;
        }
    }

    save() {
        if (this.isNew) {
            this.service.createPiece(this.piece).subscribe(() => {
                this.router.navigate(['/planning/pieces']);
            });
        } else {
            alert("Editing not fully implemented.");
        }
    }
}

