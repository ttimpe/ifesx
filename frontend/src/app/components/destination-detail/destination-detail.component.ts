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
  seitenTextLines: string[] = ['', '', '', ''];

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
            this.seitenTextLines = [
              lines[0] || '',
              lines[1] || '',
              lines[2] || '',
              lines[3] || ''
            ];
          } else {
            this.seitenTextLines = ['', '', '', ''];
          }
        },
        error: (error) => {
          console.error('Error fetching destination:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Ziel konnte nicht geladen werden.' });
        }
      });
    }
  }

  saveDestination() {
    if (this.destination && this.destination.ZNR_NR) {
      // Join seitenTextLines with \n
      this.destination.SEITENTEXT = this.seitenTextLines.join('\n');

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
