import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearlyOverviewComponent } from './student-yearly-overview.component';

describe('StudentYearlyOverviewComponent', () => {
  let component: StudentYearlyOverviewComponent;
  let fixture: ComponentFixture<StudentYearlyOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentYearlyOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentYearlyOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
