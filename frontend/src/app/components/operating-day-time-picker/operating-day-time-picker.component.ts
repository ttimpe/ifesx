import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operating-day-time-picker',
  templateUrl: './operating-day-time-picker.component.html',
  styleUrls: ['./operating-day-time-picker.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class OperatingDayTimePickerComponent implements OnChanges {


  private secondsToTimeString(totalSeconds: number) {
    if (totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad with leading zeros if needed
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
      return ''
    }
}

private timeStringToSeconds(timeString: string) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}
  @Input() time: number = 0;

  timeText: string = '00:00:00'

  @Output() timeChange:EventEmitter<any> = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['time']) {
      // Convert int to text
      this.timeText = this.secondsToTimeString(changes['time'].currentValue)



    }
  }

  onTextChanged(text: string) {
    console.log('text changed')
    // TOD: validate input data
    if (text.length == 8) {

      let timeOffsetInSeconds = this.timeStringToSeconds(text)
      console.log('offset: ', timeOffsetInSeconds)
      this.timeChange.emit(timeOffsetInSeconds)


    }

  }
}
