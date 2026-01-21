import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagesartModalComponent } from './tagesart-modal.component';

describe('TagesartModalComponent', () => {
  let component: TagesartModalComponent;
  let fixture: ComponentFixture<TagesartModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagesartModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagesartModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
