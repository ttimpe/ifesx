
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker'; // Assuming new primeng
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarService } from '../../services/calendar.service';
import { BasisVersion } from '../../models/basis-version.model';
import { BasisVersionGueltigkeit } from '../../models/basis-version-gueltigkeit.model';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DatePickerModule,
        FloatLabelModule
    ],
    template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <p-card styleClass="max-w-xl w-full shadow-lg">
        <ng-template pTemplate="header">
           <div class="h-32 bg-blue-600 rounded-t-xl flex items-center justify-center">
              <i class="pi pi-compass text-6xl text-white"></i>
           </div>
        </ng-template>
        
        <div class="text-center mb-8 mt-4">
            <h1 class="text-3xl font-bold text-slate-800 mb-2">Willkommen bei IFESX</h1>
            <p class="text-slate-600">Es wurden keine Fahrplandaten gefunden. Bitte erstellen Sie eine erste Version, um zu beginnen.</p>
        </div>

        <div class="flex flex-col gap-6 px-4">
            <div class="flex flex-col gap-2">
                <label for="vtext" class="font-semibold text-slate-700">Bezeichnung</label>
                <input pInputText id="vtext" [(ngModel)]="versionText" placeholder="z.B. Fahrplan 2026" class="w-full" />
            </div>

            <div class="flex flex-col gap-2">
                <label for="vstart" class="font-semibold text-slate-700">Gültig Ab</label>
                <p-datepicker [(ngModel)]="validFrom" dateFormat="dd.mm.yy" [showIcon]="true" styleClass="w-full" inputStyleClass="w-full"></p-datepicker>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <p-button label="Leeres System starten" icon="pi pi-check" (onClick)="createVersion(false)" severity="secondary" styleClass="w-full"></p-button>
                <p-button label="Mit GTFS Import starten" icon="pi pi-upload" (onClick)="createVersion(true)" styleClass="w-full"></p-button>
            </div>
        </div>
      </p-card>
    </div>
  `
})
export class WelcomeComponent {
    versionText: string = 'Basis-Fahrplan';
    validFrom: Date = new Date();

    constructor(
        private calendarService: CalendarService,
        private router: Router
    ) { }

    createVersion(withGtfs: boolean) {
        if (!this.versionText) return;

        // 1. Create BasisVersion
        // Since we have no versions, we assume ID 1.
        // Backend usually handles auto-increment if configured, but existing logic often sends ID.
        // Let's rely on backend or service logic if possible, or send 1.
        // Looking at previous codes: maxVersion + 1. Since list is empty -> 1.
        const newVer: BasisVersion = {
            BASIS_VERSION: 1,
            BASIS_VERSION_TEXT: this.versionText,
            id: crypto.randomUUID()
        };

        this.calendarService.createVersion(newVer).subscribe({
            next: (created) => {
                // 2. Create Validity (Gültigkeit) if date provided
                if (this.validFrom) {
                    const yyyy = this.validFrom.getFullYear();
                    const mm = (this.validFrom.getMonth() + 1).toString().padStart(2, '0');
                    const dd = this.validFrom.getDate().toString().padStart(2, '0');
                    const dateNum = parseInt(`${yyyy}${mm}${dd}`);

                    const gueltigkeit: BasisVersionGueltigkeit = {
                        BASIS_VERSION: created.BASIS_VERSION,
                        VER_GUELTIGKEIT: dateNum
                    };

                    this.calendarService.createGueltigkeit(gueltigkeit).subscribe();
                }

                // 3. Set Active & Redirect
                this.calendarService.setSelectedVersion(created.BASIS_VERSION);

                if (withGtfs) {
                    this.router.navigate(['/calendar/gtfs-import'], { queryParams: { version: created.BASIS_VERSION } });
                } else {
                    this.router.navigate(['/lines']); // Or calendar? Lines is usually "Home"
                }
            },
            error: (err) => console.error(err)
        });
    }
}
