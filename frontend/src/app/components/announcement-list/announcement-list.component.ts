import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../services/announcement.service';
import { RecAnr } from '../../models/announcement.model';
import { CalendarService } from '../../services/calendar.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.css'],
  standalone: true,
  imports: [
        FontAwesomeModule,
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Tooltip
  
    ]
})
export class AnnouncementListComponent implements OnInit {
    faBullhorn = faBullhorn;
  announcements: RecAnr[] = [];
  selectedVersion: number | null = null;
  loading: boolean = false;

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedVersion = version;
      this.load();
    });
  }

  private load(): void {
    this.loading = true;
    this.announcementService.getAll(this.selectedVersion || undefined).subscribe({
      next: (list) => { this.announcements = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  delete(anr: RecAnr) {
    if (confirm('Wirklich löschen?')) {
      this.announcementService.delete(anr).subscribe({
        next: () => this.load(),
        error: (err) => console.error('Löschen fehlgeschlagen', err)
      });
    }
  }
}
