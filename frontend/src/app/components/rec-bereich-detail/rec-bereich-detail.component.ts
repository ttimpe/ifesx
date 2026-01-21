import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MengeBereichService } from '../../services/menge-bereich.service';
import { MengeBereich } from '../../models/menge-bereich.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-rec-bereich-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CardModule
  ],
  templateUrl: './rec-bereich-detail.component.html',
  styleUrl: './rec-bereich-detail.component.css'
})
export class RecBereichDetailComponent implements OnInit {
  model: MengeBereich = {
    BASIS_VERSION: 1,
    BEREICH_NR: 0,
    STR_BEREICH: '',
    BEREICH_TEXT: ''
  };
  isNew = true;

  constructor(
    private service: MengeBereichService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Or use query param/routing logic based on app.routes
    // Wait, routes are setup as: 'rec-bereich/detail' (likely query param) OR 'rec-bereich/:id' ? 
    // Let's check app.routes.ts again. 
    // It is: { path: 'rec-bereich/detail', component: RecBereichDetailComponent } -> Usually uses query params for id?
    // AND: { path: 'rec-bereich/new', component: RecBereichDetailComponent }

    // In RecBereichList I used: [routerLink]="['/rec-bereich', row.BEREICH_NR]"
    // BUT in app.routes.ts I didn't see a ':id' route for 'rec-bereich/:id'.
    // I added: { path: 'rec-bereich/detail', component: RecBereichDetailComponent }
    // I should fix app.routes.ts to have 'rec-bereich/:id' OR adapt here.
    // I will Assume I'll fix app.routes.ts or use the one I added. 
    // Actually I added: { path: 'rec-bereich/detail', component: RecBereichDetailComponent }
    // This looks like I intended to use it as a detail route, but without :id parameter in path definition it won't match '/rec-bereich/123'. 
    // I should probably use a param route or check how other components do it.
    // Most use /:id.

    // Quick fix: I will assume the route has :id parameter or I'll implement handling for it.
    // The list uses ['/rec-bereich', row.BEREICH_NR]. This constructs /rec-bereich/123.
    // So I need a route for 'rec-bereich/:id'.
    // In app.routes.ts I currently have:
    // { path: 'rec-bereich', component: RecBereichListComponent },
    // { path: 'rec-bereich/detail', component: RecBereichDetailComponent }, 
    // { path: 'rec-bereich/new', component: RecBereichDetailComponent },

    // I should update app.routes.ts to include { path: 'rec-bereich/:id', component: RecBereichDetailComponent } BEFORE 'detail' or instead of it.
    // I'll handle that next. For now, I'll code this component to expect an ID param.

    if (this.router.url.includes('/new')) {
      this.isNew = true;
    } else {
      this.isNew = false;
      // Try to get ID from param map (if route configured)
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
      this.service.create(this.model).subscribe(() => this.router.navigate(['/rec-bereich']));
    } else {
      this.service.update(this.model.BEREICH_NR, this.model).subscribe(() => this.router.navigate(['/rec-bereich']));
    }
  }

  delete() {
    if (confirm('Wirklich löschen?')) {
      this.service.delete(this.model.BEREICH_NR).subscribe(() => this.router.navigate(['/rec-bereich']));
    }
  }
}
