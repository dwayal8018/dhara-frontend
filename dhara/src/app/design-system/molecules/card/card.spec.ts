import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DhCard } from './card';

describe('DhCard', () => {
  let component: DhCard;
  let fixture: ComponentFixture<DhCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DhCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DhCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
