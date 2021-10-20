import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTestReportGraphComponent } from './student-test-report-graph.component';

describe('StudentTestReportGraphComponent', () => {
  let component: StudentTestReportGraphComponent;
  let fixture: ComponentFixture<StudentTestReportGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentTestReportGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentTestReportGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
