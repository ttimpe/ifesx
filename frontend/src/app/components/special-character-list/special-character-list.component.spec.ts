import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialCharacterListComponent } from './special-character-list.component';

describe('SpecialCharacterListComponent', () => {
  let component: SpecialCharacterListComponent;
  let fixture: ComponentFixture<SpecialCharacterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialCharacterListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialCharacterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
