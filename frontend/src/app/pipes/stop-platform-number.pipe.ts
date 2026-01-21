import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stopPlatformNumber',
  standalone: true
})
export class StopPlatformNumberPipe implements PipeTransform {

  transform(value: string): string {

     if (!value || value.trim().length === 0) {
      return value; // Return the original value for empty strings or strings with only whitespace
    }
    return value[value.length - 1];
  }

}
