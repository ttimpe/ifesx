import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Einzelanschluss, RecUms } from '../models/connection.model';

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    private apiUrl = '/api/vdv/connections';

    constructor(private http: HttpClient) { }

    getAll(basisVersion: number = 1): Observable<Einzelanschluss[]> {
        return this.http.get<Einzelanschluss[]>(`${this.apiUrl}?basisVersion=${basisVersion}`);
    }

    getOne(einanNr: number, basisVersion: number = 1): Observable<Einzelanschluss> {
        return this.http.get<Einzelanschluss>(`${this.apiUrl}/${einanNr}?basisVersion=${basisVersion}`);
    }

    create(connection: Einzelanschluss): Observable<Einzelanschluss> {
        return this.http.post<Einzelanschluss>(this.apiUrl, connection);
    }

    update(connection: Einzelanschluss): Observable<Einzelanschluss> {
        return this.http.put<Einzelanschluss>(`${this.apiUrl}/${connection.EINAN_NR}`, connection);
    }

    delete(einanNr: number, basisVersion: number = 1): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${einanNr}?basisVersion=${basisVersion}`);
    }

    // UMS
    addUms(ums: RecUms): Observable<RecUms> {
        return this.http.post<RecUms>(`${this.apiUrl}/ums`, ums);
    }

    deleteUms(einanNr: number, tagesartNr: number, beginn: number, ende: number, basisVersion: number = 1): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${einanNr}/ums/${tagesartNr}/${beginn}/${ende}?basisVersion=${basisVersion}`);
    }
}
