import { animate, state, style, transition, trigger } from '@angular/animations';
import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/backend';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { Communication } from 'src/app/entities/communication';
import { CommonGradeDivisionComponent, CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { CommunicationCommonFunctions } from '../../communication-common';
import { RemarkStudentListComponent } from '../remark-student-list/remark-student-list.component';

@Component({
  selector: 'app-remark-list',
  templateUrl: './remark-list.component.html',
  styleUrls: ['./remark-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class RemarkListComponent implements OnInit, AfterViewInit {

  remarkDataSource = new MatTableDataSource<Communication>();
  remarkColumnsToDisplay: string[];
  expandedNotice: Communication | null;
  userIdentity: any;
  userRole: any;
  dateFormat: string;
  fromDate: Date;
  toDate: Date;
  minFromDate: Date;
  maxFromDate: Date;
  minToDate: Date;
  maxToDate: Date;
  remarks: Communication[];
  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;
  @ViewChild('remarkPaginator', {static: true}) remarkPaginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  selectedIsShared: any;
  selectedRemarkType: any;
  @Output() onEdit = new EventEmitter();
  fromDateRef = null;
  toDateRef = null;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    public commonFunctions: CommunicationCommonFunctions
  )
  {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
    this.dateFormat = this.userIdentity.dateFormat;
  }

  ngOnInit(): void {
    this.remarkDataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'Headline': return item.headline;
        case 'Shared Date': return item.sharedDate;
        case 'Remark Type': return item.remarkType;
        default: return item[property];
      }
    };
    this.remarkDataSource.sort = this.sort;
    this.remarkDataSource.paginator = this.remarkPaginator;

    if (this.userRole != 'Student') {
      this.remarkColumnsToDisplay = [
        'isImportant',
        'Shared Date',
        'Remark Type',
        'Headline',
        'isShared',
        'edit',
        'delete',
        'expand_icon',
      ];

      if (this.userRole == 'Admin' || this.userRole == 'Management')
      {
        this.config.isBypassAcl = true
        this.config.isBypassAclShowAllYears = true
      }
      this.config.isYearRequired = true
      this.config.isGradeVisible = true
      this.config.isGradeRequired = false
      this.config.isMultiGrade = false
      this.config.isDivisionVisible = true
      this.config.isDivisionRequired = false
      this.config.isMultiDivision = false
      this.config.isDivisionAutoSelect = false
      this.config.isStudentVisible = true
      this.config.isStudentRequired = false
      this.config.isSubjectVisible = false
    }
    else
    {
      this.remarkColumnsToDisplay = [
        'isImportant',
        'Shared Date',
        'Remark Type',
        'Headline',
        'expand_icon',
      ];

      this.config.isYearRequired = false
      this.config.isYearDisabled = true
      this.config.isGradeVisible = true
      this.config.isGradeRequired = false
      this.config.isMultiGrade = false
      this.config.isGradeDisabled = true
      this.config.isDivisionVisible = true
      this.config.isDivisionRequired = false
      this.config.isMultiDivision = false
      this.config.isDivisionAutoSelect = false
      this.config.isDivisionDisabled = true
      this.config.isStudentVisible = false
      this.config.isStudentRequired = false
      this.config.isSubjectVisible = false
    }
  }

  ngAfterViewInit(): void {
    if (this.userRole == "Student")
    {
      this.setFilterForStudent();
    }
    else
    {
      this.setFilterForNonStudents();
    }

    this.searchRemarks(true);
  }

  setFilterForStudent()
  {
    let filterValue = {
      year: this.userIdentity.currentYearId,
      grade: this.userIdentity.gradeId,
      division: this.userIdentity.studentGradeDivisionId
    }
    this.filter.value = filterValue;
  }

  setFilterForNonStudents()
  {
    let filterValue = {
      year: this.userIdentity.currentYearId
    }
    this.filter.value = filterValue;
  }

  setupMinMaxDate(startDate) {
    this.minToDate = startDate;
    this.maxToDate = new Date(
      startDate.getFullYear() + 1,
      startDate.getMonth(),
      startDate.getDate()
    );
  }

  onFromDateChange(startDate) {
    this.minToDate = null;
    this.maxToDate = null;
    this.fromDate = new Date(
      startDate.value._i.year,
      startDate.value._i.month,
      startDate.value._i.date
    );
    this.setupMinMaxDate(this.fromDate);
  }

  onToDateChange(toDate) {
    this.toDate = new Date(
      toDate.value._i.year,
      toDate.value._i.month,
      toDate.value._i.date
    );
  }

  async shareWithStudent(event, element, rowNo)
  {
    event.stopPropagation();
    let result:any = await this.commonFunctions.shareWithStudents(element.communicationId)
    if (result !== 1)
    {
      this.commonFunctions.showErrorMsg("Sharing status not updated. Something went wrong!")
    }
    else
    {
      this.remarks[rowNo].sharedDate = new Date();
      this.commonFunctions.showSucessMsg("Sharing status updated!")
    }

  }

  editRemark(event, element){
    event.stopPropagation();
    this.onEdit.emit(element);
  }

  async deleteRemark(event, data, rowNo) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Confirm', message: 'Are you sure you want to delete communication?', yes: 'Delete', no: 'Cancel' }
    });

    dialogRef.afterClosed().subscribe(async r => {
    let result: any = await this.commonFunctions.deleteCommunication(data.communicationId)

    if (result !== 1)
    {
      this.commonFunctions.showErrorMsg("Communication not deleted. Something went wrong!")
    }
    else
    {
      this.remarks.splice(rowNo, 1);
      this.remarkDataSource.data = this.remarks;
      this.commonFunctions.showSucessMsg("Communication deleted!")
    }
  });
  }

  downloadFile(element: Communication)
  {
    this.commonFunctions.downloadFile(element.communicationId, element.attachmentFileName);
  }

  searchRemarks(isOnLoad = false)
  {
    if (!this.commonFunctions.ValidateDates(this.fromDate, this.toDate, "Created"))
    {
      return;
    }

    this.remarks = []
    this.remarkDataSource.data = []

    let filterValues = this.filter.value;

    let data = {
      year: filterValues.year,
      division: filterValues.division,
      grade: filterValues.grade,
      student: filterValues.student && filterValues.student.length > 0 ? filterValues.student : '' ,
      toDate: this.toDate ? formatDate(this.toDate, 'yyyy-MM-dd', 'en-US') : '',
      fromDate: this.fromDate
        ? formatDate(this.fromDate, 'yyyy-MM-dd', 'en-US')
        : '',
      isShared:
        this.selectedIsShared !== undefined ? this.selectedIsShared : '',
      remarkType:
        this.selectedRemarkType !== undefined ? this.selectedRemarkType : '',
      isOnLoad: isOnLoad
    };

    this.backendService
      .geRemark(data)
      .toPromise()
      .then((result: any) => {
        if (result && result.length > 0) {
          this.remarks = result as Communication[];
          this.remarkDataSource.data = this.remarks;
        }
      })
      .catch((e) => {
        console.error(e.error);
      });
  }

  showStudentDetails(element)
  {
    const dialogRef = this.dialog.open(RemarkStudentListComponent, {
      width: '300px',
      data: { communicationId: element.communicationId }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
      }
    });
  }

  refresh() {
    this.filter.reset();
    this.remarks = []
    this.remarkDataSource.data = []
    this.clearDate('from');
    this.clearDate('to');
    this.selectedIsShared = ''
    this.selectedRemarkType = ''
    if (this.userRole == "Student")
    {
      this.setFilterForStudent();
    }
    else
    {
      this.setFilterForNonStudents();
    }
    this.searchRemarks(true);
  }

  clearDate(type){
    if(type == 'from')
    {
      this.fromDate = null;
      this.fromDateRef = null;
    }
    else{
      this.toDate = null;
      this.toDateRef = null;
    }
  }

}
