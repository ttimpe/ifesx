import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MengeBereich } from '../models/menge-bereich.model';

@Injectable({
    providedIn: 'root'
})
export class MengeBereichService {
    private baseUrl = '/api/vdv/menge-bereich';

    constructor(private http: HttpClient) { }

    getAll(): Observable<MengeBereich[]> {
        return this.http.get<MengeBereich[]>(this.baseUrl);
    }

    getById(id: number): Observable<MengeBereich> {
        return this.http.get<MengeBereich>(`${this.baseUrl}/${id}`);
    }

    create(item: MengeBereich): Observable<MengeBereich> {
        return this.http.post<MengeBereich>(this.baseUrl, item);
    }

    update(id: number, item: MengeBereich): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, item);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}
