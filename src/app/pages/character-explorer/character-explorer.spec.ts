import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterExplorer } from './character-explorer';

describe('CharacterExplorer', () => {
  let component: CharacterExplorer;
  let fixture: ComponentFixture<CharacterExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterExplorer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterExplorer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
