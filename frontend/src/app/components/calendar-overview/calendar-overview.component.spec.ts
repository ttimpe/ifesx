import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarOverviewComponent } from './calendar-overview.component';
import { CalendarService } from '../../services/calendar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CalendarOverviewComponent', () => {
  let component: CalendarOverviewComponent;
  let fixture: ComponentFixture<CalendarOverviewComponent>;
  let mockCalendarService: any;
  let mockModalService: any;

  beforeEach(async () => {
    mockCalendarService = {
      getVersionen: () => of([]),
      getGueltigkeiten: () => of([]),
      getTagesarten: () => of([]),
      getBetriebstage: () => of([])
    };
    mockModalService = {
      open: jasmine.createSpy('open')
    };

    await TestBed.configureTestingModule({
      imports: [CalendarOverviewComponent, HttpClientTestingModule],
      providers: [
        { provide: CalendarService, useValue: mockCalendarService },
        { provide: NgbModal, useValue: mockModalService },
        DatePipe
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
