import { Trip } from "./trip.model"

export class VehicleSchedule {
  id: number = 0
  number?: number
  daytype!: number
  departureTime?: number
  arrivalTime?: number
  trips: Trip[] = []
}
