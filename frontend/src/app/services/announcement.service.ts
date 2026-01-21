import { Announcement } from './../models/announcement.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = '/api/announcements';

  constructor(private http: HttpClient) { }
  getAllAnnouncementFiles(): Observable<string[]> {
    const url = `${this.apiUrl}/files`;
    return this.http.get<string[]>(url);
  }

  getAllAnnouncements(basisVersion?: number): Observable<Announcement[]> {
    let url = this.apiUrl;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<Announcement[]>(url);
  }
  getAnnouncementById(id: number, basisVersion: number = 1): Observable<Announcement> {
    const url = `${this.apiUrl}/${id}?basisVersion=${basisVersion}`;
    return this.http.get<Announcement>(url);
  }

  createAnnouncement(announcement: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiUrl, announcement);
  }

  updateAnnouncement(announcement: Announcement): Observable<Announcement> {
    const url = `${this.apiUrl}/${announcement.id}`;
    return this.http.put<Announcement>(url, announcement);
  }
  deleteAnnouncement(announcement: Announcement): Observable<Announcement> {
    const url = `${this.apiUrl}/${announcement.id}?basisVersion=${announcement.basisVersion}`;
    return this.http.delete<Announcement>(url);
  }

  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
}


