import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecSelFztFeld } from '../models/rec-sel-fzt-feld.model';

@Injectable({
    providedIn: 'root'
})
export class RecSelFztFeldService {
    private baseUrl = '/api/vdv/rec-sel-fzt-feld';

    constructor(private http: HttpClient) { }

    // Get matrix entries for a specific area (Bereich)
    getByBereich(bereichNr: number, basisVersion?: number): Observable<RecSelFztFeld[]> {
        let url = `${this.baseUrl}/by-bereich/${bereichNr}`;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<RecSelFztFeld[]>(url);
    }

    // Update or create a single entry
    update(item: RecSelFztFeld): Observable<any> {
        return this.http.post(this.baseUrl, item);
    }
}
