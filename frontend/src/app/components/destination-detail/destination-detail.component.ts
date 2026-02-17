import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { RecZnr } from '../../models/destination.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


// PrimeNG
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-destination-detail',
  templateUrl: './destination-detail.component.html',
  styleUrls: ['./destination-detail.component.css'],
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    Button,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule
  ]
})
export class DestinationDetailComponent implements OnInit {
  destination: RecZnr = {} as RecZnr;
  isNew: boolean = true;
  seitenTextBlocks: { line1: string, line2: string }[] = [{ line1: '', line2: '' }];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadDestination();
  }

  private loadDestination(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'add') {
      this.isNew = false;
      this.destinationService.getDestinationById(Number(id)).subscribe({
        next: (destination) => {
          this.destination = destination;
          if (this.destination.SEITENTEXT) {
            const lines = this.destination.SEITENTEXT.split('\n');
            this.seitenTextBlocks = [];
            // Parse lines in pairs
            for (let i = 0; i < lines.length; i += 2) {
              this.seitenTextBlocks.push({
                line1: lines[i] || '',
                line2: lines[i + 1] || ''
              });
            }
          } else {
            this.seitenTextBlocks = [{ line1: '', line2: '' }];
          }
        },
        error: (error) => {
          console.error('Error fetching destination:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Ziel konnte nicht geladen werden.' });
        }
      });
    }
  }

  addTakt() {
    this.seitenTextBlocks.push({ line1: '', line2: '' });
  }

  removeTakt(index: number) {
    if (this.seitenTextBlocks.length > 1) {
      this.seitenTextBlocks.splice(index, 1);
    } else {
      this.seitenTextBlocks[0] = { line1: '', line2: '' };
    }
  }

  moveTaktUp(index: number) {
    if (index > 0) {
      const temp = this.seitenTextBlocks[index];
      this.seitenTextBlocks[index] = this.seitenTextBlocks[index - 1];
      this.seitenTextBlocks[index - 1] = temp;
    }
  }

  moveTaktDown(index: number) {
    if (index < this.seitenTextBlocks.length - 1) {
      const temp = this.seitenTextBlocks[index];
      this.seitenTextBlocks[index] = this.seitenTextBlocks[index + 1];
      this.seitenTextBlocks[index + 1] = temp;
    }
  }

  saveDestination() {
    if (this.destination && this.destination.ZNR_NR) {
      // Join seitenTextBlocks into a single string with \n
      const lines: string[] = [];
      this.seitenTextBlocks.forEach(block => {
        lines.push(block.line1);
        lines.push(block.line2);
      });
      this.destination.SEITENTEXT = lines.join('\n');

      if (!this.isNew) {
        // Update
        this.destinationService.updateDestination(this.destination).subscribe({
          next: (updated) => {
            this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Ziel gespeichert!' });
            setTimeout(() => this.router.navigate(['/destinations']), 500);
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen.' });
          }
        });
      } else {
        // Create
        this.destinationService.createDestination(this.destination).subscribe({
          next: (created) => {
            this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Ziel erstellt!' });
            setTimeout(() => this.router.navigate(['/destinations']), 500);
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Erstellen fehlgeschlagen.' });
          }
        });
      }
    }
  }

  // TODO: Add delete method if needed
}
