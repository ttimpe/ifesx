import { Tagesart } from 'src/app/models/tagesart.model';
// destination.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Betriebstag } from '../models/betriebstag.model';
import { BasisVersion } from '../models/basis-version.model';
import { BasisVersionGueltigkeit } from '../models/basis-version-gueltigkeit.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = '/api/calendar';
  private basisUrl = '/api/basis';

  // State Management
  private selectedVersionSubject = new BehaviorSubject<number | null>(null);
  public selectedVersion$ = this.selectedVersionSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize from LocalStorage if available
    const saved = localStorage.getItem('selectedDV');
    if (saved) {
      // Assuming saved item is ID (UUID) or NUMBER? 
      // In CalendarOverview it matches against v.id. 
      // But we need the NUMBER (BASIS_VERSION) for the API.
      // We might need to fetch versions first or just store the number.
      // Let's rely on components to set it for now, or minimal init.
    }
  }

  setSelectedVersion(version: number | null) {
    this.selectedVersionSubject.next(version);
  }

  getCurrentVersion(): number | null {
    return this.selectedVersionSubject.value;
  }

  // Tagesarten / Tagtypen (Mo-Fr/Sa/So)

  getTagesarten(): Observable<Tagesart[]> {
    const url = `${this.apiUrl}/tagesarten`;
    return this.http.get<Tagesart[]>(url);
  }

  createTagesart(tagesart: Tagesart): Observable<Tagesart> {
    return this.http.post<Tagesart>(`${this.apiUrl}/tagesarten`, tagesart)
  }

  deleteTagesart(tagesart: Tagesart): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tagesarten/${tagesart.id}`)
  }

  updateTagesart(tagesart: Tagesart): Observable<Tagesart> {
    return this.http.put<Tagesart>(`${this.apiUrl}/tagesarten/${tagesart.id}`, tagesart)
  }

  // Kalendertage/Betriebstage (20241231) Zuordnung zu Tagesarten

  getBetriebstage(basisVersion?: number): Observable<Betriebstag[]> {
    let url = `${this.apiUrl}/betriebstage`;
    if (basisVersion) {
      url += `?basis_version=${basisVersion}`;
    }
    return this.http.get<Betriebstag[]>(url);
  }

  createBetriebstag(betriebstag: Betriebstag): Observable<Betriebstag> {
    return this.http.post<Betriebstag>(`${this.apiUrl}/betriebstage`, betriebstag)
  }

  deleteBetriebstag(betriebstag: Betriebstag): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/betriebstage/${betriebstag.id}`)
  }

  updateBetriebstag(betriebstag: Betriebstag): Observable<Betriebstag> {
    return this.http.put<Betriebstag>(`${this.apiUrl}/betriebstage/${betriebstag.id}`, betriebstag)
  }


  // VDV DV Versionen

  getVersionen(): Observable<BasisVersion[]> {
    const url = `${this.basisUrl}/versionen`;
    return this.http.get<BasisVersion[]>(url);
  }

  createVersion(version: BasisVersion): Observable<BasisVersion> {
    return this.http.post<BasisVersion>(`${this.basisUrl}/versionen`, version)
  }

  editVersion(version: BasisVersion): Observable<BasisVersion> {
    return this.http.put<BasisVersion>(`${this.basisUrl}/versionen/${version.id}`, version)
  }

  deleteVersion(version: BasisVersion): Observable<any> {
    return this.http.delete<any>(`${this.basisUrl}/versionen/${version.BASIS_VERSION}`)
  }

  // Gueltigkeit Methods
  getGueltigkeiten(): Observable<BasisVersionGueltigkeit[]> {
    return this.http.get<BasisVersionGueltigkeit[]>(`${this.basisUrl}/gueltigkeiten`);
  }

  createGueltigkeit(gueltigkeit: BasisVersionGueltigkeit): Observable<BasisVersionGueltigkeit> {
    return this.http.post<BasisVersionGueltigkeit>(`${this.basisUrl}/gueltigkeiten`, gueltigkeit);
  }

  deleteGueltigkeit(id: string): Observable<any> {
    return this.http.delete<any>(`${this.basisUrl}/gueltigkeiten/${id}`);
  }
}
