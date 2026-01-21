import { TestBed } from '@angular/core/testing';

import { SpecialCharacterService } from './special-character.service';

describe('SpecialCharacterService', () => {
  let service: SpecialCharacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecialCharacterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
