import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetriebstagModalComponent } from './betriebstag-modal.component';

describe('BetriebstagModalComponent', () => {
  let component: BetriebstagModalComponent;
  let fixture: ComponentFixture<BetriebstagModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetriebstagModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetriebstagModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
