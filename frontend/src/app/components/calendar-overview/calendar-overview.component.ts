import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarService } from '../../services/calendar.service';
import { Tagesart } from 'src/app/models/tagesart.model';
import { Betriebstag } from 'src/app/models/betriebstag.model';
import { BasisVersionGueltigkeit } from 'src/app/models/basis-version-gueltigkeit.model';
import { BasisVersion } from 'src/app/models/basis-version.model';
import { FormsModule } from '@angular/forms';
import { YearCalendarComponent } from '../year-calendar/year-calendar.component';


// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-calendar-overview',
  templateUrl: './calendar-overview.component.html',
  styleUrls: ['./calendar-overview.component.css'],
  providers: [DatePipe, ConfirmationService, MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    YearCalendarComponent,

    TableModule,
    Button,
    InputText,
    InputNumberModule,
    Dialog,
    Select,
    Tooltip,
    DatePickerModule,
    CardModule,
    FloatLabelModule,
    ConfirmDialogModule,
    ToastModule
  ]
})
export class CalendarOverviewComponent implements OnInit {
  @ViewChild(YearCalendarComponent) yearCalendar!: YearCalendarComponent;

  daytypes: Tagesart[] = []; // List of day types
  selectedDayType: Tagesart | undefined; // Selected day type for editing or deleting

  // Modal Visibility Flags
  displayTagesartModal: boolean = false;
  displayBetriebstagModal: boolean = false;

  // Versions
  basisVersions: BasisVersion[] = [];
  selectedBasisVersion: BasisVersion | undefined;
  isEditingVersion: boolean = false;
  editVersionText: string = '';

  betriebstage: Betriebstag[] = []; // List of operating days
  selectedBetriebstag: Betriebstag | undefined; // Selected operating day for editing or deleting

  // Multi-select batch assignment
  selectedDates: number[] = [];
  selectedTagesartForBatch: Tagesart | undefined; // PrimeNG Select often binds whole object or ID depending on config

  _beginDate: Date = new Date(); // Start date
  _endDate: Date = new Date(); // End date

  constructor(
    private datePipe: DatePipe,
    private calendarService: CalendarService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBasisVersions(); // Load versions first, then range
    this.loadDayTypes();
    // loadBetriebstage is called within loadBasisVersions->loadDateRange flow or explicitly
  }

  // Getter and Setter for date inputs - Kepta for existing logic compatibility if needed but PrimeNG uses Date objects directly
  get beginDate(): Date {
    return this._beginDate;
  }

  set beginDate(date: Date) {
    this._beginDate = date;
  }

  get endDate(): Date {
    return this._endDate;
  }

  set endDate(date: Date) {
    this._endDate = date;
  }

  // ===== VERSION EDITING =====

  startEditVersion(): void {
    if (this.selectedBasisVersion) {
      this.editVersionText = this.selectedBasisVersion.BASIS_VERSION_TEXT;
      this.isEditingVersion = true;
    }
  }

  cancelEditVersion(): void {
    this.isEditingVersion = false;
    this.editVersionText = '';
  }

  saveVersion(): void {
    if (!this.selectedBasisVersion) return;

    const updatedVersion: BasisVersion = {
      ...this.selectedBasisVersion,
      BASIS_VERSION_TEXT: this.editVersionText
    };

    this.calendarService.editVersion(updatedVersion).subscribe({
      next: (res) => {
        if (this.selectedBasisVersion) {
          this.selectedBasisVersion.BASIS_VERSION_TEXT = res.BASIS_VERSION_TEXT;

          const idx = this.basisVersions.findIndex(v => v.BASIS_VERSION === res.BASIS_VERSION);
          if (idx !== -1) {
            this.basisVersions[idx] = res;
          }

          this.isEditingVersion = false;
          this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Version aktualisiert!' });
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Update fehlgeschlagen.' });
      }
    });
  }

  // ===== DATE RANGE MANAGEMENT =====

  loadBasisVersions(): void {
    this.calendarService.getVersionen().subscribe(versions => {
      this.basisVersions = versions;

      const savedVersionId = localStorage.getItem('selectedDV');
      if (savedVersionId) {
        this.selectedBasisVersion = this.basisVersions.find(v => v.BASIS_VERSION === parseInt(savedVersionId, 10));
      }

      if (!this.selectedBasisVersion && this.basisVersions.length > 0) {
        this.selectedBasisVersion = this.basisVersions[0];
      }

      if (this.selectedBasisVersion) {
        this.calendarService.setSelectedVersion(this.selectedBasisVersion.BASIS_VERSION);
        this.loadDateRange();
        this.loadBetriebstage();
      }
    });
  }

  loadDateRange(): void {
    const currentYear = new Date().getFullYear();
    this._beginDate = new Date(currentYear, 0, 1);
    this._endDate = new Date(currentYear, 11, 31);

    if (!this.selectedBasisVersion) return;

    this.calendarService.getGueltigkeiten().subscribe({
      next: (gueltigkeiten) => {
        if (gueltigkeiten && gueltigkeiten.length > 0) {
          const filtered = gueltigkeiten.filter(g => g.BASIS_VERSION === this.selectedBasisVersion?.BASIS_VERSION);
          if (filtered.length > 0) {
            const values = filtered.map(g => g.VER_GUELTIGKEIT);
            const minDate = Math.min(...values);
            const maxDate = Math.max(...values);
            this._beginDate = this.parseDateNumber(minDate);
            this._endDate = this.parseDateNumber(maxDate);
          }
        }
      },
      error: (err) => {
        console.error('Error loading gueltigkeiten:', err);
      }
    });
  }

  saveDateRange(): void {
    const start = parseInt(this.datePipe.transform(this._beginDate, 'yyyyMMdd') || '0');
    const end = parseInt(this.datePipe.transform(this._endDate, 'yyyyMMdd') || '0');

    if (start === 0 || end === 0) return;
    if (!this.selectedBasisVersion) {
      this.messageService.add({ severity: 'warn', summary: 'Warnung', detail: 'Bitte Basis-Version auswählen!' });
      return;
    }

    const basisVersionId = this.selectedBasisVersion.BASIS_VERSION;

    const p1 = this.calendarService.createGueltigkeit({
      VER_GUELTIGKEIT: start,
      BASIS_VERSION: basisVersionId
    } as BasisVersionGueltigkeit).toPromise();

    const p2 = this.calendarService.createGueltigkeit({
      VER_GUELTIGKEIT: end,
      BASIS_VERSION: basisVersionId
    } as BasisVersionGueltigkeit).toPromise();

    Promise.all([p1, p2])
      .then(() => this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Fahrplanperiode gespeichert!' }))
      .catch(err => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Speichern der Periode.' });
      });
  }

  private parseDateNumber(dateNum: number): Date {
    const s = dateNum.toString();
    const year = parseInt(s.substring(0, 4));
    const month = parseInt(s.substring(4, 6)) - 1;
    const day = parseInt(s.substring(6, 8));
    return new Date(year, month, day);
  }

  // ===== TAGESARTEN METHODS =====

  loadDayTypes(): void {
    this.calendarService.getTagesarten().subscribe({
      next: (daytypes) => {
        this.daytypes = daytypes;
      },
      error: (err) => {
        console.error('Error fetching day types:', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Laden der Tagesarten fehlgeschlagen.' });
      }
    });
  }


  openTagesartModal(dayType?: Tagesart): void {
    this.selectedDayType = dayType
      ? Object.assign(new Tagesart(), dayType)
      : new Tagesart();

    this.displayTagesartModal = true;
  }

  saveTagesart(): void {
    if (this.selectedDayType) {
      const isNew = this.selectedDayType.id == null;
      const obs = isNew
        ? this.calendarService.createTagesart(this.selectedDayType)
        : this.calendarService.updateTagesart(this.selectedDayType);

      obs.subscribe({
        next: () => {
          this.loadDayTypes();
          this.displayTagesartModal = false;
          this.selectedDayType = undefined;
          this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Tagesart gespeichert.' });
        },
        error: (err) => {
          console.error('Error saving day type:', err);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen: ' + (err.error?.message || err.message) });
        }
      });
    }
  }

  deleteDaytype(dayType: Tagesart): void {
    this.confirmationService.confirm({
      message: 'Tagesart wirklich löschen?',
      header: 'Bestätigung',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.calendarService.deleteTagesart(dayType).subscribe({
          next: () => {
            this.loadDayTypes();
            this.selectedDayType = undefined;
            this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Tagesart gelöscht.' });
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  // ===== BETRIEBSTAGE METHODS =====

  loadBetriebstage(): void {
    const version = this.selectedBasisVersion ? this.selectedBasisVersion.BASIS_VERSION : undefined;
    if (version !== undefined) {
      this.calendarService.getBetriebstage(version).subscribe({
        next: (betriebstage) => {
          this.betriebstage = betriebstage;
        },
        error: (err) => {
          console.error('Error fetching Betriebstage:', err);
        }
      });
    } else {
      this.betriebstage = [];
    }
  }


  openBetriebstagModal(betriebstag?: Betriebstag): void {
    this.selectedBetriebstag = betriebstag
      ? Object.assign(new Betriebstag(), betriebstag)
      : new Betriebstag();

    // Ensure DATE format compatibility if needed? Date inputs in PrimeNG model binding
    // But data is YYYYMMDD string/number in model?
    this.displayBetriebstagModal = true;
  }

  saveBetriebstag(): void {
    if (this.selectedBetriebstag) {
      // Validation?

      const isNew = this.selectedBetriebstag.id == null;
      const obs = isNew
        ? this.calendarService.createBetriebstag(this.selectedBetriebstag)
        : this.calendarService.updateBetriebstag(this.selectedBetriebstag);

      obs.subscribe({
        next: () => {
          this.loadBetriebstage();
          this.displayBetriebstagModal = false;
          this.selectedBetriebstag = undefined;
          this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Betriebstag gespeichert.' });
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen.' });
        }
      });
    }
  }

  deleteBetriebstag(betriebstag: Betriebstag): void {
    this.confirmationService.confirm({
      message: 'Betriebstag löschen?',
      accept: () => {
        this.calendarService.deleteBetriebstag(betriebstag).subscribe({
          next: () => {
            this.loadBetriebstage();
            this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Betriebstag entfernt.' });
          }
        });
      }
    });
  }

  // ===== MULTI-SELECT BATCH ASSIGNMENT =====

  onDatesSelected(dates: number[]) {
    this.selectedDates = dates;
  }

  toggleMultiSelectMode() {
    if (this.yearCalendar) {
      this.yearCalendar.toggleMultiSelectMode();
    }
  }

  batchAssignTagesart() {
    if (!this.selectedTagesartForBatch || this.selectedDates.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Info', detail: 'Bitte Tagesart & Tage wählen.' });
      return;
    }

    // Extract ID if selectedTagesartForBatch is object
    const tagesartNr = (this.selectedTagesartForBatch as any).TAGESART_NR || this.selectedTagesartForBatch;

    this.confirmationService.confirm({
      message: `${this.selectedDates.length} Tage zuweisen?`,
      accept: () => {
        let successCount = 0;
        let errorCount = 0;
        const promises: Promise<any>[] = [];

        this.selectedDates.forEach(dateNumber => {
          const existing = this.betriebstage.find(b =>
            b.BETRIEBSTAG === dateNumber &&
            b.BASIS_VERSION === (this.selectedBasisVersion?.BASIS_VERSION || 0)
          );

          if (existing) {
            existing.TAGESART_NR = tagesartNr;
            promises.push(this.calendarService.updateBetriebstag(existing).toPromise().then(() => successCount++).catch(() => errorCount++));
          } else {
            const newBetriebstag = new Betriebstag();
            newBetriebstag.BASIS_VERSION = this.selectedBasisVersion?.BASIS_VERSION || 0;
            newBetriebstag.BETRIEBSTAG = dateNumber;
            newBetriebstag.TAGESART_NR = tagesartNr;
            newBetriebstag.BETRIEBSTAG_TEXT = '';
            promises.push(this.calendarService.createBetriebstag(newBetriebstag).toPromise().then(() => successCount++).catch(() => errorCount++));
          }
        });

        Promise.all(promises).then(() => {
          this.loadBetriebstage();
          if (this.yearCalendar) {
            this.yearCalendar.clearSelection();
          }
          this.messageService.add({ severity: 'success', summary: 'Batch Fertig', detail: `Erfolgreich: ${successCount}, Fehler: ${errorCount}` });
        });
      }
    });

  }
  // ===== GTFS WIZARD =====

  startCreateVersion(): void {
    const maxVersion = this.basisVersions.length > 0
      ? Math.max(...this.basisVersions.map(v => v.BASIS_VERSION))
      : 0;

    const newVer: BasisVersion = {
      BASIS_VERSION: maxVersion + 1,
      BASIS_VERSION_TEXT: `Version ${maxVersion + 1}`
      // id: crypto.randomUUID() // Removed
    };

    this.calendarService.createVersion(newVer).subscribe({
      next: (created) => {
        this.basisVersions.push(created);
        this.selectedBasisVersion = created;
        this.calendarService.setSelectedVersion(created.BASIS_VERSION);
        this.messageService.add({ severity: 'success', summary: 'Erstellt', detail: `Version ${created.BASIS_VERSION} erstellt.` });
        this.loadBasisVersions();
      },
      error: (err) => console.error(err)
    });
  }

  deleteCurrentVersion(): void {
    if (!this.selectedBasisVersion) return;

    const versionToDelete = this.selectedBasisVersion;
    const isLastVersion = this.basisVersions.length === 1;

    const message = isLastVersion
      ? 'Dies ist die letzte Basis-Version. Nach dem Löschen erscheint wieder der Willkommensbildschirm. Fortfahren?'
      : `Basis-Version ${versionToDelete.BASIS_VERSION} wirklich löschen? Alle zugehörigen Daten werden entfernt!`;

    this.confirmationService.confirm({
      message: message,
      header: 'Version löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.calendarService.deleteVersion(versionToDelete).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Gelöscht',
              detail: `Version ${versionToDelete.BASIS_VERSION} wurde gelöscht.`
            });

            if (isLastVersion) {
              // Navigate to welcome screen
              setTimeout(() => {
                this.router.navigate(['/welcome']);
              }, 1000); // Give user time to read the success message
            } else {
              // Reload versions and select a different one
              this.loadBasisVersions();
            }
          },
          error: (err) => {
            console.error('Error deleting version:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Version konnte nicht gelöscht werden: ' + (err.error?.message || err.message)
            });
          }
        });
      }
    });
  }

  navigateToGtfs(): void {
    if (this.selectedBasisVersion) {
      this.router.navigate(['/calendar/gtfs-import'], {
        queryParams: { version: this.selectedBasisVersion.BASIS_VERSION, tab: 'gtfs' }
      });
    }
  }

  navigateToVdv(): void {
    if (this.selectedBasisVersion) {
      this.router.navigate(['/calendar/gtfs-import'], {
        queryParams: { version: this.selectedBasisVersion.BASIS_VERSION, tab: 'vdv' }
      });
    }
  }
}
