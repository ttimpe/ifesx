// destination.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecZnr } from '../models/destination.model';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private apiUrl = '/api/destinations';

  constructor(private http: HttpClient) { }

  getAllDestinations(basisVersion?: number): Observable<RecZnr[]> {
    let url = this.apiUrl;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<RecZnr[]>(url);
  }
  getDestinationById(id: number): Observable<RecZnr> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<RecZnr>(url);
  }

  createDestination(destination: RecZnr): Observable<RecZnr> {
    return this.http.post<RecZnr>(this.apiUrl, destination);
  }

  updateDestination(destination: RecZnr): Observable<RecZnr> {
    const url = `${this.apiUrl}/${destination.ZNR_NR}`;
    return this.http.put<RecZnr>(url, destination);
  }

  // Add other CRUD methods as needed
}
