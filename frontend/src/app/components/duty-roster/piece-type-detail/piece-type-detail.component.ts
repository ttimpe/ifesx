import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DutyRosterService, MengeDienststueckart } from '../../../services/duty-roster.service';
import { CalendarService } from '../../../services/calendar.service';

@Component({
    selector: 'app-piece-type-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule, RouterModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
            <div class="flex items-center gap-4">
                <a routerLink="/planning/piece-types">
                    <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary"></p-button>
                </a>
                <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
                    {{ isNew ? 'Neue Dienststückart' : 'Dienststückart: ' + type.DIENSTSTUECKART }}
                </h1>
            </div>
            <div class="flex gap-2">
                <p-button label="Speichern" icon="pi pi-save" severity="success" (onClick)="save()"></p-button>
                <p-button *ngIf="!isNew" label="Löschen" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="delete()"></p-button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
            <div class="max-w-3xl mx-auto">
                <p-card styleClass="shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                    <div class="flex flex-col gap-6">
                        
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700">Art (Code) *</label>
                            <input pInputText [(ngModel)]="type.DIENSTSTUECKART" [disabled]="!isNew" placeholder="z.B. FAHRT" class="w-full" />
                            <small class="text-slate-400">Eindeutige Kennung (max 10 Zeichen)</small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-slate-700">Bezeichnung</label>
                            <input pInputText [(ngModel)]="type.DIENSTSTUECKART_TEXT" placeholder="Beschreibung..." class="w-full" />
                        </div>

                    </div>
                </p-card>
            </div>
        </div>
    </div>
  `
})
export class PieceTypeDetailComponent implements OnInit {
    type: MengeDienststueckart = { BASIS_VERSION: 1, DIENSTSTUECKART: '', DIENSTSTUECKART_TEXT: '' };
    isNew = true;
    basisVersion = 1;

    constructor(
        private service: DutyRosterService,
        private calendarService: CalendarService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.calendarService.selectedVersion$.subscribe(v => {
            if (v) {
                this.basisVersion = v;
                this.type.BASIS_VERSION = v;
            }
        });

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id && id !== 'new') {
                this.isNew = false;
                this.loadType(id);
            }
        });
    }

    loadType(id: string) {
        this.service.getAllPieceTypes().subscribe(types => {
            const found = types.find(t => t.DIENSTSTUECKART === id && t.BASIS_VERSION === this.basisVersion);
            if (found) {
                this.type = { ...found };
            }
        });
    }

    save() {
        if (!this.type.DIENSTSTUECKART) return;

        if (this.isNew) {
            this.service.createPieceType(this.type).subscribe(() => {
                this.router.navigate(['/planning/piece-types']);
            });
        } else {
            this.service.updatePieceType(this.basisVersion, this.type.DIENSTSTUECKART, this.type).subscribe(() => {
                this.router.navigate(['/planning/piece-types']);
            });
        }
    }

    delete() {
        if (confirm('Wirklich löschen?')) {
            this.service.deletePieceType(this.basisVersion, this.type.DIENSTSTUECKART).subscribe(() => {
                this.router.navigate(['/planning/piece-types']);
            });
        }
    }
}
