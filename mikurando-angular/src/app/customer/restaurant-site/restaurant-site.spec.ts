import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantSite } from './restaurant-site';

describe('RestaurantSite', () => {
  let component: RestaurantSite;
  let fixture: ComponentFixture<RestaurantSite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantSite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantSite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
