
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { GtfsService, GTFSAgency, ImportProgress } from '../../services/gtfs.service';

@Component({
    selector: 'app-gtfs-wizard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ButtonModule,
        DropdownModule,
        SelectModule,
        StepsModule,
        CardModule,
        ToastModule,
        ProgressBarModule,
        CheckboxModule
    ],
    providers: [MessageService],
    template: `
    <div class="flex flex-col gap-4 p-4">
        <p-steps [model]="items" [(activeIndex)]="activeIndex" [readonly]="false"></p-steps>

        <div class="mt-4">
            <!-- STEP 0: Upload -->
            <div *ngIf="activeIndex === 0" class="flex flex-col gap-4">
                <div class="bg-blue-50 p-4 rounded border border-blue-200">
                    <p>Bitte laden Sie eine GTFS-ZIP-Datei hoch. Die Datei wird analysiert, um verfügbare Verkehrsunternehmen (Agencies) zu ermitteln.</p>
                </div>
                <p-fileUpload mode="advanced" chooseLabel="GTFS Datei wählen" uploadLabel="Analysieren" cancelLabel="Abbrechen"
                    [customUpload]="true" (uploadHandler)="onUpload($event)" accept=".zip" maxFileSize="50000000">
                </p-fileUpload>
            </div>

            <!-- STEP 1: Select Agency -->
            <div *ngIf="activeIndex === 1" class="flex flex-col gap-4">
                <h3>Verkehrsunternehmen auswählen</h3>
                <p class="text-slate-500">Welcher Betrieb soll importiert werden?</p>
                
                <p-select [options]="agencies" [(ngModel)]="selectedAgency" optionLabel="name" placeholder="Bitte wählen..."
                    [style]="{'width': '100%'}">
                </p-select>

                <div class="flex justify-between mt-4">
                    <p-button label="Zurück" icon="pi pi-arrow-left" (onClick)="activeIndex = 0" severity="secondary"></p-button>
                    <p-button label="Weiter" icon="pi pi-arrow-right" (onClick)="activeIndex = 2" [disabled]="!selectedAgency"></p-button>
                </div>
            </div>

            <!-- STEP 2: Import & Confirm -->
            <div *ngIf="activeIndex === 2" class="flex flex-col gap-4">
                <h3>Import starten</h3>
                <div class="bg-yellow-50 p-4 rounded border border-yellow-200" *ngIf="selectedAgency">
                    <p><strong>Zusammenfassung:</strong></p>
                    <ul class="list-disc ml-5 mt-2">
                        <li>Datei: GTFS Upload</li>
                        <li>Betrieb: {{ selectedAgency.name }} ({{ selectedAgency.id }})</li>
                        <li>Ziel-Version: {{ basisVersion }}</li>
                    </ul>
                    <p class="mt-2 text-sm text-yellow-800">
                        Der Import konvertiert Haltestellen, Linien und erstellt Netzrelationen basierend auf den Fahrten dieses Betriebs.
                        Existierende Daten in dieser Version werden ergänzt (Warnung: IDs könnten kollidieren wenn nicht leer).
                    </p>
                </div>

                <div class="bg-slate-50 p-4 rounded border border-slate-200">
                    <div class="flex items-center gap-2">
                        <p-checkbox [(ngModel)]="loadEFADistances" [binary]="true" inputId="efa-checkbox"></p-checkbox>
                        <label for="efa-checkbox" class="cursor-pointer">
                            <strong>EFA Distanzen automatisch laden</strong>
                            <p class="text-sm text-slate-600">Lädt Fahrzeiten und Distanzen automatisch von der EFA API (deutlich langsamer)</p>
                        </label>
                    </div>
                </div>

                <div class="flex justify-between mt-4" *ngIf="!importing">
                    <p-button label="Zurück" icon="pi pi-arrow-left" (onClick)="activeIndex = 1" severity="secondary"></p-button>
                    <p-button label="Importieren" icon="pi pi-check" (onClick)="performImport()"></p-button>
                </div>

                <div *ngIf="importing" class="mt-4 flex flex-col gap-4">
                    <div *ngFor="let stage of importProgress?.stages" class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <span class="font-bold flex items-center gap-2">
                                <i *ngIf="stage.completed" class="pi pi-check-circle text-green-500"></i>
                                <i *ngIf="!stage.completed && stage.current > 0" class="pi pi-spin pi-spinner text-blue-500"></i>
                                {{ stage.name }}
                            </span>
                            <span *ngIf="stage.total > 0">{{ stage.current }} / {{ stage.total }}</span>
                        </div>
                        <p-progressBar 
                            [value]="stage.total > 0 ? (stage.current / stage.total * 100) : 0" 
                            [showValue]="false" 
                            styleClass="h-2">
                        </p-progressBar>
                        <p class="text-xs text-slate-500 truncate" *ngIf="stage.details">{{ stage.details }}</p>
                    </div>
                </div>
            </div>
            
            <!-- RESULT -->
             <div *ngIf="activeIndex === 3" class="flex flex-col gap-4 items-center justify-center py-8">
                <i class="pi pi-check-circle text-green-500 text-6xl"></i>
                <h3 class="text-2xl font-bold">Import erfolgreich!</h3>
                <p>{{ importResult }}</p>
                <p-button label="Abschließen" (onClick)="onFinish.emit()"></p-button>
             </div>
        </div>
    </div>
  `
})
export class GtfsWizardComponent {
    @Input() basisVersion!: number;
    @Output() onFinish = new EventEmitter<void>();

    items = [
        { label: 'Upload' },
        { label: 'Betrieb' },
        { label: 'Import' }
    ];

    activeIndex = 0;

    // State
    agencies: GTFSAgency[] = [];
    selectedAgency: GTFSAgency | null = null;
    tempFile: string = '';
    loadEFADistances = false;

    importProgress: ImportProgress | null = null;
    pollInterval: any;

    importing = false;
    importResult = '';

    constructor(
        private gtfsService: GtfsService,
        private messageService: MessageService
    ) { }

    onUpload(event: any) {
        const file = event.files[0];
        this.gtfsService.analyze(file).subscribe({
            next: (res) => {
                this.agencies = res.agencies;
                this.tempFile = res.tempFile;
                this.messageService.add({ severity: 'success', summary: 'Analyse erfolgreich', detail: `${this.agencies.length} Betriebe gefunden.` });
                this.activeIndex = 1;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Analyse fehlgeschlagen.' });
                console.error(err);
            }
        });
    }

    performImport() {
        if (!this.selectedAgency || !this.tempFile) return;

        this.importing = true;
        this.importProgress = { stages: [] };

        const importId = crypto.randomUUID();

        // Start polling
        this.pollInterval = setInterval(() => {
            this.gtfsService.getProgress(importId).subscribe(p => {
                this.importProgress = p;
            });
        }, 500);

        this.gtfsService.import(this.tempFile, this.selectedAgency.id, this.basisVersion, importId, this.loadEFADistances).subscribe({
            next: (res) => {
                clearInterval(this.pollInterval);
                this.importResult = res.message;
                this.importing = false;
                this.activeIndex = 3;
            },
            error: (err) => {
                clearInterval(this.pollInterval);
                this.messageService.add({ severity: 'error', summary: 'Import Fehler', detail: err.error?.error || 'Unbekannter Fehler' });
                this.importing = false;
            }
        });
    }
}
