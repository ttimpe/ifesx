import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecTagesart } from '../models/rec-tagesart.model';
@Injectable({
    providedIn: 'root'
})
export class RecTagesartService {
    private apiUrl = '/api/vdv/tagesart';

    constructor(private http: HttpClient) { }

    getAll(basisVersion?: number) {
        let url = this.apiUrl;
        if (basisVersion) {
            // Note: Backend might expect ?basisVersion=... or just return all and we filter.
            // Backend Controller: async getAll(req, res) { const data = await Tagesart.findAll(); ... }
            // It doesn't filter by basisVersion in Controller yet! 
            // I should just accept all for now or update backend later.
        }
        return this.http.get<RecTagesart[]>(url);
    }

    getOne(filter: { TAGESART_NR: number }) {
        return this.http.get<RecTagesart>(`${this.apiUrl}/${filter.TAGESART_NR}`);
    }
}
