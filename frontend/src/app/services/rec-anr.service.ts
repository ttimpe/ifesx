import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecAnr } from '../models/rec-anr.model';

@Injectable({
    providedIn: 'root'
})
export class RecAnrService {
    private apiUrl = '/api/vdv/rec-anr';

    constructor(private http: HttpClient) { }

    getAll(): Observable<RecAnr[]> {
        return this.http.get<RecAnr[]>(this.apiUrl);
    }

    getById(id: number): Observable<RecAnr> {
        return this.http.get<RecAnr>(`${this.apiUrl}/${id}`);
    }

    create(item: RecAnr): Observable<RecAnr> {
        return this.http.post<RecAnr>(this.apiUrl, item);
    }

    update(id: number, item: RecAnr): Observable<RecAnr> {
        return this.http.put<RecAnr>(`${this.apiUrl}/${id}`, item);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
