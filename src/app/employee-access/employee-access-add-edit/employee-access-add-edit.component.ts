import { CommonService } from './../../_helpers/common';
import { BackendService } from 'src/app/backend';
import { EmployeeAccess, userRole } from './../../entities/employee-access';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonGradeDivisionComponent, CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-employee-access-add-edit',
  templateUrl: './employee-access-add-edit.component.html',
  styleUrls: ['./employee-access-add-edit.component.scss']
})
export class EmployeeAccessAddEditComponent implements OnInit, AfterViewInit{

  employeeColumnsToDisplay: string[];
  employeeAccessDataSource = new MatTableDataSource<any>();
  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;
  @ViewChild('Paginator', {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  userIdentity: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private frontendService: FrontendService,
    private backendService: BackendService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<EmployeeAccessAddEditComponent>)
  {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
  }

  ngOnInit(): void {
    this.employeeColumnsToDisplay = [
      'srNo',
      'year',
      'grade',
      'division',
      'subject',
      'delete',
    ];
    this.data["employeeAccess"] = this.data["employeeAccess"] || [];

    this.employeeAccessDataSource.data = this.data.employeeAccess;
    this.setCommonGradeDivisionConfig();
    this.employeeAccessDataSource.paginator = this.paginator;

    this.employeeAccessDataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'year': return item.yearLabel;
        case 'grade': return item.grade;
        case 'subject': return item.subject;
        case 'division': return item.division;
        default: return item[property];
      }
    };
    this.employeeAccessDataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    this.filter.value={year: this.userIdentity.currentYearId};
  }

  setCommonGradeDivisionConfig()
  {
    if (this.data.roleName == 'Teacher' ) // teacher
    {
      this.config.isYearRequired = true;
      this.config.isGradeRequired = true;
      this.config.isGradeVisible = true
      this.config.isMultiGrade = false

      this.config.isDivisionRequired = true;
      this.config.isDivisionVisible = true
      this.config.isMultiDivision = true

      this.config.isSubjectVisible = true;
      this.config.isSubjectRequired = true;

      //this.config.isMultiSubject = false;
      this.config.isStudentVisible = false;
    }
    else if(this.data.roleName == 'Grade-Supervisor') // gradeSuperviser
    {
      this.config.isYearRequired = true;

      this.config.isGradeRequired = true;
      this.config.isGradeVisible = true
      this.config.isMultiGrade = false;

      this.config.isDivisionVisible = false;
      this.config.isSubjectVisible = false;
    }

  }

  deleteEmployeeAccess(element, rowNo)
  {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm', message: 'Are you sure you want to delete this access?', yes: 'Yes', no: 'No'
      },
      disableClose: true,
    });
    dialogRef.afterClosed().toPromise().then(result =>{
      if(result){
        let ids: any[] = [element.employeeAccessId];
        this.backendService.deleteEmployeeAccessData(ids)
        .toPromise()
        .then((result) => {
          this.data.employeeAccess.splice(rowNo, 1);
          this.employeeAccessDataSource.data = this.data.employeeAccess;
          this.commonService.showSuccessMsg("Employee Access deleted!");
        })
        .catch((error:any) => {
                    console.log(error);
                })
      }
    });
  }

  addEmployeeAccess(){
    if (!this.filter.validateForm())
    {
      return;
    }


    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm', message: 'Are you sure you want to add this access?', yes: 'Yes', no: 'No'
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result =>{
      if(result){
        let newAccesses : EmployeeAccess[] = [];
        let tableAccess: EmployeeAccess[] = [];
        let filterValue = this.filter.value;

        if (filterValue && filterValue.division)
        {
          filterValue.division.forEach((division, i) => {
            let ac: EmployeeAccess = {};
            let tc: EmployeeAccess = {};
            ac.gradeId = tc.gradeId = filterValue.grade;
            ac.gradeDivisionId = tc.gradeDivisionId = division;
            ac.subjectId = tc.subjectId = filterValue.subject ? filterValue.subject : '';
            ac.employeeId = tc.employeeId = this.data.employeeId;

            tc.grade = filterValue.gradeName;
            tc.division = filterValue.divisionName && filterValue.divisionName[i] ? filterValue.divisionName[i] : '';
            tc.subject = filterValue.subjectName ? filterValue.subjectName : '';
            newAccesses.push(ac);
            tableAccess.push(tc);
          });
        }
        else
        {
          let ac: EmployeeAccess = {};
          let tc: EmployeeAccess = {};
          ac.gradeId = tc.gradeId = filterValue.grade;
          ac.gradeDivisionId = tc.gradeDivisionId = filterValue.division ? filterValue.division : '';
          ac.subjectId = tc.subjectId = filterValue.subject ? filterValue. subject : '';
          ac.employeeId = tc.employeeId = this.data.employeeId;

          tc.grade = filterValue.gradeName;
          tc.division = filterValue.divisionName ? filterValue.divisionName : '';
          tc.subject = filterValue.subjectName ? filterValue.subjectName : '';
          newAccesses.push(ac);
          tableAccess.push(tc);
        }

        if (newAccesses.length > 0){
          this.backendService.postEmployeeAccessData(newAccesses).toPromise()
          .then((result: EmployeeAccess[]) => {
              result.forEach((r,i) => {
                tableAccess[i].employeeAccessId = r.employeeAccessId;
              });
              this.data.employeeAccess.push(...tableAccess);
              this.employeeAccessDataSource.data = this.data.employeeAccess;
              this.commonService.showSuccessMsg("Employee Access added!");
              this.reset();
          }).catch((error) => {
             //console.error(error);
              this.commonService.showErrorMsg(error.error.message);
          });
        }
      }
    });
  }

  reset(){
    this.filter.reset();
    this.filter.value={year: this.userIdentity.currentYearId};
  }

  close()
  {
    this.dialogRef.close(this.data);
  }
}
