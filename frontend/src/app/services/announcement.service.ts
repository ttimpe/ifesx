import { RecAnr } from './../models/announcement.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = '/api/vdv/rec-anr';

  constructor(private http: HttpClient) { }

  getAllAnnouncementFiles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/files`);
  }

  getAll(basisVersion?: number): Observable<RecAnr[]> {
    const url = basisVersion ? `${this.apiUrl}?basisVersion=${basisVersion}` : this.apiUrl;
    return this.http.get<RecAnr[]>(url);
  }

  getById(id: number): Observable<RecAnr> {
    return this.http.get<RecAnr>(`${this.apiUrl}/${id}`);
  }

  create(anr: RecAnr): Observable<RecAnr> {
    return this.http.post<RecAnr>(this.apiUrl, anr);
  }

  update(anr: RecAnr): Observable<RecAnr> {
    return this.http.put<RecAnr>(`${this.apiUrl}/${anr.ANR_NR}`, anr);
  }

  delete(anr: RecAnr): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${anr.ANR_NR}`);
  }

  uploadAudio(file: File): Observable<{ ANR_DATEI: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ ANR_DATEI: string }>(`${this.apiUrl}/upload`, formData);
  }
}
