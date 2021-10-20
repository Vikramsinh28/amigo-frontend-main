import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Employee } from 'src/app/entities/employeeNew';
import { BackendService } from 'src/app/backend';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { UserManagementAddUserDialogBoxComponent } from '../user-management-add-user-dialog-box/user-management-add-user-dialog-box.component';
import { EmployeeUserFilterComponent } from './employee-user-filter/employee-user-filter.component';
import { CommonService } from 'src/app/_helpers/common';
@Component({
  selector: 'app-employee-user',
  templateUrl: './employee-user.component.html',
  styleUrls: ['./employee-user.component.scss'],
})
export class EmployeeUserComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'clientEmployeeNo',
    'firstName',
    'lastName',
    'userName',
    'clientRoleId',
    'title',
    'activeState',
    'action',
    'select'
  ];
  employeeDetails: Employee[];
  employeeDataSource = new MatTableDataSource<Employee>();
  selection = new SelectionModel<Employee>(true, []);
  clientRoleList: any = [];
  dateFormat: any;
  userIdentity: any;
  withValidations: boolean;
  filterType: any;
  statusType: any;
  employeeFilterData: any
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(EmployeeUserFilterComponent) empFilter: EmployeeUserFilterComponent;
  constructor(
    private backendService: BackendService,
    private snackBar: CommonService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
  }
  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
    this.filterType = "Search";
  }

  ngAfterViewInit() {
    this.employeeDataSource.paginator = this.paginator;
    this.employeeDataSource.sort = this.sort;
    this.getClientRoles();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.employeeDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.employeeDataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Employee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.employeeNo + 1}`;
  }

  /** Update Employee is activated state */
  updateEmployeeActiveState(status: boolean, employee) {
    if (this.validateData() || employee) {
      let userList: number[] = [];
      if(employee)
      {
        userList.push(employee.user.userId);
      }
      else
      {
        userList = this.selection.selected.map(x => x.user.userId);
      }

      if (status) {
        this.backendService.putEmployeeState(this.userIdentity.clientId, userList, 1).toPromise().then(response => {
          this.updateData(userList, 1);
          this.snackBar.showSuccessMsg(response.toString());
          this.selection.clear();
        }).catch((error:any) => {
          this.snackBar.showErrorMsg(error.error);
        });
      } else {
        this.backendService.putEmployeeState(this.userIdentity.clientId, userList, 0).toPromise().then(response => {
          this.updateData(userList, 0);
          this.snackBar.showSuccessMsg(response.toString());
          this.selection.clear();
        }).catch((error:any) => {
          this.snackBar.showErrorMsg(error.error);
        });;
      }
    } else {
      this.showErrMsg("Please select atleast one Employee");
    }
  }

  updateData(selectedEmployees: number[], status) {
    for (let i = 0; i < selectedEmployees.length; i++) {
      let index = this.employeeDetails.findIndex(x => x.user.userId === selectedEmployees[i]);
      this.employeeDetails[index].user.activeState = status;
    };
    this.employeeDataSource.data = this.employeeDetails
  }

  /** Reset Password */
  resetPassword(employee) {
    let selectedIds: number[] = [];
    selectedIds.push(employee.employeeId);
    this.backendService
      .putEmployeeResetPassword(this.userIdentity.clientId, selectedIds)
      .toPromise().then(
        (response) => {
          this.snackBar.showSuccessMsg(response.toString());
        })
        .catch((error) => {
          this.snackBar.showErrorMsg(error);
        }
      );
  }

  /** Get Client Roles */
  getClientRoles() {
    var userIdentity = this.frontendService.getJWTUserIdentity();
    this.backendService
      .getClientRoles(userIdentity.clientId)
      .toPromise().then((data) => {
        this.clientRoleList = data;
        let index = this.clientRoleList.findIndex(crl=> crl.roleName === 'Student');
        this.clientRoleList.splice(index,1);
        this.empFilter.setClientRoleList(this.clientRoleList);
      },(error:any) => {
                    console.log(error);
                });
  }

  searchEmployee(data) {
    this.employeeFilterData = data;
    this.employeeDetails = [];
    if (data) {
      data.clientId = this.userIdentity.clientId;
      this.backendService.getEmployeeDetails(data).toPromise().then((result: any) => {
        if (result) {
          this.employeeDetails = result;
          this.employeeDataSource.data = this.employeeDetails;
          this.statusType = data.activeStatus;
        }
      }).catch((error: any) => {
        this.showErrMsg(error.error);
      })
    } else {
      this.employeeDetails = [];
    }
  }

  createEmployee() {
    const dialogRef = this.dialog.open(UserManagementAddUserDialogBoxComponent, {
      data: {
        filterType: 'Create',
        withValidations: true,
        userType: 'Employee',
        additionalData: this.clientRoleList
      },
      disableClose: true,
      width: '550px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.selection.clear();
    });

  }

  async editEmployee(data, type) {
    await this.backendService.getUserPicture(this.userIdentity.clientId, data.user.userId).toPromise().then((result) => {
      if (result) {
        let logoURL = 'data:' + '"image/png"' + ';base64,' + result;
        data.user.picture = this.sanitizer.bypassSecurityTrustUrl(logoURL);
      } else {
        data.user.picture = "";
      }
    }).catch((error:any) => {
                    console.log(error);
                })
    data.clientRoleList = this.clientRoleList;
    const dialogRef = this.dialog.open(UserManagementAddUserDialogBoxComponent, {
      data: {
        filterType: type,
        withValidations: true,
        userType: 'Employee',
        additionalData: data
      },
      disableClose: true,
      width: '550px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.selection.clear();
      if (result) {
        this.searchEmployee(this.employeeFilterData);
      }
    });
  }

  // <-------------------------------------- Common Function ------------------------------------------------->

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  validateData() {
    if (this.selection.selected.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  clearData(event){
    this.selection.clear();
    this.statusType = 0;
    this.employeeDataSource.data = [];
  }

  changeStatus(element){
    let status: boolean = (element.user.activeState != 1) ? true : false;
    this.updateEmployeeActiveState(status, element);
  }

}
