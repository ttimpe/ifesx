import { Component, OnInit, ViewChild } from '@angular/core';
import { LineService } from '../../services/line.service';
import { RecLid } from '../../models/line.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarService } from '../../services/calendar.service';

import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { faRoute, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-line-list',
  templateUrl: './line-list.component.html',
  styleUrls: ['./line-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, TableModule,
    Button, InputTextModule, InputNumberModule, DialogModule, FormsModule, TooltipModule],
})
export class LineListComponent implements OnInit {
  lines: RecLid[] = [];
  selectedBasisVersion: number | undefined;

  showAddLineDialog = false;
  newLineData: Partial<RecLid> = {};

  faTrash = faTrash
  faPlus = faPlus
  faRoute = faRoute

  @ViewChild('dt') dt: Table | undefined;

  constructor(private lineService: LineService, private router: Router, private calendarService: CalendarService) { }

  ngOnInit(): void {
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedBasisVersion = version || undefined;
      this.loadLines();
    });
  }

  loadLines() {
    this.lineService.getLines(this.selectedBasisVersion).subscribe(lines => {
      lines.sort((a: RecLid, b: RecLid) => {
        // Natural sort order (1, 2, 10 instead of 1, 10, 2)
        return (a.LI_KUERZEL || '').localeCompare(b.LI_KUERZEL || '', undefined, { numeric: true });
      })
      this.lines = lines
    });
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  addLine() {
    const maxLine = this.lines.length > 0 ? Math.max(...this.lines.map(l => Number(l.LI_NR) || 0)) : 0;
    this.newLineData = {
      LI_NR: maxLine + 1,
      LI_KUERZEL: '',
      STR_LI_VAR: 'V01',
      LIDNAME: ''
    };
    this.showAddLineDialog = true;
  }

  saveNewLine() {
    if (!this.newLineData.LI_NR || !this.newLineData.STR_LI_VAR) return;
    this.lineService.createVariant(this.newLineData as RecLid).subscribe(() => {
      this.showAddLineDialog = false;
      this.loadLines();
      this.router.navigate(['/lines', this.newLineData.LI_NR, 'variants', this.newLineData.STR_LI_VAR]);
    });
  }

  addVariantToExisting(line: RecLid) {
    this.router.navigate(['/lines', line.LI_NR, 'variants', 'new']);
  }

  editLine(line: RecLid) {
    this.router.navigate(['/lines/' + line.LI_NR]);
  }

  deleteLine(line: RecLid) {
    // Confirm delete?
    if (!confirm('Linie wirklich löschen?')) return;

    this.lineService.deleteLine(line.LI_NR).subscribe(() => {
      this.lines = this.lines.filter(l => l.LI_NR !== line.LI_NR);
    });
  }
}
