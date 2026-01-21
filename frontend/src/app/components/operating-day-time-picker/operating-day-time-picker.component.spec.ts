import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingDayTimePickerComponent } from './operating-day-time-picker.component';

describe('OperatingDayTimePickerComponent', () => {
  let component: OperatingDayTimePickerComponent;
  let fixture: ComponentFixture<OperatingDayTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatingDayTimePickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatingDayTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
