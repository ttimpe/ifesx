import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineListComponent } from './line-list.component';
import { LineService } from '../../services/line.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LineListComponent', () => {
  let component: LineListComponent;
  let fixture: ComponentFixture<LineListComponent>;
  let mockLineService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockLineService = {
      getLines: jasmine.createSpy('getLines').and.returnValue(of([])),
      deleteLine: jasmine.createSpy('deleteLine').and.returnValue(of({}))
    };
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [LineListComponent, HttpClientTestingModule], // Standalone uses imports
      providers: [
        { provide: LineService, useValue: mockLineService },
        { provide: Router, useValue: mockRouter }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LineListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mockLineService.getLines).toHaveBeenCalled();
  });

  it('should navigate to add line', () => {
    component.addLine();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/lines/new']);
  });
});
