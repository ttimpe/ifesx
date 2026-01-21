import { Announcement } from "./announcement.model"
import { Stop } from "./stop.model"

export class StopInformation {
  code!: string
  number!: number
  shortName!: string
  stop?: Stop
  announcement?: Announcement
}
