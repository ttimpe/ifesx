import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GtfsImportComponent } from './gtfs-import.component';

describe('GtfsImportComponent', () => {
  let component: GtfsImportComponent;
  let fixture: ComponentFixture<GtfsImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GtfsImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GtfsImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
