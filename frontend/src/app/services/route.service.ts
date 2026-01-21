// route.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from '../models/route.model';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private apiUrl = '/api'; // Update with your API URL

  constructor(private http: HttpClient) { }

  getRoutesByLine(lineId: string | number) {
    return this.http.get<Route[]>(`${this.apiUrl}/lines/${lineId}/routes`);
  }

  getRouteByLine(lineId: string | number, routeId: number): Observable<any> {
    const url = `${this.apiUrl}/lines/${lineId}/routes/${routeId}`;
    return this.http.get<Route>(url);
  }

  updateRoute(route: any): Observable<any> {
    const url = `${this.apiUrl}/lines/${route.line_id}/routes/${route.id}`;
    for (let i = 0; i < route.stops.length; i++) {
      route.stops[i].stop_id = route.stops[i].stop.id
      route.stops[i].sequence_number = i
    }
    return this.http.put<Route>(url, route);
  }

  createRoute(route: any): Observable<any> {
    const url = `${this.apiUrl}/lines/${route.line_id}/routes/`;
    for (let i = 0; i < route.stops.length; i++) {
      route.stops[i].stop_id = route.stops[i].stop.id
      route.stops[i].sequence_number = i
    }

    return this.http.post<Route>(url, route);
  }

  deleteRoute(route: Route): Observable<Route> {
    const url = `${this.apiUrl}/lines/${route.line_id}/routes/${route.id}`;
    return this.http.delete<Route>(url);
  }

}
