import { Injectable } from '@angular/core';
import { VehicleSchedule } from '../models/vehicle-schedule.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Trip } from '../models/trip.model';
import { Tagesart } from '../models/tagesart.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = '/api/schedules';

  constructor(private http: HttpClient) {}

  getAllSchedules(): Observable<VehicleSchedule[]> {
    return this.http.get<VehicleSchedule[]>(this.apiUrl);
  }
  getScheduleById(id: number): Observable<VehicleSchedule> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<VehicleSchedule>(url);
  }
  getTripsForSchedule(id: number): Observable<Trip[]> {
    const url = `${this.apiUrl}/${id}/trips`;
    return this.http.get<Trip[]>(url);
  }

  getTripById(scheduleId: number, tripId: number): Observable<Trip> {
    const url = `${this.apiUrl}/${scheduleId}/trips/${tripId}`;
    return this.http.get<Trip>(url);
  }


  createTrip(scheduleId: number, trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl + `/${scheduleId}/trips`, trip)
  }

  updateTrip(scheduleId: number, trip: Trip): Observable<Trip> {
    const url = `${this.apiUrl}/${scheduleId}/trips/${trip.id}`;
    return this.http.put<Trip>(url, trip);
  }

  deleteTrip(scheduleId: number, trip: Trip): Observable<Trip> {
    const url = `${this.apiUrl}/${scheduleId}/trips/${trip.id}`;
    return this.http.delete<Trip>(url);
  }

  createSchedule(schedule: VehicleSchedule): Observable<VehicleSchedule> {
    return this.http.post<VehicleSchedule>(this.apiUrl, schedule);
  }

  updateSchedule(schedule: VehicleSchedule): Observable<VehicleSchedule> {
    const url = `${this.apiUrl}/${schedule.id}`;
    return this.http.put<VehicleSchedule>(url, schedule);
  }
  deleteSchedule(schedule: VehicleSchedule): Observable<VehicleSchedule> {
    const url = `${this.apiUrl}/${schedule.id}`;
    return this.http.delete<VehicleSchedule>(url);
  }


}
