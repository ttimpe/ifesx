import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Einzelanschluss, RecUms } from '../../models/connection.model';
import { ConnectionService } from '../../services/connection.service';
import { StopService } from '../../services/stop.service';
import { RecOrt } from '../../models/rec-ort.model';
import { CalendarService } from '../../services/calendar.service';
import { Tagesart } from '../../models/tagesart.model';
import { LineService } from '../../services/line.service';
import { RecLid } from '../../models/line.model';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-connection-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule,
        InputTextModule, InputNumberModule, ButtonModule, DropdownModule, CardModule, TableModule],
    templateUrl: './connection-detail.component.html',
    styleUrls: ['./connection-detail.component.css']
})
export class ConnectionDetailComponent implements OnInit {
    item: Einzelanschluss = this.getEmptyConnection();
    isNew = true;

    stops: RecOrt[] = [];
    lines: RecLid[] = [];
    tagesarten: Tagesart[] = [];

    // New UMS Form
    newUms: RecUms = {
        BASIS_VERSION: 1,
        TAGESART_NR: 1,
        UMS_BEGINN: 0,
        UMS_ENDE: 86400,
        UMS_MIN: 60,
        UMS_MAX: 180,
        MAX_VERZ_MAN: 300,
        MAX_VERZ_AUTO: 300
    };

    directionOptions = [
        { label: 'Hin (1)', value: 1 },
        { label: 'Rück (2)', value: 2 }
    ];

    constructor(
        private service: ConnectionService,
        private stopService: StopService,
        private calendarService: CalendarService,
        private lineService: LineService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadMetadata();

        // Check mode
        if (this.router.url.includes('/new')) {
            this.isNew = true;
            this.item = this.getEmptyConnection();
        } else {
            this.route.params.subscribe(params => {
                if (params['id']) {
                    this.isNew = false;
                    this.service.getOne(params['id']).subscribe(data => {
                        this.item = data;
                        if (!this.item.recUms) this.item.recUms = [];
                        this.newUms.EINAN_NR = this.item.EINAN_NR;
                    });
                }
            });
        }
    }

    loadMetadata() {
        this.stopService.getAllRecOrts().subscribe(s => this.stops = s);
        this.lineService.getLines().subscribe(l => this.lines = l);
        this.calendarService.getTagesarten().subscribe(t => this.tagesarten = t);
    }

    getEmptyConnection(): Einzelanschluss {
        return {
            BASIS_VERSION: 1,
            LEITSTELLENKENNUNG: 0,
            ZUB_LI_NR: 0,
            ZUB_LI_RI_NR: 1,
            ZUB_ORT_REF_ORT: 0,
            ABB_LI_NR: 0,
            ABB_LI_RI_NR: 1,
            ABB_ORT_REF_ORT: 0,
            recUms: []
        };
    }

    save() {
        if (this.isNew) {
            this.service.create(this.item).subscribe(res => {
                this.router.navigate(['/connections', res.EINAN_NR]);
            });
        } else {
            this.service.update(this.item).subscribe(() => {
                // Success toast?
            });
        }
    }

    delete() {
        if (confirm('Anschluss und alle Regeln löschen?')) {
            this.service.delete(this.item.EINAN_NR!).subscribe(() => {
                this.router.navigate(['/connections']);
            });
        }
    }

    // --- UMS Interface ---
    addUms() {
        if (!this.item.EINAN_NR) return; // Must save connection first

        this.newUms.EINAN_NR = this.item.EINAN_NR;
        this.newUms.BASIS_VERSION = this.item.BASIS_VERSION;

        this.service.addUms(this.newUms).subscribe(ums => {
            this.item.recUms?.push(ums);
            // Reset logic?
        });
    }

    removeUms(ums: RecUms, index: number) {
        if (this.item.EINAN_NR && ums.TAGESART_NR) {
            this.service.deleteUms(
                this.item.EINAN_NR,
                ums.TAGESART_NR,
                ums.UMS_BEGINN,
                ums.UMS_ENDE,
                this.item.BASIS_VERSION
            ).subscribe(() => {
                this.item.recUms?.splice(index, 1);
            });
        }
    }
}
