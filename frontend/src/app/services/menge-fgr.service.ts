import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MengeFgr } from '../models/menge-fgr.model';

@Injectable({
    providedIn: 'root'
})
export class MengeFgrService {
    private baseUrl = '/api/vdv/menge-fgr';

    constructor(private http: HttpClient) { }

    getAll(): Observable<MengeFgr[]> {
        return this.http.get<MengeFgr[]>(this.baseUrl);
    }

    getById(id: number): Observable<MengeFgr> {
        return this.http.get<MengeFgr>(`${this.baseUrl}/${id}`);
    }

    create(item: MengeFgr): Observable<MengeFgr> {
        return this.http.post<MengeFgr>(this.baseUrl, item);
    }

    update(id: number, item: MengeFgr): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, item);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
