import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerDishes } from './owner-dishes';

describe('OwnerDishes', () => {
  let component: OwnerDishes;
  let fixture: ComponentFixture<OwnerDishes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerDishes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerDishes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
