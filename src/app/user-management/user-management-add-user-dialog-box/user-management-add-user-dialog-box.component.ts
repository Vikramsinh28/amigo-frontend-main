import { AfterViewInit, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeUserFilterComponent } from '../employee-user/employee-user-filter/employee-user-filter.component';
import { StudentUserFiltersComponent } from '../student-user/student-user-filters/student-user-filters.component';

@Component({
  selector: 'app-user-management-add-user-dialog-box',
  templateUrl: './user-management-add-user-dialog-box.component.html',
  styleUrls: ['./user-management-add-user-dialog-box.component.scss']
})
export class UserManagementAddUserDialogBoxComponent implements OnInit, AfterViewInit {
  filterType: any;
  withValidations: any;
  userType: any;
  additionalData: any;
  @ViewChild(StudentUserFiltersComponent)
  studentData: StudentUserFiltersComponent;
  @ViewChild(EmployeeUserFilterComponent)
  employeeData: EmployeeUserFilterComponent;
  constructor(
    public dialogRef: MatDialogRef<UserManagementAddUserDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filterType = data.filterType;
    this.withValidations = data.withValidations;
    this.userType = data.userType;
    this.additionalData = data.additionalData;
  }
  ngAfterViewInit(): void {
    if ((this.filterType === 'Edit' || this.filterType === 'View') && this.userType === 'Student') {
      this.studentData.setStudentUserData(this.additionalData);
    }
    if ((this.filterType === 'Edit' || this.filterType === 'View') && this.userType === 'Employee') {
      this.employeeData.setEmployeeUserData(this.additionalData);
    }
    if (this.filterType === 'Create' && this.userType === 'Employee') {
      this.employeeData.setClientRoleList(this.additionalData)
    }
  }

  ngOnInit(): void {

  }

  close(text){
    this.dialogRef.close();
  }

}
