import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StopDetailComponent } from './stop-detail.component';
import { StopService } from '../../services/stop.service';
import { ActivatedRoute } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { SpecialCharacterService } from 'src/app/services/special-character.service';
import { AnnouncementService } from 'src/app/services/announcement.service';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Stop } from '../../models/stop.model';

describe('StopDetailComponent', () => {
  let component: StopDetailComponent;
  let fixture: ComponentFixture<StopDetailComponent>;
  let mockStopService: any;
  let mockDestinationService: any;
  let mockSpecialCharacterService: any;
  let mockAnnouncementService: any;
  let mockLocation: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockStopService = {
      getStopById: jasmine.createSpy('getStopById').and.returnValue(of(new Stop())),
      updateStop: jasmine.createSpy('updateStop').and.returnValue(of({})),
      createStop: jasmine.createSpy('createStop').and.returnValue(of({}))
    };
    mockDestinationService = { getAllDestinations: () => of([]) };
    mockSpecialCharacterService = { getAllSpecialCharacters: () => of([]) };
    mockAnnouncementService = { getAllAnnouncements: () => of([]) };
    mockLocation = { back: jasmine.createSpy('back') };
    mockActivatedRoute = { params: of({ id: '123' }) };

    await TestBed.configureTestingModule({
      imports: [StopDetailComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: StopService, useValue: mockStopService },
        { provide: DestinationService, useValue: mockDestinationService },
        { provide: SpecialCharacterService, useValue: mockSpecialCharacterService },
        { provide: AnnouncementService, useValue: mockAnnouncementService },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StopDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stop on init', () => {
    expect(mockStopService.getStopById).toHaveBeenCalled();
  });

  it('should contain a map container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#map')).toBeTruthy();
  });
});
