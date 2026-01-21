import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Announcement } from 'src/app/models/announcement.model';
import { Stop } from 'src/app/models/stop.model';
import { AnnouncementService } from 'src/app/services/announcement.service';
import { CalendarService } from '../../services/calendar.service';
import { StopSearchFieldComponent } from '../stop-search-field/stop-search-field.component';


// PrimeNG
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-announcement-detail',
  templateUrl: './announcement-detail.component.html',
  styleUrls: ['./announcement-detail.component.css'],
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    StopSearchFieldComponent,
    FormsModule,

    Button,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule,
    TableModule,
    FileUploadModule,
    SelectModule
  ]
})
export class AnnouncementDetailComponent implements AfterViewInit {
  announcement: Announcement = new Announcement();
  fileNames: string[] = [];
  isNew: boolean = true;
  uploadedFiles: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private messageService: MessageService,
    private calendarService: CalendarService
  ) { }

  ngAfterViewInit(): void {
    this.loadAnnouncement();
    this.loadFiles();
  }

  async loadFiles() {
    this.announcementService.getAllAnnouncementFiles().subscribe(files => {
      this.fileNames = files;
    });
  }

  private loadAnnouncement(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionParam = this.route.snapshot.queryParamMap.get('version');

    if (id && id !== 'add') {
      this.isNew = false;
      const basisVersion = versionParam ? Number(versionParam) : 1;

      this.announcementService.getAnnouncementById(Number(id), basisVersion).subscribe({
        next: (announcement) => {
          this.announcement = announcement;
          if (!this.announcement.stops) {
            this.announcement.stops = [];
          }
        },
        error: (error) => {
          console.error('Error fetching announcement:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Ansage nicht laden.' });
        }
      });
    } else {
      // New Creation
      this.calendarService.selectedVersion$.subscribe(v => {
        if (v) this.announcement.basisVersion = v;
      });
    }
  }

  saveAnnouncement() {
    if (this.announcement.id) {
      this.announcementService.updateAnnouncement(this.announcement).subscribe({
        next: (updated) => {
          this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Ansage aktualisiert!' });
          setTimeout(() => this.router.navigate(['/announcements']), 500);
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen.' });
        }
      });
    } else {
      this.announcementService.createAnnouncement(this.announcement).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Ansage erstellt!' });
          setTimeout(() => this.router.navigate(['/announcements']), 500);
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Erstellen fehlgeschlagen.' });
        }
      });
    }
  }

  deleteAnnouncement() {
    if (this.announcement.id) {
      // Simple confirm for now
      if (confirm("Wirklich löschen?")) {
        this.announcementService.deleteAnnouncement(this.announcement).subscribe(() => {
          this.router.navigate(['/announcements']);
        });
      }
    }
  }

  selectStop(stop: Stop) {
    if (!this.announcement.stops) {
      this.announcement.stops = [];
    }
    // Avoid duplicates
    if (!this.announcement.stops.find(s => s.id === stop.id)) {
      this.announcement.stops.push(stop);
      this.announcement.stops = [...this.announcement.stops]; // Trigger change detection
    }
  }

  removeStop(stop: Stop) {
    this.announcement.stops = this.announcement.stops.filter(s => s.id !== stop.id);
  }

  onUpload(event: any) {
    this.messageService.add({ severity: 'info', summary: 'Datei hochgeladen', detail: '' });
    // In a real app we might get the filename back from the server response
    // For now, let's refresh list
    this.loadFiles();
  }

  onSelect(event: any) {
    // Logic for selecting file before upload if needed
  }
}
