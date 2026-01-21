import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecOm } from '../models/rec-om.model';

@Injectable({
    providedIn: 'root'
})
export class RecOmService {

    private apiUrl = '/api/vdv/ortsmarken';

    constructor(private http: HttpClient) { }

    getAll(basisVersion?: number): Observable<RecOm[]> {
        let url = this.apiUrl;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<RecOm[]>(url);
    }

    getById(id: number): Observable<RecOm> {
        return this.http.get<RecOm>(`${this.apiUrl}/${id}`);
    }

    create(om: RecOm): Observable<RecOm> {
        return this.http.post<RecOm>(this.apiUrl, om);
    }

    update(om: RecOm): Observable<RecOm> {
        return this.http.put<RecOm>(`${this.apiUrl}/${om.id}`, om);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
