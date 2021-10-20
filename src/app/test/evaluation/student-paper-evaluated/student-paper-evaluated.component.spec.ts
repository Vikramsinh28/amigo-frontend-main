import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPaperEvaluatedComponent } from './student-paper-evaluated.component';

describe('StudentPaperEvaluatedComponent', () => {
  let component: StudentPaperEvaluatedComponent;
  let fixture: ComponentFixture<StudentPaperEvaluatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentPaperEvaluatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentPaperEvaluatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
