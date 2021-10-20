import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearlyTestsComponent } from './student-yearly-tests.component';

describe('StudentYearlyTestsComponent', () => {
  let component: StudentYearlyTestsComponent;
  let fixture: ComponentFixture<StudentYearlyTestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentYearlyTestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentYearlyTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
