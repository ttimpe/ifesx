import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecSelFztFeldService } from '../../services/rec-sel-fzt-feld.service';
import { MengeBereichService } from '../../services/menge-bereich.service';
import { RecSelFztFeld } from '../../models/rec-sel-fzt-feld.model';
import { MengeBereich } from '../../models/menge-bereich.model';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarService } from '../../services/calendar.service';
import { StopService } from '../../services/stop.service';
import { MengeFgrService } from '../../services/menge-fgr.service';
import { RecOrt } from '../../models/rec-ort.model';
import { MengeFgr } from '../../models/menge-fgr.model';

// Helper interface for UI
interface FztRow extends RecSelFztFeld {
  ORT_NAME?: string;
  SEL_ZIEL_NAME?: string;
}

@Component({
  selector: 'app-rec-fzt-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    SelectModule,
    InputNumber,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './rec-fzt-matrix.component.html',
  styleUrl: './rec-fzt-matrix.component.css'
})
export class RecFztMatrixComponent implements OnInit {
  rows: FztRow[] = [];
  loading = false;

  bereiche: MengeBereich[] = [];
  selectedBereichNr: number = 1;
  selectedVersion: number | null = null;
  selectedFgrNr: number | null = null;

  // Add Dialog State
  showAddDialog = false;
  stops: RecOrt[] = [];
  fgrs: MengeFgr[] = [];
  newFzt: any = {
    FGR_NR: 1,
    ORT_NR: null,
    SEL_ZIEL: null,
    SEL_FZT: 300
  };

  constructor(
    private fztService: RecSelFztFeldService,
    private bereichService: MengeBereichService,
    private stopService: StopService,
    private fgrService: MengeFgrService,
    private calendarService: CalendarService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Subscribe to version changes first
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedVersion = version;
      this.reloadIfReady();
    });

    // Load Bereiche
    this.bereichService.getAll().subscribe(data => {
      this.bereiche = data;

      // Check query param
      const paramBereich = this.route.snapshot.queryParamMap.get('bereich');
      if (paramBereich) {
        this.selectedBereichNr = parseInt(paramBereich);
      } else if (this.bereiche.length > 0) {
        this.selectedBereichNr = this.bereiche[0].BEREICH_NR;
      }

      this.reloadIfReady();
    });

    // Load Stops for Dialog
    this.stopService.getAllRecOrts().subscribe(data => {
      this.stops = data;
    });

    // Load FGRs for Dialog
    this.fgrService.getAll().subscribe(data => {
      this.fgrs = data;
    });
  }

  reloadIfReady() {
    if (this.selectedBereichNr) {
      this.loadMatrix();
    }
  }

  loadMatrix() {
    if (!this.selectedBereichNr) return;
    this.loading = true;
    // Pass selectedVersion (fall back to undefined if null, though service handles undefined)
    const version = this.selectedVersion || undefined;

    this.fztService.getByBereich(this.selectedBereichNr, version).subscribe({
      next: (data) => {
        // Apply FGR filter if selected
        if (this.selectedFgrNr !== null) {
          this.rows = data.filter(row => row.FGR_NR === this.selectedFgrNr);
        } else {
          this.rows = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onBereichChange() {
    this.loadMatrix();
  }

  onFgrChange() {
    this.loadMatrix();
  }

  updateTime(row: FztRow, val: string | number | null) {
    let newValue = val;
    if (typeof newValue === 'string') {
      newValue = parseFloat(newValue);
    }
    if (newValue === null || newValue === undefined || isNaN(newValue)) return;

    row.SEL_FZT = newValue;

    // Ensure version is set on update if new?
    // Usually updates just need ID keys.
    // Assuming backend handles it or we just send the row as is.
    // If it's a new row logic (not here yet), we'd set BASIS_VERSION.
    // Ensure version is set on update
    if (!row.BASIS_VERSION) {
      row.BASIS_VERSION = this.selectedVersion || 1;
    }

    this.fztService.update(row).subscribe({
      next: (res) => {
        console.log('Updated', res);
      },
      error: (err) => {
        console.error('Update failed', err);
      }
    });
  }

  openAddDialog() {
    this.showAddDialog = true;
  }

  onAdd() {
    if (!this.newFzt.ORT_NR || !this.newFzt.SEL_ZIEL) return;

    const payload: RecSelFztFeld = {
      ...this.newFzt,
      BASIS_VERSION: this.selectedVersion || 1,
      BEREICH_NR: this.selectedBereichNr,
      ONR_TYP_NR: 1, // Default Stop
      SEL_ZIEL_TYP: 1 // Default Stop
    };

    this.fztService.update(payload).subscribe({
      next: () => {
        this.showAddDialog = false;
        this.loadMatrix();
        // Reset form
        this.newFzt = {
          FGR_NR: 1,
          ORT_NR: null,
          SEL_ZIEL: null,
          SEL_FZT: 300
        };
      },
      error: (err) => {
        console.error('Add failed', err);
      }
    });
  }
}
