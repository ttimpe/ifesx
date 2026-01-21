import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkMapEditorComponent } from './network-map-editor.component';

describe('NetworkMapEditorComponent', () => {
  let component: NetworkMapEditorComponent;
  let fixture: ComponentFixture<NetworkMapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetworkMapEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkMapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
