import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopSearchFieldComponent } from './stop-search-field.component';

describe('StopSearchFieldComponent', () => {
  let component: StopSearchFieldComponent;
  let fixture: ComponentFixture<StopSearchFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopSearchFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopSearchFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
