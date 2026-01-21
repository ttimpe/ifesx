import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecFrt } from '../models/rec-frt.model';

@Injectable({
    providedIn: 'root'
})
export class RecFrtService {

    private apiUrl = '/api/vdv/rec-frt';

    constructor(private http: HttpClient) { }

    getAll(): Observable<RecFrt[]> {
        return this.http.get<RecFrt[]>(this.apiUrl);
    }

    getByUmlauf(umUid: number, tagesartNr?: number): Observable<RecFrt[]> {
        let url = `${this.apiUrl}/by-umlauf/${umUid}`;
        if (tagesartNr) url += `?tagesartNr=${tagesartNr}`;
        return this.http.get<RecFrt[]>(url);
    }

    getByCompositeKey(basisVersion: number, frtFid: number): Observable<RecFrt> {
        return this.http.get<RecFrt>(`${this.apiUrl}/${basisVersion}/${frtFid}`);
    }

    getNextFrtFid(basisVersion: number = 1): Observable<{ nextFrtFid: number }> {
        return this.http.get<{ nextFrtFid: number }>(`${this.apiUrl}/next-fid/${basisVersion}`);
    }

    create(frt: RecFrt): Observable<RecFrt> {
        return this.http.post<RecFrt>(this.apiUrl, frt);
    }

    update(frt: RecFrt): Observable<any> {
        return this.http.put(`${this.apiUrl}/${frt.BASIS_VERSION}/${frt.FRT_FID}`, frt);
    }

    delete(basisVersion: number, frtFid: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${basisVersion}/${frtFid}`);
    }
}
