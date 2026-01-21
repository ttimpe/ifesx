import { Component, OnInit, ViewChild } from '@angular/core';
import { LineService } from '../../services/line.service';
import { RecLid } from '../../models/line.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarService } from '../../services/calendar.service';

import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { faRoute, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-line-list',
  templateUrl: './line-list.component.html',
  styleUrls: ['./line-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, TableModule,
    Button,
    InputText],
})
export class LineListComponent implements OnInit {
  lines: RecLid[] = [];
  selectedBasisVersion: number | undefined;

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
        // Safe parsing or string comparison for LI_KUERZEL
        return (a.LI_KUERZEL || '').localeCompare(b.LI_KUERZEL || '');
      })
      this.lines = lines
    });
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  addLine() {
    this.router.navigate(['/lines/new']);
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
