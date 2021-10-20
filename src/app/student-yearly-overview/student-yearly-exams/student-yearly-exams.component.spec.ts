import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearlyExamsComponent } from './student-yearly-exams.component';

describe('StudentYearlyExamsComponent', () => {
  let component: StudentYearlyExamsComponent;
  let fixture: ComponentFixture<StudentYearlyExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentYearlyExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentYearlyExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
