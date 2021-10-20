import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAccessAddEditComponent } from './employee-access-add-edit.component';

describe('EmployeeAccessAddEditComponent', () => {
  let component: EmployeeAccessAddEditComponent;
  let fixture: ComponentFixture<EmployeeAccessAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeAccessAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAccessAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
