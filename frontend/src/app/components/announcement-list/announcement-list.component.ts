import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement } from '../../models/announcement.model';
import { CalendarService } from '../../services/calendar.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.css'],
  standalone: true,
  imports: [
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
  announcements: Announcement[] = [];
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
      this.loadAnnouncements();
    });
  }

  private loadAnnouncements(): void {
    const version = this.selectedVersion || undefined;
    this.loading = true;
    this.announcementService.getAllAnnouncements(version).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching announcements:', error);
        this.loading = false;
      }
    });
  }

  deleteAnnouncement(announcement: Announcement) {
    // Confirmation usually handled by confirm service, strict delete for now
    this.announcementService.deleteAnnouncement(announcement).subscribe({
      next: () => this.loadAnnouncements(),
      error: (err) => console.error('Could not delete announcement', err)
    });
  }
}
