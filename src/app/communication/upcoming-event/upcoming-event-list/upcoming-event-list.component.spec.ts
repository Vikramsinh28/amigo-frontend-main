import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingEventsListComponent } from './upcoming-event-list.component';

describe('UpcomingEventsListComponent', () => {
  let component: UpcomingEventsListComponent;
  let fixture: ComponentFixture<UpcomingEventsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpcomingEventsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingEventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
