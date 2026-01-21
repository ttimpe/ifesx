import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoRouteComponent } from './auto-route.component';

describe('AutoRouteComponent', () => {
  let component: AutoRouteComponent;
  let fixture: ComponentFixture<AutoRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoRouteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
