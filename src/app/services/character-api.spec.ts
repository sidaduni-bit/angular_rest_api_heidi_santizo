import { TestBed } from '@angular/core/testing';

import { CharacterApi } from './character-api';

describe('CharacterApi', () => {
  let service: CharacterApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
