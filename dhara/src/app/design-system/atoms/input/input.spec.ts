import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DhInput } from './input';

describe('DhInput', () => {
  let component: DhInput;
  let fixture: ComponentFixture<DhInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DhInput],
    }).compileComponents();

    fixture = TestBed.createComponent(DhInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
