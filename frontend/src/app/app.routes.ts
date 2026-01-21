import { Routes } from '@angular/router';

import { LineListComponent } from './components/line-list/line-list.component';
import { LineDetailComponent } from './components/line-detail/line-detail.component';

import { StopListComponent } from './components/stop-list/stop-list.component';
import { StopDetailComponent } from './components/stop-detail/stop-detail.component';

import { DestinationListComponent } from './components/destination-list/destination-list.component';
import { DestinationDetailComponent } from './components/destination-detail/destination-detail.component';

import { AnnouncementListComponent } from './components/announcement-list/announcement-list.component';
import { AnnouncementDetailComponent } from './components/announcement-detail/announcement-detail.component';

import { SpecialCharacterListComponent } from './components/special-character-list/special-character-list.component';
import { SpecialCharacterDetailComponent } from './components/special-character-detail/special-character-detail.component';

import { GtfsImportComponent } from './components/gtfs-import/gtfs-import.component';
import { NetworkMapEditorComponent } from './components/network-map-editor/network-map-editor.component';
import { CalendarOverviewComponent } from './components/calendar-overview/calendar-overview.component';
import { RecOmListComponent } from './components/rec-om-list/rec-om-list.component';
import { RecOmDetailComponent } from './components/rec-om-detail/rec-om-detail.component';
import { RecSelListComponent } from './components/rec-sel-list/rec-sel-list.component';
import { RecSelDetailComponent } from './components/rec-sel-detail/rec-sel-detail.component';
import { RecAnrListComponent } from './components/rec-anr-list/rec-anr-list.component';
import { RecAnrDetailComponent } from './components/rec-anr-detail/rec-anr-detail.component';
import { BhofListComponent } from './components/bhof-list/bhof-list.component';
import { BhofDetailComponent } from './components/bhof-detail/bhof-detail.component';
import { RecUebListComponent } from './components/rec-ueb-list/rec-ueb-list.component';
import { RecUebDetailComponent } from './components/rec-ueb-detail/rec-ueb-detail.component';
import { RecUmlaufListComponent } from './components/rec-umlauf-list/rec-umlauf-list.component';
import { RecUmlaufDetailComponent } from './components/rec-umlauf-detail/rec-umlauf-detail.component';

import { VehicleListComponent } from './components/vehicle-list/vehicle-list.component';
import { RecBereichListComponent } from './components/rec-bereich-list/rec-bereich-list.component';
import { RecBereichDetailComponent } from './components/rec-bereich-detail/rec-bereich-detail.component';
import { RecFgrListComponent } from './components/rec-fgr-list/rec-fgr-list.component';
import { RecFgrDetailComponent } from './components/rec-fgr-detail/rec-fgr-detail.component';
import { RecFztMatrixComponent } from './components/rec-fzt-matrix/rec-fzt-matrix.component';
import { HelpComponent } from './components/help/help.component';
import { ConnectionListComponent } from './components/connection-list/connection-list.component';
import { ConnectionDetailComponent } from './components/connection-detail/connection-detail.component';

import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'lines', component: LineListComponent },
      { path: 'lines/:lineId', component: LineDetailComponent },
      { path: 'lines/:lineId/variants/:variantId', loadComponent: () => import('./components/line-variant-detail/line-variant-detail.component').then(m => m.LineVariantDetailComponent) },

      { path: 'stops', component: StopListComponent },
      { path: 'stops/:stopId', component: StopDetailComponent },
      { path: 'stops/add', component: StopDetailComponent },

      { path: 'destinations', component: DestinationListComponent },
      { path: 'destinations/:id', component: DestinationDetailComponent },
      { path: 'destinations/add', component: DestinationListComponent },

      { path: 'announcements', component: AnnouncementListComponent },
      { path: 'announcements/:id', component: AnnouncementDetailComponent },
      { path: 'announcements/add', component: AnnouncementDetailComponent },

      { path: 'specialCharacters', component: SpecialCharacterListComponent },
      { path: 'specialCharacters/:id', component: SpecialCharacterDetailComponent },
      { path: 'specialCharacters/add', component: SpecialCharacterDetailComponent },

      { path: 'import', component: GtfsImportComponent },
      { path: 'network', component: NetworkMapEditorComponent },
      { path: 'calendar', component: CalendarOverviewComponent },
      { path: 'calendar/gtfs-import', loadComponent: () => import('./components/gtfs-import-page/gtfs-import-page.component').then(m => m.GtfsImportPageComponent) },

      { path: 'rec-om', component: RecOmListComponent },
      { path: 'rec-om/:id', component: RecOmDetailComponent },

      { path: 'rec-sel', component: RecSelListComponent },
      { path: 'rec-sel/add', component: RecSelDetailComponent },
      { path: 'rec-sel/:id', component: RecSelDetailComponent },
      { path: 'network-map-editor', component: NetworkMapEditorComponent },

      { path: 'rec-anr', component: RecAnrListComponent },
      { path: 'rec-anr/:id', component: RecAnrDetailComponent },

      { path: 'betriebshoefe', component: BhofListComponent },
      { path: 'betriebshoefe/:bhofNr', component: BhofDetailComponent },

      { path: 'rec-ueb', component: RecUebListComponent },
      { path: 'rec-ueb/detail', component: RecUebDetailComponent },
      { path: 'rec-ueb/new', component: RecUebDetailComponent },

      { path: 'rec-umlauf', component: RecUmlaufListComponent },
      { path: 'rec-umlauf/detail', component: RecUmlaufDetailComponent },
      { path: 'rec-umlauf/new', component: RecUmlaufDetailComponent },
      { path: 'rec-umlauf/:id', component: RecUmlaufDetailComponent },

      { path: 'vehicles', component: VehicleListComponent },
      { path: 'vehicles/:id', loadComponent: () => import('./components/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent) },

      { path: 'rec-bereich', component: RecBereichListComponent },
      { path: 'rec-bereich/detail', component: RecBereichDetailComponent },
      { path: 'rec-bereich/new', component: RecBereichDetailComponent },
      { path: 'rec-bereich/:id', component: RecBereichDetailComponent },

      { path: 'rec-fgr', component: RecFgrListComponent },
      { path: 'rec-fgr/detail', component: RecFgrDetailComponent },
      { path: 'rec-fgr/new', component: RecFgrDetailComponent },
      { path: 'rec-fgr/:id', component: RecFgrDetailComponent },

      { path: 'rec-fzt-matrix', component: RecFztMatrixComponent },

      { path: 'help', component: HelpComponent },

      { path: 'connections', component: ConnectionListComponent },
      { path: 'connections/new', component: ConnectionDetailComponent },
      { path: 'connections/:id', component: ConnectionDetailComponent },

      { path: '', redirectTo: 'lines', pathMatch: 'full' }
    ]
  },

  // Standalone Route (No Sidebar)
  { path: 'kursblatt/:umUid', loadComponent: () => import('./components/kursblatt/kursblatt.component').then(m => m.KursblattComponent) },
  { path: 'welcome', loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent) }
];