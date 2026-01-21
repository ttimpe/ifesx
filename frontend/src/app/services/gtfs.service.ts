
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GTFSAgency {
    id: string;
    name: string;
    url: string;
}

export interface GTFSImportResult {
    success: boolean;
    message: string;
    stats: {
        stops: number;
        lines: number;
        relations: number;
    }
}

export interface StageProgress {
    name: string;
    current: number;
    total: number;
    details?: string;
    completed: boolean;
}

export interface ImportProgress {
    stages: StageProgress[];
}

@Injectable({
    providedIn: 'root'
})
export class GtfsService {
    private apiUrl = '/api/gtfs';

    constructor(private http: HttpClient) { }

    analyze(file: File): Observable<{ agencies: GTFSAgency[], tempFile: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ agencies: GTFSAgency[], tempFile: string }>(`${this.apiUrl}/analyze`, formData);
    }

    import(tempFile: string, agencyId: string, basisVersion: number, importId: string, loadEFADistances = false): Observable<GTFSImportResult> {
        return this.http.post<GTFSImportResult>(`${this.apiUrl}/import`, { tempFile, agencyId, basisVersion, importId, loadEFADistances });
    }

    getProgress(importId: string): Observable<ImportProgress> {
        return this.http.get<ImportProgress>(`${this.apiUrl}/progress/${importId}`);
    }
}
