import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecSelZp } from '../models/rec-sel-zp.model';

@Injectable({
    providedIn: 'root'
})
export class RecSelZpService {
    private apiUrl = '/api/vdv/rec-sel-zp';

    constructor(private http: HttpClient) { }

    getAll(basisVersion?: number): Observable<RecSelZp[]> {
        const url = basisVersion ? `${this.apiUrl}?basisVersion=${basisVersion}` : this.apiUrl;
        return this.http.get<RecSelZp[]>(url);
    }

    getBySection(ortNr: number, selZiel: number): Observable<RecSelZp[]> {
        return this.http.get<RecSelZp[]>(`${this.apiUrl}/${ortNr}/${selZiel}`);
    }

    create(zp: RecSelZp): Observable<RecSelZp> {
        return this.http.post<RecSelZp>(this.apiUrl, zp);
    }

    update(zp: RecSelZp): Observable<RecSelZp> {
        return this.http.put<RecSelZp>(this.apiUrl, zp);
    }

    delete(zp: RecSelZp): Observable<void> {
        return this.http.request<void>('delete', this.apiUrl, { body: zp });
    }
}
