import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const API_BASE = '/api';

interface VdvTable {
  name: string;
  description: string;
}

interface AnalyzeResult {
  tableName: string;
  modelName: string;
  supported: boolean;
  columns: string[];
  recordCount: number;
  sampleRecords: any[];
}

interface ImportResult {
  success: boolean;
  tableName: string;
  totalRecords: number;
  insertedCount: number;
  updatedCount?: number;
  errorCount: number;
  errors?: string[];
}

@Component({
  selector: 'app-vdv-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
          <i class="pi pi-database text-lg"></i>
        </span>
        <div>
          <h2 class="text-lg font-bold text-slate-800">VDV 451/452 Import</h2>
          <p class="text-sm text-slate-500">Importieren Sie einzelne .x10-Tabellen</p>
        </div>
      </div>

      <!-- File Upload -->
      <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors"
           [class.border-purple-500]="selectedFile"
           [class.bg-purple-50]="selectedFile">
        <input type="file" 
               accept=".x10,.X10"
               (change)="onFileSelected($event)"
               class="hidden" 
               #fileInput>
        
        <div *ngIf="!selectedFile" class="space-y-3">
          <i class="pi pi-upload text-4xl text-slate-400"></i>
          <p class="text-slate-600">VDV .x10-Datei hierher ziehen oder klicken</p>
          <button (click)="fileInput.click()" 
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Datei auswählen
          </button>
        </div>

        <div *ngIf="selectedFile" class="space-y-3">
          <i class="pi pi-file text-4xl text-purple-500"></i>
          <p class="font-medium text-slate-800">{{ selectedFile.name }}</p>
          <p class="text-sm text-slate-500">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
          <button (click)="clearFile()" class="text-sm text-red-500 hover:underline">Entfernen</button>
        </div>
      </div>

      <!-- Analyze Result -->
      <div *ngIf="analyzeResult" class="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 class="font-bold text-slate-800 mb-2">Dateianalyse</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-slate-500">Tabelle:</span>
            <span class="ml-2 font-medium">{{ analyzeResult.tableName }}</span>
          </div>
          <div>
            <span class="text-slate-500">Datensätze:</span>
            <span class="ml-2 font-medium">{{ analyzeResult.recordCount }}</span>
          </div>
          <div>
            <span class="text-slate-500">Status:</span>
            <span *ngIf="analyzeResult.supported" class="ml-2 text-green-600 font-medium">
              <i class="pi pi-check-circle mr-1"></i>Unterstützt
            </span>
            <span *ngIf="!analyzeResult.supported" class="ml-2 text-red-600 font-medium">
              <i class="pi pi-times-circle mr-1"></i>Nicht unterstützt
            </span>
          </div>
        </div>
        
        <div *ngIf="analyzeResult.columns.length > 0" class="mt-3">
          <span class="text-slate-500 text-sm">Spalten:</span>
          <div class="flex flex-wrap gap-1 mt-1">
            <span *ngFor="let col of analyzeResult.columns" 
                  class="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-mono">
              {{ col }}
            </span>
          </div>
        </div>
      </div>

      <!-- Import Options -->
      <div *ngIf="analyzeResult?.supported" class="space-y-4">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-slate-700">Modus:</label>
          <select [(ngModel)]="importMode" 
                  class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="merge">Zusammenführen (Upsert)</option>
            <option value="replace">Ersetzen (alle löschen)</option>
          </select>
        </div>

        <button (click)="startImport()" 
                [disabled]="importing"
                class="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
          <span *ngIf="!importing">
            <i class="pi pi-upload mr-2"></i>Importieren
          </span>
          <span *ngIf="importing">
            <i class="pi pi-spin pi-spinner mr-2"></i>Importiere...
          </span>
        </button>
      </div>

      <!-- Import Result -->
      <div *ngIf="importResult" 
           class="rounded-xl p-4 border"
           [class.bg-green-50]="importResult.success"
           [class.border-green-200]="importResult.success"
           [class.bg-red-50]="!importResult.success"
           [class.border-red-200]="!importResult.success">
        <h3 class="font-bold mb-2" 
            [class.text-green-800]="importResult.success"
            [class.text-red-800]="!importResult.success">
          {{ importResult.success ? 'Import erfolgreich!' : 'Import fehlgeschlagen' }}
        </h3>
        <div class="text-sm space-y-1">
          <p><strong>{{ importResult.insertedCount }}</strong> neue Datensätze eingefügt</p>
          <p *ngIf="importResult.updatedCount"><strong>{{ importResult.updatedCount }}</strong> Datensätze aktualisiert</p>
          <p *ngIf="importResult.errorCount > 0" class="text-red-600">
            <strong>{{ importResult.errorCount }}</strong> Fehler
          </p>
          <div *ngIf="importResult.errors && importResult.errors.length > 0" class="mt-2 p-2 bg-red-100 rounded text-xs">
            <div *ngFor="let err of importResult.errors">{{ err }}</div>
          </div>
        </div>
      </div>

      <!-- Export Section -->
      <div class="border-t border-slate-200 pt-6 mt-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <i class="pi pi-download text-lg"></i>
          </span>
          <div>
            <h2 class="text-lg font-bold text-slate-800">VDV 452 Export</h2>
            <p class="text-sm text-slate-500">Tabellen als .x10-Dateien exportieren</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button *ngFor="let table of availableTables" 
                  (click)="exportTable(table.name)"
                  class="px-3 py-2 bg-slate-100 hover:bg-green-100 text-slate-700 hover:text-green-700 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:border-green-300 text-left">
            <i class="pi pi-download mr-1 text-xs"></i>{{ table.name }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VdvImportComponent implements OnInit {
  @Input() basisVersion: number = 1;

  selectedFile: File | null = null;
  analyzeResult: AnalyzeResult | null = null;
  importResult: ImportResult | null = null;
  importMode: string = 'merge';
  importing: boolean = false;
  availableTables: VdvTable[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadAvailableTables();
  }

  loadAvailableTables() {
    this.http.get<VdvTable[]>(`${API_BASE}/vdv/tables`).subscribe({
      next: (tables) => this.availableTables = tables,
      error: (err) => console.error('Failed to load tables:', err)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.importResult = null;
      this.analyzeFile();
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.analyzeResult = null;
    this.importResult = null;
  }

  analyzeFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<AnalyzeResult>(`${API_BASE}/vdv/analyze-x10`, formData).subscribe({
      next: (result) => this.analyzeResult = result,
      error: (err) => {
        console.error('Analyze failed:', err);
        this.analyzeResult = null;
      }
    });
  }

  startImport() {
    if (!this.selectedFile || !this.analyzeResult?.supported) return;

    this.importing = true;
    this.importResult = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('basisVersion', String(this.basisVersion));
    formData.append('mode', this.importMode);

    this.http.post<ImportResult>(`${API_BASE}/vdv/import-x10`, formData).subscribe({
      next: (result) => {
        this.importResult = result;
        this.importing = false;
      },
      error: (err) => {
        console.error('Import failed:', err);
        this.importResult = {
          success: false,
          tableName: '',
          totalRecords: 0,
          insertedCount: 0,
          errorCount: 1,
          errors: [err.error?.error || err.message]
        };
        this.importing = false;
      }
    });
  }

  exportTable(tableName: string) {
    const url = `${API_BASE}/vdv/export-x10/${tableName}?basisVersion=${this.basisVersion}`;
    window.open(url, '_blank');
  }
}
