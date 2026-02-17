import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecFrt } from '../../models/rec-frt.model';
import { RecLid } from '../../models/line.model';
import { RecFrtService } from '../../services/rec-frt.service';
import { CalendarService } from '../../services/calendar.service';
import { LineService } from '../../services/line.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { Button } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-rec-frt-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        Button,
        InputNumberModule,
        DropdownModule,
        InputText
    ],
    templateUrl: './rec-frt-detail.component.html',
    styleUrls: ['./rec-frt-detail.component.css']
})
export class RecFrtDetailComponent implements OnInit {
    item: RecFrt = new RecFrt();
    isNew: boolean = true;
    selectedBasisVersion: number = 1;

    // For dropdowns
    lines: { label: string, value: number }[] = [];
    variants: { label: string, value: string }[] = [];
    fahrtarten = [
        { label: 'Regelfahrt', value: 1 },
        { label: 'Ausrückfahrt', value: 2 },
        { label: 'Einrückfahrt', value: 3 },
        { label: 'Werkstattfahrt', value: 4 },
        { label: 'Betriebsfahrt', value: 5 }
    ];

    // Time input
    startHours: number = 0;
    startMinutes: number = 0;

    constructor(
        private service: RecFrtService,
        private lineService: LineService,
        private calendarService: CalendarService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedBasisVersion = version || 1;
            this.loadLines();
        });

        this.route.params.subscribe(params => {
            const basisVersion = params['basisVersion'];
            const frtFid = params['frtFid'];

            if (basisVersion && frtFid) {
                this.isNew = false;
                this.service.getByCompositeKey(+basisVersion, +frtFid).subscribe(data => {
                    this.item = data;
                    this.parseTime();
                    this.loadVariants();
                });
            } else {
                this.isNew = true;
                this.item = new RecFrt();
                this.item.BASIS_VERSION = this.selectedBasisVersion;
                this.item.FAHRTART_NR = 1;
                // Get next FID
                this.service.getNextFrtFid(this.selectedBasisVersion).subscribe(resp => {
                    this.item.FRT_FID = resp.nextFrtFid;
                });
            }
        });
    }

    loadLines(): void {
        this.lineService.getLines(this.selectedBasisVersion).subscribe((lines: RecLid[]) => {
            this.lines = lines.map(l => ({
                label: `${l.LI_NR} - ${l.LI_KUERZEL || l.LIDNAME || ''}`,
                value: l.LI_NR
            }));
        });
    }

    loadVariants(): void {
        if (!this.item.LI_NR) {
            this.variants = [];
            return;
        }
        this.lineService.getLineVariants(this.item.LI_NR, this.selectedBasisVersion).subscribe((variants: RecLid[]) => {
            if (variants) {
                this.variants = variants.map((v: RecLid) => ({
                    label: `${v.STR_LI_VAR} - ${v.LIDNAME || ''}`,
                    value: v.STR_LI_VAR
                }));
            }
        });
    }

    onLineChange(): void {
        this.item.STR_LI_VAR = undefined;
        this.loadVariants();
    }

    parseTime(): void {
        const start = this.item.FRT_START || 0;
        this.startHours = Math.floor(start / 3600);
        this.startMinutes = Math.floor((start % 3600) / 60);
    }

    updateTime(): void {
        this.item.FRT_START = (this.startHours * 3600) + (this.startMinutes * 60);
    }

    save(): void {
        this.updateTime();
        this.item.BASIS_VERSION = this.selectedBasisVersion;

        if (this.isNew) {
            this.service.create(this.item).subscribe(() => {
                this.router.navigate(['/rec-frt']);
            });
        } else {
            this.service.update(this.item).subscribe(() => {
                this.router.navigate(['/rec-frt']);
            });
        }
    }
}
