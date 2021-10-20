import { EmployeeAccessSearch } from './../../entities/employee-access';
import { EmployeeAccessAddEditComponent } from './../employee-access-add-edit/employee-access-add-edit.component';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BackendService } from 'src/app/backend';
import { CommonGradeDivisionComponent, CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-employee-search',
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.scss']
})
export class EmployeeSearchComponent implements OnInit, AfterViewInit {

  clientRoleList: any[] = [];
  currentYear: any;
  userIdentity: any;
  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;
  controlForm: FormGroup;
  subjects: any[] = [];
  employeeColumnsToDisplay: string[];
  employeeAccessDataCached: EmployeeAccessSearch[] = [];
  employeeAccessData: EmployeeAccessSearch[] = [];
  employeeAccessDataSource = new MatTableDataSource<any>();
  @ViewChild('Paginator', {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog)
    {
      this.userIdentity = this.frontendService.getJWTUserIdentity();
    }

  ngOnInit(): void {
    this.employeeAccessDataSource.paginator = this.paginator;
    this.employeeAccessDataSource.sort = this.sort;
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.createForm();
    this.setCommonGradeDivisionConfig();
    this.getClientRoles();
    this.getSubjects();

    this.employeeColumnsToDisplay = [
      'clientEmployeeNo',
      'roleName',
      'name',
      'employeeAccessDisplay',
      'edit',
    ];
  }

   ngAfterViewInit(): void {
    this.filter.value={year: this.userIdentity.currentYearId};
    setTimeout(()=>{this.searchEmployeeData(true);}, 1000)
  }

  getClientRoles() {
    this.backendService
      .getClientRoles(this.userIdentity.clientId)
      .toPromise().then((data: any) => {
        this.clientRoleList = data;
        let index = this.clientRoleList.findIndex(crl=> crl.roleName === 'Student');
        this.clientRoleList.splice(index,1);
      }).catch((error:any) => {
                    console.log(error);
                });
  }

  createForm()
  {
    this.controlForm = new FormGroup({
      commonGradeDivision: new FormControl(null),
      empName: new FormControl(null),
      userRole: new FormControl(null),
      subject: new FormControl(null)
    });
  }

  setCommonGradeDivisionConfig()
  {
    this.config.isYearRequired = true;
    this.config.yearValue = this.currentYear;
    this.config.isGradeRequired = false;
    this.config.isGradeVisible = true
    this.config.isMultiGrade = false

    this.config.isDivisionRequired = false;
    this.config.isDivisionVisible = true
    this.config.isMultiDivision = false

    this.config.isSubjectVisible = false;
    this.config.isStudentVisible = false
  }

  searchEmployeeData(onLoad= false)
  {
    if (!onLoad)
      if (!this.filter.validateForm())
        return;


    let data: any = {
      clientYearId: this.controlForm.value.commonGradeDivision.year,
      roleId: this.controlForm.controls.userRole.value,
      subjectId: this.controlForm.controls.subject.value,
      gradeId: this.controlForm.value.commonGradeDivision.grade,
      gradeDivisionId: this.controlForm.value.commonGradeDivision.division,
      empName: this.controlForm.controls.empName.value
    }

    this.backendService.getEmployeeAccessData(data).toPromise()
    .then((result: EmployeeAccessSearch[]) => {
      this.employeeAccessDataCached = result;
      this.employeeAccessData = this.assignEmployeeAccessDisplay(this.employeeAccessDataCached)
      this.employeeAccessDataSource.data = this.employeeAccessData;
    }
    ).catch((e) =>{ console.error(e.error)})
  }

  assignEmployeeAccessDisplay(eadata : EmployeeAccessSearch[])
  {
    eadata.forEach(ead =>
    {
      ead.name = ead.firstName + ' ' + ead.lastName;

      ead.employeeAccessDisplay = ead.employeeAccess ? ead.employeeAccess.reduce(function (pv, cv) {
            if (pv['value']) {
              if (cv.grade) {
                if (cv.division && cv.subject) {
                  pv['value'] += ', ' + 'Grade-' + cv.grade + '-' + cv.division + '-' + cv.subject;
                } else if (cv.subject) {
                  pv['value'] += ', ' + 'Grade-' + cv.grade + '-' + cv.subject;
                } else {
                  pv['value'] += ', ' + 'Grade-' + cv.grade;
                }
              }
            } else {
              if (cv.grade) {
                if (cv.division && cv.subject) {
                  pv['value'] =
                    'Grade-' + cv.grade + '-' + cv.division + '-' + cv.subject;
                } else if (cv.subject) {
                  pv['value'] = 'Grade-' + cv.grade + '-' + cv.subject;
                } else {
                  pv['value'] = 'Grade-' + cv.grade;
                }
              }
            }
            return pv;
          }, {}) : (ead.roleName == 'Management' ? '*' : '');
      })

        return eadata;
  }
  getSubjects()
  {
    this.backendService.getClientSubjects().toPromise()
    .then((result: any) =>{
      this.subjects = result;
    }).catch((error:any) => {
                    console.log(error);
                });
  }

  editEmployeeAccess(element, rowNo)
  {
    const dialogRef = this.dialog.open(EmployeeAccessAddEditComponent, {
      data: element,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((data) =>{
      this.employeeAccessData[rowNo].employeeAccess = data.employeeAccess;
      this.employeeAccessData = this.assignEmployeeAccessDisplay(this.employeeAccessData)
      this.employeeAccessDataSource.data = this.employeeAccessData;
    });

  }
  reset()
  {
    this.employeeAccessDataSource.data = [];
    this.controlForm.reset();
    this.filter.reset();
    this.filter.value={year:this.userIdentity.currentYearId};
    setTimeout(()=>{this.searchEmployeeData(true);}, 500)
  }
}
