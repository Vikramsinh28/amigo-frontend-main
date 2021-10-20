import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeUserFilterComponent } from './employee-user-filter.component';

describe('EmployeeUserFilterComponent', () => {
  let component: EmployeeUserFilterComponent;
  let fixture: ComponentFixture<EmployeeUserFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeUserFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeUserFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
