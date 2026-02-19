import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecAnr } from 'src/app/models/announcement.model';
import { AnnouncementService } from 'src/app/services/announcement.service';
import { CalendarService } from '../../services/calendar.service';

// PrimeNG
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
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
    FormsModule,
    Button,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule,
    FileUploadModule,
    SelectModule
  ]
})
export class AnnouncementDetailComponent implements AfterViewInit {
  anr: RecAnr = new RecAnr();
  fileNames: string[] = [];
  isNew: boolean = true;
  uploadInProgress: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private messageService: MessageService,
    private calendarService: CalendarService
  ) { }

  ngAfterViewInit(): void {
    this.loadRecord();
    this.loadFiles();
  }

  loadFiles() {
    this.announcementService.getAllAnnouncementFiles().subscribe(files => {
      this.fileNames = files;
    });
  }

  private loadRecord(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'add') {
      this.isNew = false;
      this.announcementService.getById(Number(id)).subscribe({
        next: (rec) => { this.anr = rec; },
        error: () => this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Ansage nicht laden.' })
      });
    } else {
      this.calendarService.selectedVersion$.subscribe(v => {
        if (v) this.anr.BASIS_VERSION = v;
      });
    }
  }

  save() {
    const op = this.isNew
      ? this.announcementService.create(this.anr)
      : this.announcementService.update(this.anr);

    op.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Gespeichert' });
        setTimeout(() => this.router.navigate(['/announcements']), 500);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen.' })
    });
  }

  delete() {
    if (confirm('Wirklich löschen?')) {
      this.announcementService.delete(this.anr).subscribe(() => {
        this.router.navigate(['/announcements']);
      });
    }
  }

  onUploadHandler(event: any) {
    const file: File = event.files[0];
    if (!file) return;
    this.uploadInProgress = true;
    this.announcementService.uploadAudio(file).subscribe({
      next: (res) => {
        this.anr.ANR_DATEI = res.ANR_DATEI;
        this.uploadInProgress = false;
        this.messageService.add({ severity: 'success', summary: 'Hochgeladen', detail: res.ANR_DATEI });
        this.loadFiles();
      },
      error: () => {
        this.uploadInProgress = false;
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Upload fehlgeschlagen.' });
      }
    });
  }
}
