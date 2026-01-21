// stop.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import map from the RxJS operators
import { Stop } from '../models/stop.model';

@Injectable({
  providedIn: 'root'
})
export class StopService {
  private apiUrl = '/api'; // Update with your API URL

  constructor(private http: HttpClient) { }

  getAllStops(basisVersion?: number): Observable<Stop[]> {
    let url = `${this.apiUrl}/stops`;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<Stop[]>(url);
  }

  getStopById(id: string): Observable<Stop> {
    const url = `${this.apiUrl}/stops/${id}`;
    return this.http.get<Stop>(url);
  }
  getStopsByCode(code: string): Observable<Stop[]> {
    const url = `${this.apiUrl}/stops/search/${code}`;
    return this.http.get<Stop[]>(url);
  }


  searchStopsByName(name: string): Observable<Stop[]> {
    const url = `${this.apiUrl}/stops/find/${name}`;
    return this.http.get<Stop[]>(url);
  }
  updateStop(stop: Stop): Observable<Stop> {
    const url = `${this.apiUrl}/stops/${stop.id}`;
    return this.http.put<Stop>(url, stop);
  }

  // VDV Methods
  getAllRecOrts(query: string = '', basisVersion?: number): Observable<any[]> {
    let url = `${this.apiUrl}/vdv/orte?query=${query}`;
    if (basisVersion) {
      url += `&basisVersion=${basisVersion}`;
    }
    return this.http.get<any[]>(url);
  }

  getRecOrtById(ortNr: number, basisVersion?: number): Observable<any> {
    let url = `${this.apiUrl}/vdv/orte/${ortNr}`;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<any>(url);
  }

  createRecOrt(data: any): Observable<any> {
    const url = `${this.apiUrl}/vdv/orte`;
    return this.http.post<any>(url, data);
  }

  updateRecOrt(ortNr: number, data: any): Observable<any> {
    // Update might need composite key too? Usually PUT /:id is enough if body has keys, 
    // but better be safe. For now using just URL param + body.
    const url = `${this.apiUrl}/vdv/orte/${ortNr}`;
    return this.http.put<any>(url, data);
  }

  deleteRecOrt(ortNr: number): Observable<void> {
    const url = `${this.apiUrl}/vdv/orte/${ortNr}`;
    return this.http.delete<void>(url);
  }

  // RecHp Methods
  createRecHp(hp: any): Observable<any> {
    const url = `${this.apiUrl}/vdv/haltepunkte`;
    return this.http.post<any>(url, hp);
  }

  updateRecHp(hp: any): Observable<any> {
    // Composite key update usually needs identification. 
    // Assuming backend endpoint /vdv/haltepunkte/:ortNr/:hpNr or similar, 
    // OR just PUT /vdv/haltepunkte if body has keys.
    // Let's assume body keys are sufficient for a specific PUT or we use a query based update.
    // For safety, let's use the POST (create/update) or specific URL if known. 
    // Since I don't have the backend router for HPs handy, I'll guess standard REST or use POST for "upsert" if supported, 
    // or assume /vdv/haltepunkte/:ortNr/:hpNr
    const url = `${this.apiUrl}/vdv/haltepunkte/${hp.ORT_NR}/${hp.HALTEPUNKT_NR}`;
    return this.http.put<any>(url, hp);
  }

  deleteRecHp(ortNr: number, hpNr: number): Observable<void> {
    const url = `${this.apiUrl}/vdv/haltepunkte/${ortNr}/${hpNr}`;
    return this.http.delete<void>(url);
  }

  // Group Management
  getGroupDetails(refId: number, basisVersion?: number): Observable<any> {
    let url = `${this.apiUrl}/vdv/orte/groups/${refId}`;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<any>(url);
  }

  updateGroup(refId: number, data: any, basisVersion?: number): Observable<any> {
    let url = `${this.apiUrl}/vdv/orte/groups/${refId}`;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.put<any>(url, data);
  }
}

