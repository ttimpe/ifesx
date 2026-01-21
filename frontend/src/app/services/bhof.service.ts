import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MengeBhof } from '../models/menge-bhof.model';

@Injectable({
    providedIn: 'root'
})
export class BhofService {
    private apiUrl = '/api/vdv/betriebshoefe';

    constructor(private http: HttpClient) { }

    getAll(basisVersion?: number): Observable<MengeBhof[]> {
        let params = new HttpParams();
        if (basisVersion !== undefined) {
            params = params.set('basisVersion', basisVersion.toString());
        }
        return this.http.get<MengeBhof[]>(this.apiUrl, { params });
    }

    getById(bhofNr: number, basisVersion: number = 1): Observable<MengeBhof> {
        return this.http.get<MengeBhof>(`${this.apiUrl}/${bhofNr}`, {
            params: { basisVersion: basisVersion.toString() }
        });
    }

    create(item: MengeBhof): Observable<MengeBhof> {
        return this.http.post<MengeBhof>(this.apiUrl, item);
    }

    update(bhofNr: number, item: MengeBhof, basisVersion: number = 1): Observable<MengeBhof> {
        return this.http.put<MengeBhof>(`${this.apiUrl}/${bhofNr}`, item, {
            params: { basisVersion: basisVersion.toString() }
        });
    }

    delete(bhofNr: number, basisVersion: number = 1): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${bhofNr}`, {
            params: { basisVersion: basisVersion.toString() }
        });
    }
}
