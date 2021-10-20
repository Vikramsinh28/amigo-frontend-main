import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTestDialogBoxComponent } from './student-test-dialog-box.component';

describe('StudentTestDialogBoxComponent', () => {
  let component: StudentTestDialogBoxComponent;
  let fixture: ComponentFixture<StudentTestDialogBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentTestDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentTestDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
