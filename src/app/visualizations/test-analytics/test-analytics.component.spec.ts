import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAnalyticsComponent } from './test-analytics.component';

describe('TestAnalyticsComponent', () => {
  let component: TestAnalyticsComponent;
  let fixture: ComponentFixture<TestAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
