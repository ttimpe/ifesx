import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import {
  faCircleH, faTableList, faRoute, faLocationCrosshairs,
  faVolumeHigh, faMap, faCalendar, faMapMarkerAlt,
  faExchangeAlt, faWalking, faLayerGroup, faBus, faQuestionCircle,
  faClock, faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { CalendarService } from '../../../services/calendar.service';
import { BasisVersion } from '../../../models/basis-version.model';
import { BasisVersionGueltigkeit } from '../../../models/basis-version-gueltigkeit.model';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    FormsModule,
    Select,
    Button,
    ConfirmPopupModule
  ],
  providers: [ConfirmationService],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  faCircleH = faCircleH;
  faTableList = faTableList;
  faRoute = faRoute;
  faLocationCrosshairs = faLocationCrosshairs;
  faVolumeHigh = faVolumeHigh;
  faMap = faMap;
  faCalendar = faCalendar;
  faMapMarkerAlt = faMapMarkerAlt;
  faExchangeAlt = faExchangeAlt;
  faWalking = faWalking;
  faLayerGroup = faLayerGroup;
  faBus = faBus;
  faQuestionCircle = faQuestionCircle;
  faClock = faClock;
  faBuilding = faBuilding;

  selectedDVID: string | null = localStorage.getItem('selectedDV');
  versionen: BasisVersion[] = [];
  gueltigkeiten: BasisVersionGueltigkeit[] = [];
  selectedVersion: BasisVersion | undefined;

  constructor(
    private calendarService: CalendarService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    forkJoin({
      versionen: this.calendarService.getVersionen(),
      gueltigkeiten: this.calendarService.getGueltigkeiten()
    }).subscribe({
      next: (data) => {
        this.versionen = data.versionen;
        this.gueltigkeiten = data.gueltigkeiten;

        // Restore selection
        if (this.selectedDVID) {
          this.selectedVersion = this.versionen.find(v => v.id === this.selectedDVID);
        }

        if (!this.selectedVersion && this.versionen.length > 0) {
          this.selectedVersion = this.versionen[0];
          this.onVersionChange();
        } else if (this.selectedVersion) {
          this.calendarService.setSelectedVersion(this.selectedVersion.BASIS_VERSION);
        } else if (this.versionen.length === 0) {
          // No version - handled by MainLayout redirect usually.
          // But ensure we don't crash or select undefined.
          this.selectedVersion = undefined;
          this.calendarService.setSelectedVersion(0);
        }
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }

  getValidityDate(versionId: number): string {
    const gueltig = this.gueltigkeiten.find(g => g.BASIS_VERSION === versionId);
    if (!gueltig) return '';
    // Format YYYYMMDD to DD.MM.YYYY
    const s = gueltig.VER_GUELTIGKEIT.toString();
    if (s.length === 8) {
      return `${s.substring(6, 8)}.${s.substring(4, 6)}.${s.substring(0, 4)}`;
    }
    return s;
  }

  onVersionChange(): void {
    if (this.selectedVersion) {
      this.selectedDVID = this.selectedVersion.id;
      localStorage.setItem('selectedDV', this.selectedDVID);
      this.calendarService.setSelectedVersion(this.selectedVersion.BASIS_VERSION);
    }
  }

  navigateToCreateVersion(): void {
    this.router.navigate(['/calendar'], { queryParams: { mode: 'create' } });
  }

  deleteVersion(event: Event, version: BasisVersion): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Möchtest du Version "${version.BASIS_VERSION_TEXT}" wirklich löschen?`,
      header: 'Version löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this.calendarService.deleteVersion(version).subscribe({
          next: () => {
            this.versionen = this.versionen.filter(v => v.id !== version.id);
            if (this.selectedVersion?.id === version.id) {
              this.selectedVersion = this.versionen.length > 0 ? this.versionen[0] : undefined;
              this.onVersionChange();
            }
          },
          error: (err) => console.error('Error deleting version:', err)
        });
      }
    });
  }

  // Deprecated/Removed per user request (moved to Calendar view)
  showCreateVersionDialog: boolean = false;
  newVersion: Partial<BasisVersion> = { BASIS_VERSION: 0, BASIS_VERSION_TEXT: '' };
  createVersion(): void { }
  saveNewVersion(): void { }
}
