import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BackendService } from 'src/app/backend';
import { StudentNew } from 'src/app/entities/studentNew';
import { FrontendService } from 'src/app/_services/frontend.service';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserManagementAddUserDialogBoxComponent } from '../user-management-add-user-dialog-box/user-management-add-user-dialog-box.component';
import { StudentUserFiltersComponent } from './student-user-filters/student-user-filters.component';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/app/_helpers/common';
@Component({
  selector: 'app-student-user',
  templateUrl: './student-user.component.html',
  styleUrls: ['./student-user.component.scss']
})
export class StudentUserComponent implements AfterViewInit, OnInit {

  form: FormGroup;
  displayedColumns: string[] = ['regNo', 'firstName', 'lastName', 'userName', 'currentYearGradeDivision', 'activeState', 'action', 'select'];
  studentDetails: StudentNew[];
  studentDataSource = new MatTableDataSource<StudentNew>();
  selection = new SelectionModel<StudentNew>(true, []);
  withValidations: boolean;
  filterType: any;
  userIdentity: any;
  statusType: any;
  currentYearOrder: any;
  selectedYearOrder: any;
  dateFormat: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(StudentUserFiltersComponent) studentData: StudentUserFiltersComponent;
  studentFilterData: any
  constructor(private backendService: BackendService,
    private snackBar: CommonService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer) {
    this.filterType = "Search";
  }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
  }

  ngAfterViewInit() {
    this.studentDataSource.paginator = this.paginator;
    this.studentDataSource.sort = this.sort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.studentDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.studentDataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: StudentNew): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.regNo + 1}`;
  }

  /** Update student is activated state */
  updateStudentActiveState(status: boolean, student) {
    var userIdentity = this.frontendService.getJWTUserIdentity();
    if (this.validateData() || student) {
      let userList: number[] = [];
      if(student)
      {
        userList.push(student.user.userId);
      }
      else
      {
        userList = this.selection.selected.map(x => x.user.userId);
      }
      
      if (status) {
        this.backendService.putStudentState(userIdentity.clientId, userList, 1).toPromise().then(response => {
          this.updateData(userList, 1);
          this.snackBar.showSuccessMsg(response.toString());
          this.selection.clear();
        }).catch((error:any) => {
          this.snackBar.showErrorMsg(error.error);
        });
      } else {
        this.backendService.putStudentState(userIdentity.clientId, userList, 0).toPromise().then(response => {
          this.updateData(userList, 0);
          this.snackBar.showSuccessMsg(response.toString());
          this.selection.clear();
        }).catch((error:any) => {
          this.snackBar.showErrorMsg(error.error);
        });;
      }
    } else {
      this.showErrMsg("Please select atleast one student");
    }
  }

  updateData(selectedStudents: number[], status) {
    for (let i = 0; i < selectedStudents.length; i++) {
      let index = this.studentDetails.findIndex(x => x.user.userId === selectedStudents[i]);
      this.studentDetails[index].user.activeState = status;
    };
    this.studentDataSource.data = this.studentDetails
  }

  /** Reset Password */
  resetPassword(student) {
    var userIdentity = this.frontendService.getJWTUserIdentity();
    let selectedIds: number[] = [];
    selectedIds.push(student.studentId)
    this.backendService.putStudentResetPassword(userIdentity.clientId, selectedIds).toPromise().then(response => {
      this.snackBar.showSuccessMsg(response.toString());
    }).catch((error:any) => {
      this.snackBar.showErrorMsg(error);
    });
  }

  searchStudent(data) {
    this.studentFilterData = data;
    this.studentDetails = [];
    this.studentDataSource.data = this.studentDetails;
    if (data) {
      this.currentYearOrder = data.currentYearOrder;
      this.selectedYearOrder = data.selectedYearOrder;
      data.clientId = this.userIdentity.clientId;
      this.backendService.getStudentsDetails(data).toPromise().then((result: any) => {
        if (result) {
          this.studentDetails = result;
          this.studentDataSource.data = this.studentDetails;
          this.statusType = data.activeStatus;
        }
      }).catch((error: any) => {
        this.showErrMsg(error.error);
      })
    } else {
      this.studentDetails = [];
    }
  }

  createStudent() {
    const dialogRef = this.dialog.open(UserManagementAddUserDialogBoxComponent, {
      data: {
        filterType: 'Create',
        withValidations: true,
        userType: 'Student',
        additionalData: ""
      },
      disableClose: true,
      width: '550px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.selection.clear();
    });

  }

  async editStudent(data, type) {
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
    const dialogRef = this.dialog.open(UserManagementAddUserDialogBoxComponent, {
      data: {
        filterType: type,
        withValidations: true,
        userType: 'Student',
        additionalData: data,
      },
      disableClose: true,
      width: '550px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.selection.clear();
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
    this.studentDataSource.data = [];
  }

  changeStatus(element){
    let status: boolean = (element.user.activeState != 1) ? true : false;
    this.updateStudentActiveState(status, element);
  }

}

