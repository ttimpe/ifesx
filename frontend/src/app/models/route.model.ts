import { RecZnr } from "./destination.model"
import { RecLid } from "./line.model"
import { SpecialCharacter } from "./special-character.model"
import { RouteStop } from "./route-stop.model"

export class Route {
  id!: number
  number!: string
  line_id!: number
  line!: RecLid
  stops: RouteStop[] = []
  direction!: number
  destination_id!: number
  destination!: RecZnr
  specialCharacter!: SpecialCharacter
  special_character_id!: number
}
