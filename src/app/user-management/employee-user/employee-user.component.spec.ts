import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeUserComponent } from './employee-user.component';

describe('EmployeeUserComponent', () => {
  let component: EmployeeUserComponent;
  let fixture: ComponentFixture<EmployeeUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
