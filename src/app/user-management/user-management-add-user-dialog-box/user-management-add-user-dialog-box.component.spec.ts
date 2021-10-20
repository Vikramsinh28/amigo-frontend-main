import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementAddUserDialogBoxComponent } from './user-management-add-user-dialog-box.component';

describe('UserManagementAddUserDialogBoxComponent', () => {
  let component: UserManagementAddUserDialogBoxComponent;
  let fixture: ComponentFixture<UserManagementAddUserDialogBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserManagementAddUserDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementAddUserDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
