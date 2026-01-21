import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecTagesart } from '../models/rec-tagesart.model';
@Injectable({
    providedIn: 'root'
})
export class RecTagesartService {
    private apiUrl = '/api/vdv/tagesart';

    constructor(private http: HttpClient) { }

    getOne(filter: { TAGESART_NR: number }) {
        return this.http.get<RecTagesart>(`${this.apiUrl}/${filter.TAGESART_NR}`);
    }
}
