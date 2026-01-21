import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecAnr } from '../../models/rec-anr.model';
import { RecAnrService } from '../../services/rec-anr.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
    selector: 'app-rec-anr-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, CardModule, InputTextarea],
    templateUrl: './rec-anr-detail.component.html',
    styleUrls: ['./rec-anr-detail.component.css']
})
export class RecAnrDetailComponent implements OnInit {
    item: RecAnr = new RecAnr();
    isNew = true;


    constructor(
        private service: RecAnrService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isNew = false;
            this.service.getById(+id).subscribe(data => {
                this.item = data;
            });
        }
    }

    save(): void {
        if (this.isNew) {
            this.service.create(this.item).subscribe(() => {
                this.router.navigate(['/rec-anr']);
            });
        } else {
            this.service.update(this.item.ANR_NR, this.item).subscribe(() => {
                this.router.navigate(['/rec-anr']);
            });
        }
    }

    delete(): void {
        if (confirm('Wirklich löschen?')) {
            this.service.delete(this.item.ANR_NR).subscribe(() => {
                this.router.navigate(['/rec-anr']);
            });
        }
    }
}
