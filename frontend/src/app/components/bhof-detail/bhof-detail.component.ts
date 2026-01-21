import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MengeBhof } from '../../models/menge-bhof.model';
import { BhofService } from '../../services/bhof.service';
import { CalendarService } from '../../services/calendar.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { InputNumber } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-bhof-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        CardModule,
        InputNumber,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './bhof-detail.component.html',
    styleUrls: ['./bhof-detail.component.css']
})
export class BhofDetailComponent implements OnInit {
    item: MengeBhof = new MengeBhof();
    isNew = true;
    basisVersion: number = 1;

    constructor(
        private service: BhofService,
        private route: ActivatedRoute,
        private router: Router,
        private calendarService: CalendarService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        const currentVersion = this.calendarService.getCurrentVersion();
        if (currentVersion) {
            this.basisVersion = currentVersion;
            this.item.BASIS_VERSION = currentVersion;
        }

        const bhofNr = this.route.snapshot.paramMap.get('bhofNr');
        if (bhofNr && bhofNr !== 'new') {
            this.isNew = false;
            this.service.getById(+bhofNr, this.basisVersion).subscribe({
                next: (data) => {
                    this.item = data;
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Laden fehlgeschlagen' });
                }
            });
        }
    }

    save(): void {
        if (this.isNew) {
            this.service.create(this.item).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Betriebshof erstellt' });
                    this.router.navigate(['/betriebshoefe']);
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Erstellen fehlgeschlagen' });
                }
            });
        } else {
            this.service.update(this.item.BHOF_NR, this.item, this.basisVersion).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Betriebshof gespeichert' });
                    this.router.navigate(['/betriebshoefe']);
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({ severity: 'error', summary: ' Fehler', detail: 'Speichern fehlgeschlagen' });
                }
            });
        }
    }

    cancel(): void {
        this.router.navigate(['/betriebshoefe']);
    }
}
