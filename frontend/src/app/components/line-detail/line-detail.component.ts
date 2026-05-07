import { Component, OnInit } from '@angular/core';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LineService } from '../../services/line.service';
import { RecLid } from '../../models/line.model';

import { Route } from '../../models/route.model';
import { RouteService } from '../../services/route.service';
import { CommonModule } from '@angular/common'; // PrimeNG
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { Select } from 'primeng/select';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-line-detail',
  templateUrl: './line-detail.component.html',
  styleUrls: ['./line-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    RouterModule,

    Button,
    InputText,
    InputNumber,
    TableModule,
    DialogModule,
    CardModule,
    ColorPickerModule,
    ToastModule
  ]
})
export class LineDetailComponent implements OnInit {
  faRoute = faRoute;
  line?: RecLid
  variants: RecLid[] = []
  originalLineId?: number

  get isNew(): boolean {
    return !this.line?.LI_NR || this.line.LI_NR === 0;
  }

  constructor(
    private route: ActivatedRoute,
    private lineService: LineService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const lineId = params['lineId'];

      // Check if creating a new line
      if (lineId === 'new') {
        this.line = {
          LI_NR: 0,
          STR_LID: '',
          LI_KUERZEL: '',
          LIDNAME: '',
          BASIS_VERSION: 1
        } as RecLid;
        this.variants = [];
        return;
      }

      this.lineService.getLineById(+lineId).subscribe(line => {
        this.line = line;
        this.originalLineId = line.LI_NR; // Store original ID
      });
      // VDV Variants
      this.lineService.getLineVariants(+lineId).subscribe(vars => {
        this.variants = vars;
      });
    });
  }

  ngAfterViewInit() {
  }

  saveLine(): void {
    if (!this.line) return;

    // Check if LI_NR has changed
    const idChanged = this.originalLineId && this.line.LI_NR !== this.originalLineId;

    if (idChanged) {
      // Confirm cascade update
      const confirmed = confirm(
        `⚠️ WARNUNG: Linien-ID wird von ${this.originalLineId} auf ${this.line.LI_NR} geändert.\n\n` +
        `Alle abhängigen Datensätze werden automatisch aktualisiert:\n` +
        `- Linienvarianten (REC_LID)\n` +
        `- Fahrwege (LID_VERLAUF)\n` +
        `- Fahrten (REC_FRT)\n` +
        `- Umstiege (REC_UMS)\n\n` +
        `Fortfahren?`
      );

      if (!confirmed) {
        // Revert to original ID
        this.line.LI_NR = this.originalLineId!;
        return;
      }

      // Call cascade update endpoint
      this.lineService.updateLineIdCascade(this.originalLineId!, this.line.LI_NR, this.line.BASIS_VERSION).subscribe(
        (response: any) => {
          console.log('Cascade update successful:', response);
          alert(`✅ Linien-ID erfolgreich aktualisiert!\n${response.message}`);
          // Reload page with new ID
          this.router.navigate(['/lines', this.line!.LI_NR]);
        },
        (error: any) => {
          console.error('Error in cascade update:', error);
          alert(`❌ Fehler beim Aktualisieren: ${error.error?.error || error.message}`);
          // Revert
          if (this.line) {
            this.line.LI_NR = this.originalLineId!;
          }
        }
      );
    } else {
      // Normal update
      this.lineService.updateLine(this.line).subscribe(
        (updatedLine: RecLid) => {
          console.log('Line updated:', updatedLine);
          alert('✅ Linie gespeichert!');
        },
        (error: any) => {
          console.error('Error updating line:', error);
          alert('❌ Fehler beim Speichern!');
        }
      );
    }
  }

  editVariant(variant: RecLid): void {
    this.router.navigate(['/lines', this.line?.LI_NR, 'variants', variant.STR_LI_VAR]);
  }

  addVariant(): void {
    this.router.navigate(['/lines', this.line?.LI_NR, 'variants', 'new']);
  }

  deleteVariant(variant: RecLid): void { // Fixed type
    if (!confirm('Variante wirklich löschen?')) return;
    this.lineService.deleteVariant(variant.LI_NR, variant.STR_LI_VAR).subscribe(() => {
      this.variants = this.variants.filter(v => v.STR_LI_VAR !== variant.STR_LI_VAR);
    });
  }
}
