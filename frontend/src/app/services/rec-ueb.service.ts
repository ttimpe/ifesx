import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecUeb } from '../models/rec-ueb.model';

@Injectable({
    providedIn: 'root'
})
export class RecUebService {
    private apiUrl = '/api/vdv/transfers';

    constructor(private http: HttpClient) { }

    getAll(): Observable<RecUeb[]> {
        return this.http.get<RecUeb[]>(this.apiUrl);
    }

    getOne(params: any): Observable<RecUeb> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                httpParams = httpParams.set(key, params[key]);
            }
        });
        return this.http.get<RecUeb>(`${this.apiUrl}/detail`, { params: httpParams });
    }

    create(item: RecUeb): Observable<RecUeb> {
        return this.http.post<RecUeb>(this.apiUrl, item);
    }

    update(item: RecUeb): Observable<any> {
        return this.http.put<any>(this.apiUrl, item);
    }

    delete(params: any): Observable<void> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            httpParams = httpParams.set(key, params[key]);
        });
        return this.http.delete<void>(this.apiUrl, { params: httpParams });
    }
}
