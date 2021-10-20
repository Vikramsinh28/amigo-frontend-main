import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamMarksViewEditComponent } from './exam-marks-view-edit.component';

describe('ExamMarksViewEditComponent', () => {
  let component: ExamMarksViewEditComponent;
  let fixture: ComponentFixture<ExamMarksViewEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamMarksViewEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamMarksViewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
