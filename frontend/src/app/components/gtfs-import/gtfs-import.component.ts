import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gtfs-import',
  templateUrl: './gtfs-import.component.html',
  styleUrls: ['./gtfs-import.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GtfsImportComponent {
  @Output() fileUploaded = new EventEmitter<File>();
  processing = false;
  result: string | null = null;

  constructor(private httpClient: HttpClient, private router: Router) { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

  }

  onDrop(event: any): void {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    this.uploadAndProcessFile(file)
  }

  onDragOver(event: any): void {
    event.preventDefault();
  }

  private uploadAndProcessFile(file: File): void {
    this.processing = true;

    // Create a FormData object and append the file to it
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (file.name == 'stopInfo.csv') {
      this.httpClient.post<any>('/api/import/stopInfo', formData).subscribe(
        (response) => {
          this.processing = false;
          this.result = response.message; // Adjust based on your backend response
          console.log('upload done')
        },
        (error) => {
          this.processing = false;
          console.error('Error uploading file:', error);
          this.result = 'Error processing file';
        }
      );
    } else {
      // Make a POST request to your backend API for file processing
      this.httpClient.post<any>('/api/import/gtfs', formData).subscribe(
        (response) => {
          this.processing = false;
          this.result = response.message; // Adjust based on your backend response
          console.log('upload done');
          this.router.navigate(['/calendar']);
        },
        (error) => {
          this.processing = false;
          console.error('Error uploading file:', error);
          this.result = 'Error processing file';
        }
      );
    }
  }
}
