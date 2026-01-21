
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecLid } from '../models/line.model';

import { LidVerlauf } from '../models/lid-verlauf.model';

@Injectable({
  providedIn: 'root'
})
export class LineService {
  private apiUrl = '/api/lines';

  constructor(private http: HttpClient) { }

  getLines(basisVersion?: number): Observable<RecLid[]> {
    let url = this.apiUrl;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<RecLid[]>(url);
  }

  getLineById(id: number): Observable<RecLid> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<RecLid>(url);
  }

  updateLine(line: RecLid): Observable<RecLid> {
    const payload = {
      STR_LID: line.STR_LID,
      LIN_NAME: line.LIN_NAME,
      LIN_FARBE: line.LIN_FARBE,
      LIN_TEXT_FARBE: line.LIN_TEXT_FARBE
    }
    const url = `${this.apiUrl}/${line.LI_NR}`;
    return this.http.put<RecLid>(url, payload);
  }

  createLine(line: RecLid): Observable<RecLid> {
    const payload = {
      STR_LID: line.STR_LID,
      LIN_NAME: line.LIN_NAME,
      LIN_FARBE: line.LIN_FARBE,
      LIN_TEXT_FARBE: line.LIN_TEXT_FARBE
    }
    return this.http.post<RecLid>(this.apiUrl, payload);
  }

  deleteLine(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  /**
   * Cascading update of line ID
   */
  updateLineIdCascade(oldId: number, newId: number, basisVersion: number = 1): Observable<any> {
    const url = `${this.apiUrl}/${oldId}/change-id`;
    return this.http.put(url, { newId, basisVersion });
  }


  // --- VDV Variant Methods ---

  getLineVariants(liNr: number, basisVersion?: number): Observable<RecLid[]> {
    let url = `${this.apiUrl}/variants`;
    const params: any = { liNr: liNr.toString() };
    if (basisVersion) params.basisVersion = basisVersion;

    return this.http.get<RecLid[]>(url, { params });
  }

  getVariantStops(liNr: number, strLiVar: string, basisVersion?: number): Observable<LidVerlauf[]> {
    const params: any = { liNr: liNr.toString(), strLiVar: strLiVar };
    if (basisVersion) params.basisVersion = basisVersion;
    return this.http.get<LidVerlauf[]>(`${this.apiUrl}/variant-stops`, { params });
  }

  createVariant(variant: RecLid): Observable<RecLid> {
    return this.http.post<RecLid>(`${this.apiUrl}/variants`, variant);
  }

  updateVariant(variant: RecLid, oldStrLiVar?: string): Observable<any> {
    let url = `${this.apiUrl}/variants`;
    if (oldStrLiVar) {
      url += `?oldStrLiVar=${oldStrLiVar}`;
    }
    return this.http.put(url, variant);
  }

  deleteVariant(liNr: number, strLiVar: string): Observable<void> {
    const params = { liNr: liNr.toString(), strLiVar: strLiVar };
    return this.http.delete<void>(`${this.apiUrl}/variants`, { params });
  }

  addVariantStop(stop: any): Observable<LidVerlauf> {
    return this.http.post<LidVerlauf>(`${this.apiUrl}/variant-stops`, stop);
  }

  removeVariantStop(liNr: number, strLiVar: string, liLfdNr: number): Observable<void> {
    const params = { liNr: liNr.toString(), strLiVar: strLiVar, liLfdNr: liLfdNr.toString() };
    return this.http.delete<void>(`${this.apiUrl}/variant-stops`, { params });
  }

  updateVariantStop(liNr: number, strLiVar: string, liLfdNr: number, stop: LidVerlauf): Observable<LidVerlauf> {
    const params = { liNr: liNr.toString(), strLiVar: strLiVar, liLfdNr: liLfdNr.toString() };
    return this.http.put<LidVerlauf>(`${this.apiUrl}/variant-stops`, stop, { params });
  }
}
