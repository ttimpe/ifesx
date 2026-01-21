import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Stop } from 'src/app/models/stop.model';
import { StopService } from 'src/app/services/stop.service';

@Component({
  selector: 'app-stop-search-field',
  templateUrl: './stop-search-field.component.html',
  styleUrls: ['./stop-search-field.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class StopSearchFieldComponent {
  stopSearchTerm: string = ''; // Search term for stops
  availableStops: Stop[] = []
  selectedStop?: Stop
  @Output() onSelectStop = new EventEmitter<Stop>()

  @ViewChild('inputField', {read:ElementRef}) inputField!: ElementRef<HTMLInputElement>;

  constructor(private stopService: StopService) {

  }
  selectStop(stop: Stop) {
    this.selectedStop = stop
    this.onSelectStop.emit(stop)
    this.stopSearchTerm = ''
    this.availableStops = []
  }
  searchStops() {
    // Search stops based on the stopSearchTerm
    if (this.stopSearchTerm.length == 3 && this.stopSearchTerm.toUpperCase() == this.stopSearchTerm) {
      // direct code search
      this.stopService.getStopsByCode(this.stopSearchTerm).subscribe(stops => {
        this.selectedStop = stops[0]
        this.onSelectStop.emit(this.selectedStop)
        this.stopSearchTerm = ''
      });
    } else if (this.stopSearchTerm.length > 3) {
      this.availableStops = []
    this.stopService.searchStopsByName(this.stopSearchTerm).subscribe(stops => {
      this.availableStops = stops;
    });
    } else {
      console.log('why are we clearing here?')
      this.availableStops = []
    }
  }
}
