import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MengeFgrService } from '../../services/menge-fgr.service';
import { MengeFgr } from '../../models/menge-fgr.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-rec-fgr-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TooltipModule
    ],
    templateUrl: './rec-fgr-detail.component.html'
})
export class RecFgrDetailComponent implements OnInit {
    model: MengeFgr = {
        BASIS_VERSION: 1,
        FGR_NR: 0,
        STR_FGR: '',
        FGR_TEXT: ''
    };
    isNew = true;

    constructor(
        private service: MengeFgrService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (this.router.url.includes('/new')) {
            this.isNew = true;
        } else {
            this.isNew = false;
            const paramId = this.route.snapshot.paramMap.get('id');
            if (paramId) {
                this.load(parseInt(paramId));
            }
        }
    }

    load(id: number) {
        this.service.getById(id).subscribe(data => {
            this.model = data;
        });
    }

    save() {
        if (this.isNew) {
            this.service.create(this.model).subscribe(() => this.router.navigate(['/rec-fgr']));
        } else {
            this.service.update(this.model.FGR_NR, this.model).subscribe(() => this.router.navigate(['/rec-fgr']));
        }
    }

    delete() {
        if (confirm('Wirklich löschen?')) {
            this.service.delete(this.model.FGR_NR).subscribe(() => this.router.navigate(['/rec-fgr']));
        }
    }
}
