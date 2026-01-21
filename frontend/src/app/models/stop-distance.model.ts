import { Stop } from "./stop.model"

export class StopDistance {
    origin_stop_id!: string
    destination_stop_id!: string
    originStop!: Stop
    destinationStop!: Stop
    distance!: number
    time!: number
}
