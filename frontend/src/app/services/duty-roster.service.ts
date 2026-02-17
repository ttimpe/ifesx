import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MengeDienststueckart {
    BASIS_VERSION: number;
    DIENSTSTUECKART: string;
    DIENSTSTUECKART_TEXT?: string;
}

export interface MengeDienstart {
    BASIS_VERSION: number;
    DIENSTART_NR: number;
    DIENSTART_TEXT?: string;
}

// Minimal interfaces for now, extend as needed based on backend models
export interface RecEinzeldienst {
    BASIS_VERSION: number;
    EDB_VERSION: string;
    TAGESART_AUSWAHL: number;
    ED_NR: number;
    ANF_ORT?: number;
    END_ORT?: number;
    ED_ANF_ZEIT?: number;
    ED_END_ZEIT?: number;
    ED_DAUER?: number;
    DIENSTART_NR?: number;
    ED_LENK?: number;
    ED_PAUSE?: number;
    ED_VORB?: number;
    ED_NACHB?: number;
    [key: string]: any;
}

export interface RecDienststueck {
    BASIS_VERSION: number;
    TAGESART_AUSWAHL: number;
    EBD_VERSION: string;
    ED_NR: number;
    DST_ANF_ZEIT: number;
    ANF_ORT?: number;
    END_ORT?: number;
    DST_END_ZEIT?: number;
    DST_DAUER?: number;
    DIENSTSTUECKART_NR?: number;
    UM_UID?: number;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class DutyRosterService {
    private apiUrl = '/api/vdv/planning';

    constructor(private http: HttpClient) { }

    // --- Piece Types (MengeDienststueckart) ---

    getAllPieceTypes(): Observable<MengeDienststueckart[]> {
        return this.http.get<MengeDienststueckart[]>(`${this.apiUrl}/piece-types`);
    }

    createPieceType(type: MengeDienststueckart): Observable<MengeDienststueckart> {
        return this.http.post<MengeDienststueckart>(`${this.apiUrl}/piece-types`, type);
    }

    updatePieceType(basisVersion: number, id: string, type: MengeDienststueckart): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/piece-types/${basisVersion}/${id}`, type);
    }

    deletePieceType(basisVersion: number, id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/piece-types/${basisVersion}/${id}`);
    }

    // --- Duties (RecEinzeldienst) ---

    getAllDuties(): Observable<RecEinzeldienst[]> {
        return this.http.get<RecEinzeldienst[]>(`${this.apiUrl}/duties`);
    }

    getAllDienstarts(): Observable<MengeDienstart[]> {
        return this.http.get<MengeDienstart[]>(`${this.apiUrl}/dienstart`);
    }

    createDuty(duty: RecEinzeldienst): Observable<RecEinzeldienst> {
        return this.http.post<RecEinzeldienst>(`${this.apiUrl}/duties`, duty);
    }

    // --- Pieces (RecDienststueck) ---

    getAllPieces(): Observable<RecDienststueck[]> {
        return this.http.get<RecDienststueck[]>(`${this.apiUrl}/pieces`);
    }

    createPiece(piece: RecDienststueck): Observable<RecDienststueck> {
        return this.http.post<RecDienststueck>(`${this.apiUrl}/pieces`, piece);
    }
}
