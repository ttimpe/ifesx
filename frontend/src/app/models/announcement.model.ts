import { StopInformation } from "./stop-information.model"
import { Stop } from "./stop.model"

export class Announcement {
    id!: number
    number!: number
    name!: string
    fullText!: string
    fileName?: string
    basisVersion!: number;
    stops: Stop[] = []
}
