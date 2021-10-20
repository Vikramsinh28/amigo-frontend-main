import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartNewYearComponent } from './start-new-year.component';

describe('StartNewYearComponent', () => {
  let component: StartNewYearComponent;
  let fixture: ComponentFixture<StartNewYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartNewYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartNewYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
