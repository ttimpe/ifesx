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
        // VDV usually updates by deleting/re-creating or using composite key. 
        // For now, assuming UM_UID is unique enough for update if backend supports it.
        // Or pass full obj.
        return this.http.put<RecUmlauf>(`${this.apiUrl}/${item.UM_UID}`, item);
    }

    delete(umUid: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${umUid}`);
    }

    getAllUms(): Observable<RecUms[]> {
        return this.http.get<RecUms[]>(this.piecesUrl);
    }
}
