import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialCharacterDetailComponent } from './special-character-detail.component';

describe('SpecialCharacterDetailComponent', () => {
  let component: SpecialCharacterDetailComponent;
  let fixture: ComponentFixture<SpecialCharacterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialCharacterDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialCharacterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
