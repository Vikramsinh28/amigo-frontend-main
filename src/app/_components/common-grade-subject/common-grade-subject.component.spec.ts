import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonGradeSubjectComponent } from './common-grade-subject.component';

describe('CommonGradeSubjectComponent', () => {
  let component: CommonGradeSubjectComponent;
  let fixture: ComponentFixture<CommonGradeSubjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonGradeSubjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonGradeSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
