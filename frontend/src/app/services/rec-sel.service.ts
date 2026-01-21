import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecSel } from '../models/rec-sel.model';

@Injectable({
    providedIn: 'root'
})
export class RecSelService {

    private apiUrl = '/api/vdv/rec-sel';

    constructor(private http: HttpClient) { }

    getAll(basisVersion?: number): Observable<RecSel[]> {
        let url = this.apiUrl;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<RecSel[]>(url);
    }

    getById(id: number): Observable<RecSel> {
        return this.http.get<RecSel>(`${this.apiUrl}/${id}`);
    }

    // Get by VDV composite key: ORT_NR + SEL_ZIEL
    getByCompositeKey(ortNr: number, selZiel: number, basisVersion: number = 1): Observable<RecSel> {
        return this.http.get<RecSel>(`${this.apiUrl}/${ortNr}/${selZiel}?basisVersion=${basisVersion}`);
    }

    create(sel: RecSel): Observable<RecSel> {
        return this.http.post<RecSel>(this.apiUrl, sel);
    }

    update(sel: RecSel): Observable<RecSel> {
        // basisVersion should be in 'sel' object or passed as query. 
        // For safety, pass as query too if likely to change context? 
        // Actually body has BASIS_VERSION, but controller checks body || query. 
        // Let's rely on body being correct from frontend model, but append query just in case for PK identification.
        const version = sel.BASIS_VERSION || 1;
        return this.http.put<RecSel>(`${this.apiUrl}/${sel.ORT_NR}/${sel.SEL_ZIEL}?basisVersion=${version}`, sel);
    }

    delete(ortNr: number, selZiel: number, basisVersion: number = 1): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${ortNr}/${selZiel}?basisVersion=${basisVersion}`);
    }
}

