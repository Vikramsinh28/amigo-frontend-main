import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemarkStudentListComponent } from './remark-student-list.component';

describe('RemarkStudentListComponent', () => {
  let component: RemarkStudentListComponent;
  let fixture: ComponentFixture<RemarkStudentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemarkStudentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemarkStudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
