import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearlyDegreeCertificationsComponent } from './student-yearly-degree-certifications.component';

describe('StudentYearlyDegreeCertificationsComponent', () => {
  let component: StudentYearlyDegreeCertificationsComponent;
  let fixture: ComponentFixture<StudentYearlyDegreeCertificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentYearlyDegreeCertificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentYearlyDegreeCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
