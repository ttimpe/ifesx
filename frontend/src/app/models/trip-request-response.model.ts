import { Stop } from "./stop.model"


export class TripRequestReponseJourney {
  public legs!: TripRequestReponseJourneyLeg[]

}
export class TripRequestReponseJourneyLeg {
  public stopSequence: Stop[] = []
  public coords: any[] = []
}

export class TripRequestResponse {
  public journeys: TripRequestReponseJourney[] = []
}



