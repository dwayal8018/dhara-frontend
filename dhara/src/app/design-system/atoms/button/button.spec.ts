import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DhButton } from './button';

describe('DhButton', () => {
  let component: DhButton;
  let fixture: ComponentFixture<DhButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DhButton],
    }).compileComponents();

    fixture = TestBed.createComponent(DhButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
