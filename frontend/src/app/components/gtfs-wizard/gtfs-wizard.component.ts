
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faArrowLeft,
    faArrowRight,
    faCheck,
    faCheckCircle,
    faSpinner,
    faFileAlt,
    faExclamationTriangle,
    faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

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
        CheckboxModule,
        FontAwesomeModule
    ],
    providers: [MessageService],
    template: `
    <div class="flex flex-col gap-4 p-4 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
        <p-steps [model]="items" [(activeIndex)]="activeIndex" [readonly]="false"></p-steps>

        <div class="mt-4">
            <!-- STEP 0: Upload -->
            <div *ngIf="activeIndex === 0" class="flex flex-col gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50 flex gap-3">
                    <fa-icon [icon]="faCircleInfo" class="text-blue-500 dark:text-blue-400 text-xl"></fa-icon>
                    <p class="text-slate-700 dark:text-slate-300">Bitte laden Sie eine GTFS-ZIP-Datei hoch. Die Datei wird analysiert, um verfügbare Verkehrsunternehmen (Agencies) zu ermitteln.</p>
                </div>
                <p-fileUpload mode="advanced" chooseLabel="GTFS Datei wählen" uploadLabel="Analysieren" cancelLabel="Abbrechen"
                    [customUpload]="true" (uploadHandler)="onUpload($event)" accept=".zip" maxFileSize="50000000"
                    styleClass="dark:bg-slate-900 dark:border-slate-700">
                </p-fileUpload>
            </div>

            <!-- STEP 1: Select Agency -->
            <div *ngIf="activeIndex === 1" class="flex flex-col gap-4">
                <h3 class="font-bold text-slate-800 dark:text-slate-100">Verkehrsunternehmen auswählen</h3>
                <p class="text-slate-500 dark:text-slate-400">Welcher Betrieb soll importiert werden?</p>
                
                <p-select [options]="agencies" [(ngModel)]="selectedAgency" optionLabel="name" placeholder="Bitte wählen..."
                    [style]="{'width': '100%'}" styleClass="dark:bg-slate-900 dark:border-slate-700">
                </p-select>

                <div class="flex justify-between mt-4">
                    <p-button label="Zurück" icon="pi pi-arrow-left" (onClick)="activeIndex = 0" severity="secondary"></p-button>
                    <p-button label="Weiter" icon="pi pi-arrow-right" (onClick)="activeIndex = 2" [disabled]="!selectedAgency"></p-button>
                </div>
            </div>

            <!-- STEP 2: Import & Confirm -->
            <div *ngIf="activeIndex === 2" class="flex flex-col gap-4">
                <h3 class="font-bold text-slate-800 dark:text-slate-100">Import starten</h3>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/50" *ngIf="selectedAgency">
                    <div class="flex items-center gap-2 mb-2">
                        <fa-icon [icon]="faExclamationTriangle" class="text-yellow-600 dark:text-yellow-400"></fa-icon>
                        <p class="font-bold text-yellow-800 dark:text-yellow-200">Zusammenfassung:</p>
                    </div>
                    <ul class="list-disc ml-8 text-yellow-700 dark:text-yellow-300">
                        <li>Datei: GTFS Upload</li>
                        <li>Betrieb: {{ selectedAgency.name }} ({{ selectedAgency.id }})</li>
                        <li>Ziel-Version: {{ basisVersion }}</li>
                    </ul>
                    <p class="mt-3 text-sm text-yellow-800 dark:text-yellow-400 italic">
                        Der Import konvertiert Haltestellen, Linien und erstellt Netzrelationen basierend auf den Fahrten dieses Betriebs.
                        Existierende Daten in dieser Version werden ergänzt (Warnung: IDs könnten kollidieren wenn nicht leer).
                    </p>
                </div>

                <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <p-checkbox [(ngModel)]="loadEFADistances" [binary]="true" inputId="efa-checkbox"></p-checkbox>
                        <label for="efa-checkbox" class="cursor-pointer">
                            <strong class="text-slate-800 dark:text-slate-200">EFA Distanzen automatisch laden</strong>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Lädt Fahrzeiten und Distanzen automatisch von der EFA API (deutlich langsamer)</p>
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
                            <span class="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                <fa-icon *ngIf="stage.completed" [icon]="faCheckCircle" class="text-green-500"></fa-icon>
                                <fa-icon *ngIf="!stage.completed && stage.current > 0" [icon]="faSpinner" class="text-blue-500 fa-spin"></fa-icon>
                                {{ stage.name }}
                            </span>
                            <span *ngIf="stage.total > 0" class="text-slate-500 dark:text-slate-400">{{ stage.current }} / {{ stage.total }}</span>
                        </div>
                        <p-progressBar 
                            [value]="stage.total > 0 ? (stage.current / stage.total * 100) : 0" 
                            [showValue]="false" 
                            styleClass="h-2 dark:bg-slate-800">
                        </p-progressBar>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate" *ngIf="stage.details">{{ stage.details }}</p>
                    </div>
                </div>
            </div>
            
            <!-- RESULT -->
             <div *ngIf="activeIndex === 3" class="flex flex-col gap-4 items-center justify-center py-8">
                <fa-icon [icon]="faCheckCircle" class="text-green-500 text-6xl"></fa-icon>
                <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Import erfolgreich!</h3>
                <p class="text-slate-600 dark:text-slate-400">{{ importResult }}</p>
                <p-button label="Abschließen" (onClick)="onFinish.emit()"></p-button>
             </div>
        </div>
    </div>
  `
})
export class GtfsWizardComponent {
    faArrowLeft = faArrowLeft;
    faArrowRight = faArrowRight;
    faCheck = faCheck;
    faCheckCircle = faCheckCircle;
    faSpinner = faSpinner;
    faFileAlt = faFileAlt;
    faExclamationTriangle = faExclamationTriangle;
    faCircleInfo = faCircleInfo;

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

                // Check for completion or error
                const errorStage = p.stages.find(s => s.name === 'Error');
                const doneStage = p.stages.find(s => s.name === 'Done' && s.completed);

                if (errorStage) {
                    clearInterval(this.pollInterval);
                    this.messageService.add({ severity: 'error', summary: 'Import Fehler', detail: errorStage.details });
                    this.importing = false;
                } else if (doneStage) {
                    clearInterval(this.pollInterval);
                    this.importResult = doneStage.details || 'Import erfolgreich abgeschlossen';
                    this.importing = false;
                    // Optional delay to let user see 100%
                    setTimeout(() => {
                        this.activeIndex = 3;
                    }, 1000);
                }
            });
        }, 500);

        this.gtfsService.import(this.tempFile, this.selectedAgency.id, this.basisVersion, importId, this.loadEFADistances).subscribe({
            next: (res) => {
                // Import started successfully, polling continues...
                console.log('Import started, tracking progress...', res);
            },
            error: (err) => {
                // If the START call fails (e.g. 400 Bad Request), stop polling
                clearInterval(this.pollInterval);
                this.messageService.add({ severity: 'error', summary: 'Start-Fehler', detail: err.error?.error || 'Konnte Import nicht starten' });
                this.importing = false;
            }
        });
    }
}
