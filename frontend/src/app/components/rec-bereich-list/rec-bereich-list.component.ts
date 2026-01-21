
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MengeBereichService } from '../../services/menge-bereich.service';
import { MengeBereich } from '../../models/menge-bereich.model';
import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-rec-bereich-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, Button, InputText],
  templateUrl: './rec-bereich-list.component.html',
  styleUrl: './rec-bereich-list.component.css'
})
export class RecBereichListComponent implements OnInit {
  rows: MengeBereich[] = [];
  loadingIndicator = true;

  @ViewChild('dt') dt: Table | undefined;

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  constructor(private service: MengeBereichService) { }

  ngOnInit(): void {
    this.title = 'Bereiche (MENGE_BEREICH)'; // Set dynamically if titlebar supports it, or just use hardcoded in template
    this.loadData();
  }

  title = 'Bereiche (MENGE_BEREICH)';

  loadData() {
    this.loadingIndicator = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.rows = data;
        this.loadingIndicator = false;
      },
      error: (err) => {
        console.error('Error loading MengeBereich', err);
        this.loadingIndicator = false;
      }
    });
  }
}
