import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubjectgroupAssignmentComponent } from './student-subjectgroup-assignment.component';

describe('StudentSubjectgroupAssignmentComponent', () => {
  let component: StudentSubjectgroupAssignmentComponent;
  let fixture: ComponentFixture<StudentSubjectgroupAssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentSubjectgroupAssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSubjectgroupAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
