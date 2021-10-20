import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearlyRemarksComponent } from './student-yearly-remarks.component';

describe('StudentYearlyRemarksComponent', () => {
  let component: StudentYearlyRemarksComponent;
  let fixture: ComponentFixture<StudentYearlyRemarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentYearlyRemarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentYearlyRemarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
