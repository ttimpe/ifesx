import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecUeb } from '../../models/rec-ueb.model';
import { RecUebService } from '../../services/rec-ueb.service';
import { StopService } from '../../services/stop.service';
import { RecOrt } from '../../models/rec-ort.model';


import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CalendarService } from '../../services/calendar.service';
import { Tagesart } from '../../models/tagesart.model';

@Component({
    selector: 'app-rec-ueb-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule,
        InputTextModule, InputNumberModule, ButtonModule, DropdownModule, CardModule, TableModule],
    templateUrl: './rec-ueb-detail.component.html',
    styleUrls: ['./rec-ueb-detail.component.css']
})
export class RecUebDetailComponent implements OnInit {
    item: RecUeb = new RecUeb();
    isNew = true;

    stops: RecOrt[] = [];
    tagesarten: Tagesart[] = [];

    newFzt: any = {
        FGR_NR: 1,
        TAGESART_NR: 1,
        UEB_FAHRZEIT: 300
    };

    constructor(
        private service: RecUebService,
        private stopService: StopService,
        private calendarService: CalendarService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.stopService.getAllRecOrts().subscribe(s => this.stops = s);
        this.calendarService.getTagesarten().subscribe((t: Tagesart[]) => this.tagesarten = t);

        // Check if new or edit based on route or query params
        // Assuming 'new' route path check first
        if (this.router.url.includes('/new')) {
            this.isNew = true;
            this.item.BASIS_VERSION = 1; // Default
        } else {
            this.route.queryParams.subscribe(params => {
                if (params['ORT_NR']) {
                    this.isNew = false;
                    this.service.getOne(params).subscribe(data => {
                        this.item = data;
                    });
                }
            });
        }
    }

    save(): void {
        if (this.isNew) {
            this.service.create(this.item).subscribe(() => {
                this.router.navigate(['/rec-ueb']);
            });
        } else {
            this.service.update(this.item).subscribe(() => {
                this.router.navigate(['/rec-ueb']);
            });
        }
    }

    delete(): void {
        if (confirm('Wirklich löschen?')) {
            const params = {
                BASIS_VERSION: this.item.BASIS_VERSION,
                BEREICH_NR: this.item.BEREICH_NR,
                ONR_TYP_NR: this.item.ONR_TYP_NR,
                ORT_NR: this.item.ORT_NR,
                UEB_ZIEL_TYP: this.item.UEB_ZIEL_TYP,
                UEB_ZIEL: this.item.UEB_ZIEL
            };
            this.service.delete(params).subscribe(() => {
                this.router.navigate(['/rec-ueb']);
            });
        }
    }

    addFzt(): void {
        if (!this.item.uebFzts) this.item.uebFzts = [];
        this.item.uebFzts.push({ ...this.newFzt, BASIS_VERSION: this.item.BASIS_VERSION });
    }

    removeFzt(index: number): void {
        this.item.uebFzts?.splice(index, 1);
    }
}
