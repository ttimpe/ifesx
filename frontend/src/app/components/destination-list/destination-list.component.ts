import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../services/destination.service';
import { RecZnr } from '../../models/destination.model';
import { CalendarService } from '../../services/calendar.service';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-destination-list',
  templateUrl: './destination-list.component.html',
  styleUrls: ['./destination-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FontAwesomeModule,
    TableModule,
    Button,
    InputText,
    Tooltip
  ]
})
export class DestinationListComponent implements OnInit {
  destinations: RecZnr[] = [];
  selectedBasisVersion: number | undefined;
  loading: boolean = false;

  faLocationCrosshairs = faLocationCrosshairs;

  constructor(
    private destinationService: DestinationService,
    private router: Router,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedBasisVersion = version || undefined;
      this.loadDestinations();
    });
  }

  private loadDestinations(): void {
    this.loading = true;
    this.destinationService.getAllDestinations(this.selectedBasisVersion).subscribe({
      next: (destinations) => {
        this.destinations = destinations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching destinations:', error);
        this.loading = false;
      }
    });
  }

  deleteDestination(dest: RecZnr) {
    // TODO Implement delete
  }
}
