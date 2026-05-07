
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GtfsWizardComponent } from '../gtfs-wizard/gtfs-wizard.component';
import { VdvImportComponent } from '../vdv-import/vdv-import.component';
import { CalendarService } from '../../services/calendar.service';
import { BasisVersion } from '../../models/basis-version.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-gtfs-import-page',
    standalone: true,
    imports: [
        CommonModule,
        FontAwesomeModule,
        GtfsWizardComponent,
        VdvImportComponent
    ],
    template: `
    <div class="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
        <!-- Integrated Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
            <div class="flex items-center gap-4">
               <button (click)="goBack()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                   <fa-icon [icon]="faArrowLeft" class="text-lg"></fa-icon>
               </button>
               <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <fa-icon [icon]="faUpload" class="text-xl"></fa-icon>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            Import Assistent
                        </h1>
                    </div>
               </div>
            </div>
            
            <!-- Tab Buttons -->
            <div class="flex gap-2">
              <button (click)="activeTab = 'gtfs'" 
                      [class]="activeTab === 'gtfs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                      class="px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                GTFS
              </button>
              <button (click)="activeTab = 'vdv'" 
                      [class]="activeTab === 'vdv' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                      class="px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                VDV 452
              </button>
            </div>
        </div>
        
        <div class="p-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div class="mb-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                     <i class="pi pi-info-circle text-blue-500 dark:text-blue-400 text-xl"></i>
                     <div>
                        <h3 class="font-bold text-blue-800 dark:text-blue-200">Import in Version: {{ version?.BASIS_VERSION_TEXT || 'Laden...' }} ({{ version?.BASIS_VERSION }})</h3>
                        <p class="text-sm text-blue-600 dark:text-blue-400">{{ activeTab === 'gtfs' ? 'GTFS-Daten importieren' : 'VDV 452 Tabellen importieren/exportieren' }}</p>
                     </div>
                </div>

                <!-- GTFS Tab -->
                <div *ngIf="activeTab === 'gtfs'">
                    <app-gtfs-wizard *ngIf="version" [basisVersion]="version.BASIS_VERSION" 
                        (onFinish)="onFinish()"></app-gtfs-wizard>
                </div>
                
                <!-- VDV Tab -->
                <div *ngIf="activeTab === 'vdv'">
                    <app-vdv-import *ngIf="version" [basisVersion]="version.BASIS_VERSION"></app-vdv-import>
                </div>
                
                <div *ngIf="!version" class="p-4 text-center text-slate-500">
                    <i class="pi pi-spin pi-spinner text-2xl"></i> Lade Versionsdaten...
                </div>
            </div>
        </div>
    </div>
  `
})
export class GtfsImportPageComponent implements OnInit {
    faUpload = faUpload;
    faArrowLeft = faArrowLeft;
    version: BasisVersion | undefined;
    activeTab: 'gtfs' | 'vdv' = 'gtfs';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private calendarService: CalendarService
    ) { }

    ngOnInit() {
        // Option 1: Get from Query Param
        this.route.queryParams.subscribe(params => {
            const versionId = params['version'];
            const tab = params['tab'];

            if (tab && (tab === 'gtfs' || tab === 'vdv')) {
                this.activeTab = tab;
            }

            if (versionId) {
                // Fetch specific or rely on service state? 
                // Currently service state might be enough if we just came from there?
                // But better be safe and find it from list.
                this.calendarService.getVersionen().subscribe(versions => {
                    this.version = versions.find(v => v.BASIS_VERSION == versionId);
                    if (!this.version) {
                        this.router.navigate(['/calendar']);
                    }
                });
            } else {
                // Fallback: Use selected
                const selected = this.calendarService.getCurrentVersion();
                if (selected) {
                    this.calendarService.getVersionen().subscribe(versions => {
                        this.version = versions.find(v => v.BASIS_VERSION == selected);
                    });
                } else {
                    this.router.navigate(['/calendar']);
                }
            }
        });
    }

    goBack() {
        this.router.navigate(['/calendar']);
    }

    onFinish() {
        this.router.navigate(['/calendar']);
    }
}
