import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SpecialCharacter } from '../models/special-character.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpecialCharacterService {
  private apiUrl = '/api/specialCharacters';

  constructor(private http: HttpClient) { }


  getAllSpecialCharacters(basisVersion?: number): Observable<SpecialCharacter[]> {
    let url = this.apiUrl;
    if (basisVersion) {
      url += `?basisVersion=${basisVersion}`;
    }
    return this.http.get<SpecialCharacter[]>(url);
  }
  getSpecialCharacterById(id: number): Observable<SpecialCharacter> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SpecialCharacter>(url);
  }

  createSpecialCharacter(specialCharacter: SpecialCharacter): Observable<SpecialCharacter> {
    return this.http.post<SpecialCharacter>(this.apiUrl, specialCharacter);
  }

  updateSpecialCharacter(specialCharacter: SpecialCharacter): Observable<SpecialCharacter> {
    const url = `${this.apiUrl}/${specialCharacter.id}`;
    return this.http.put<SpecialCharacter>(url, specialCharacter);
  }
}
