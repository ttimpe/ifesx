import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayTime'
})
export class DayTimePipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);

    // Format to "HH:MM" by padding with zeros if necessary
    const formattedTime = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    return formattedTime;
  }

}
