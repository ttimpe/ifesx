import { CommonModule } from '@angular/common';
import { StopSearchFieldComponent } from './../stop-search-field/stop-search-field.component';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { RouteStop } from 'src/app/models/route-stop.model';
import { Stop } from 'src/app/models/stop.model';
import { TripRequestResponse } from 'src/app/models/trip-request-response.model';
import { StopService } from 'src/app/services/stop.service';

@Component({
  selector: 'app-auto-route',
  templateUrl: './auto-route.component.html',
  styleUrls: ['./auto-route.component.css'],
  standalone: true,
  imports: [CommonModule, StopSearchFieldComponent]
})
export class AutoRouteComponent {
  @Output() onRouteFound = new EventEmitter<RouteStop[]>()
  @Input() isVisible: boolean = false

  @ViewChild('originStopField') originStopField!: StopSearchFieldComponent
  @ViewChild('destinationStopField') destinationStopField!: StopSearchFieldComponent
  autoRouteOriginStop?: Stop
  autoStartDestinationStop?: Stop

  displayStyle: string = 'none';

  constructor(private http: HttpClient, private stopService: StopService) {}

  ngOnChanges(changes: SimpleChange) {
    if (this.isVisible) {
      this.displayStyle = 'block'
      this.originStopField.inputField.nativeElement.focus()
    } else {
      this.displayStyle = 'none'
    }
  }

  onSelectAutoRouteOriginStop(stop: Stop) {
    this.autoRouteOriginStop = stop
    this.destinationStopField.inputField.nativeElement.focus()
  }
  onSelectAutoRouteDestinationStop(stop: Stop) {
    this.autoStartDestinationStop = stop
  }

  async findRoute() {
    if (this.autoRouteOriginStop && this.autoStartDestinationStop) {
      let originId = this.autoRouteOriginStop.id.replace('_Parent', '')
      let destinationId = this.autoStartDestinationStop.id.replace('_Parent', '')
    // get start and destination stops by code, then run request against api, find the route, remove all unneccessary infos
    let url = 'https://westfalenfahrplan.de/nwl-efa/XML_TRIP_REQUEST2?allInterchangesAsLegs=1&convertAddressesITKernel2LocationServer=1&convertCoord2LocationServer=1&convertCrossingsITKernel2LocationServer=1&convertPOIsITKernel2LocationServer=1&convertStopsPTKernel2LocationServer=1&coordOutputDistance=1&coordOutputFormat=WGS84%5Bdd.ddddd%5D&genC=1&genMaps=0&imparedOptionsActive=1&inclMOT_1=true&inclMOT_10=true&inclMOT_11=true&inclMOT_13=true&inclMOT_14=true&inclMOT_15=true&inclMOT_16=true&inclMOT_17=true&inclMOT_18=true&inclMOT_19=true&inclMOT_2=true&inclMOT_3=true&inclMOT_4=true&inclMOT_5=true&inclMOT_6=true&inclMOT_7=true&inclMOT_8=true&inclMOT_9=true&includedMeans=checkbox&itOptionsActive=1&itdTripDateTimeDepArr=dep&language=de&lineRestriction=400&locationServerActive=1&name_destination=' + destinationId + '&name_origin=' + originId + '&nwlTripMacro=1&outputFormat=rapidJSON&ptOptionsActive=1&routeType=LEASTTIME&serverInfo=1&trITMOTvalue100=10&type_destination=any&type_notVia=any&type_origin=any&type_via=any&useProxFootSearch=true&useRealtime=1&useUT=1&version=10.5.17.3&anyObjFilter_origin=2&&anyObjFilter_destination=2&ptOptionsActive=1&routeType=LEASTWALKING'
    console.log('Finding route')
    this.http.get<TripRequestResponse>(url).subscribe(data => {
      if (data.journeys && data.journeys[0].legs) {
      // Extracting stop ids from the stopSequence of the first journey's legs
      const firstJourneyStopIds = data.journeys[0].legs.reduce((acc, leg) => {
      leg.stopSequence.forEach(stop => {
        acc.push(stop.id);
      });

  return acc;
}, [] as string[]);
    const foundStops = this.stopService.getAllStops().pipe(
      // Filter stops based on the search term
      map((stops: Stop[]) => stops.filter(stop => firstJourneyStopIds.includes(stop.id)))
    );
    const routeStops: RouteStop[] = []
    foundStops.subscribe(stopData => {
      console.log(stopData)
      stopData.forEach(stop => {
        const routeStop = new RouteStop()
        routeStop.stop = stop
        routeStops.push(routeStop)

      })
      routeStops.sort(function (a: RouteStop, b: RouteStop) {
        return firstJourneyStopIds.indexOf(a.stop!.id) - firstJourneyStopIds.indexOf(b.stop!.id);
      });
      console.log(routeStops)
      this.onRouteFound.emit(routeStops)




    })


  }
    })
  }
}

}
