import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MengeFzgTyp } from '../models/menge-fzg-typ.model';
import { Fahrzeug } from '../models/fahrzeug.model';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {

    private apiUrlType = '/api/vdv/rec-fzg-typ';
    private apiUrlVehicle = '/api/vdv/rec-fzg';

    constructor(private http: HttpClient) { }

    // --- Types ---
    getAllTypes(basisVersion?: number): Observable<MengeFzgTyp[]> {
        let url = this.apiUrlType;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<MengeFzgTyp[]>(url);
    }

    createType(type: MengeFzgTyp): Observable<MengeFzgTyp> {
        return this.http.post<MengeFzgTyp>(this.apiUrlType, type);
    }

    updateType(id: number, type: MengeFzgTyp): Observable<MengeFzgTyp> {
        return this.http.put<MengeFzgTyp>(`${this.apiUrlType}/${id}`, type);
    }

    deleteType(id: number, basisVersion?: number): Observable<any> {
        let url = `${this.apiUrlType}/${id}`;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.delete(url);
    }

    // --- Vehicles ---
    getAllVehicles(basisVersion?: number): Observable<Fahrzeug[]> {
        let url = this.apiUrlVehicle;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<Fahrzeug[]>(url);
    }

    createVehicle(vehicle: Fahrzeug): Observable<Fahrzeug> {
        return this.http.post<Fahrzeug>(this.apiUrlVehicle, vehicle);
    }

    getVehicle(id: number, basisVersion?: number): Observable<Fahrzeug> {
        let url = `${this.apiUrlVehicle}/${id}`;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.get<Fahrzeug>(url);
    }

    updateVehicle(id: number, vehicle: Fahrzeug): Observable<Fahrzeug> {
        return this.http.put<Fahrzeug>(`${this.apiUrlVehicle}/${id}`, vehicle);
    }

    deleteVehicle(id: number, basisVersion?: number): Observable<any> {
        let url = `${this.apiUrlVehicle}/${id}`;
        if (basisVersion) {
            url += `?basisVersion=${basisVersion}`;
        }
        return this.http.delete(url);
    }

    batchCreateVehicles(params: {
        startNumber: number;
        count: number;
        fzgTypNr: number;
        polkennPrefix?: string;
        basisVersion?: number;
    }): Observable<Fahrzeug[]> {
        return this.http.post<Fahrzeug[]>(`${this.apiUrlVehicle}/batch`, params);
    }
}
