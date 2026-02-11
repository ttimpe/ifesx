import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecUmlauf } from '../models/rec-umlauf.model';
import { RecUms } from '../models/rec-ums.model';

@Injectable({
    providedIn: 'root'
})
export class RecUmlaufService {
    private apiUrl = '/api/vdv/blocks';
    private piecesUrl = '/api/vdv/block-pieces';

    constructor(private http: HttpClient) { }

    getAll(basisVersion?: number): Observable<RecUmlauf[]> {
        let url = this.apiUrl;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<RecUmlauf[]>(url);
    }

    getOne(params: any): Observable<RecUmlauf> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                httpParams = httpParams.set(key, params[key]);
            }
        });
        return this.http.get<RecUmlauf>(`${this.apiUrl}/detail`, { params: httpParams });
    }

    create(item: RecUmlauf): Observable<RecUmlauf> {
        return this.http.post<RecUmlauf>(this.apiUrl, item);
    }

    update(item: RecUmlauf): Observable<RecUmlauf> {
        return this.http.put<RecUmlauf>(this.apiUrl, item);
    }

    delete(basisVersion: number, tagesartNr: number, umUid: number): Observable<void> {
        return this.http.delete<void>(this.apiUrl, {
            params: {
                BASIS_VERSION: basisVersion.toString(),
                TAGESART_NR: tagesartNr.toString(),
                UM_UID: umUid.toString()
            }
        });
    }

    getAllUms(): Observable<RecUms[]> {
        return this.http.get<RecUms[]>(this.piecesUrl);
    }

    getOrphanTrips(basisVersion: number, tagesartNr?: number, liNr?: number): Observable<import('../models/rec-frt.model').RecFrt[]> {
        let params = new HttpParams().set('basisVersion', basisVersion.toString());
        if (tagesartNr) params = params.set('tagesartNr', tagesartNr.toString());
        if (liNr) params = params.set('liNr', liNr.toString());

        return this.http.get<import('../models/rec-frt.model').RecFrt[]>('/api/vdv/rec-frt/orphans', { params });
    }

    setKursNr(basisVersion: number, tagesartNr: number, umUid: number, kursNr: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/set-kurs`, {
            BASIS_VERSION: basisVersion,
            TAGESART_NR: tagesartNr,
            UM_UID: umUid,
            LI_KU_NR: kursNr
        });
    }
}

