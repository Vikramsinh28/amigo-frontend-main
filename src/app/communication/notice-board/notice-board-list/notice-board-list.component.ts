import { animate, state, style, transition, trigger } from '@angular/animations';
import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
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

@Component({
  selector: 'app-notice-board-list',
  templateUrl: './notice-board-list.component.html',
  styleUrls: ['./notice-board-list.component.scss'],
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

export class NoticeBoardListComponent implements OnInit, AfterViewInit {

  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  userIdentity: any;
  userRole: string;
  dateFormat: string;
  noticeBoardColumnsToDisplay: string[];
  expandedNotice: Communication | null;
  fromDate: Date;
  toDate: Date;
  minFromDate: Date;
  maxFromDate: Date;
  minToDate: Date;
  maxToDate: Date;
  generalNoticeDataSource = new MatTableDataSource<Communication>();
  generalNotice: Communication[];
  @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;
  selectedIsShared: any;
  @Output() onEdit = new EventEmitter();
  @ViewChild('noticePaginator', { static: true }) noticePaginator: MatPaginator;
  @ViewChild('noticeSort', { static: true }) sort: MatSort;
  fromDateRef = null;
  toDateRef = null;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    public commonFunctions: CommunicationCommonFunctions) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
    this.dateFormat = this.userIdentity.dateFormat;
  }


  ngOnInit(): void {
    this.generalNoticeDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Headline': return item.headline;
        case 'Shared Date': return item.sharedDate;
        default: return item[property];
      }
    };

    this.generalNoticeDataSource.paginator = this.noticePaginator;
    this.generalNoticeDataSource.sort = this.sort;

    if (this.userRole != 'Student') {

      this.config.isBypassAcl = true;
      this.config.isYearRequired = true;
      this.config.isGradeRequired = false;
      this.config.isDivisionRequired = false;
      this.config.isMultiGrade = true;
      this.config.isMultiDivision = true;
      this.config.isSubjectVisible = false;
      this.config.isStudentVisible = false;
      this.config.isDivisionAutoSelect = true;
      //this.config.isGradeAutoSelect = true;

      this.noticeBoardColumnsToDisplay = [
        'isImportant',
        'Shared Date',
        'Headline',
        'isShared',
        'edit',
        'delete',
        'expand_icon',
      ];
    }
    else {
      this.noticeBoardColumnsToDisplay = [
        'isImportant',
        'Shared Date',
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
    if (this.userRole == 'Student') {
      this.setFilterForStudent();
    }
    else this.setFilterForNonStudents();

    this.searchNotices(true, true);
  }

  setFilterForNonStudents() {
    let filterValue = {
      year: this.userIdentity.currentYearId
    }
    this.filter.value = filterValue;
  }
  setFilterForStudent() {
    let filterValue = {
      year: this.userIdentity.currentYearId,
      grade: this.userIdentity.gradeId,
      division: this.userIdentity.studentGradeDivisionId
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

  async shareWithStudent(event, element, rowNo) {
    event.stopPropagation();
    let result: any = await this.commonFunctions.shareWithStudents(element.communicationId)
    if (result !== 1) {
      this.commonFunctions.showErrorMsg("Sharing status not updated. Something went wrong!")
    }
    else {
      this.generalNotice[rowNo].sharedDate = new Date();
      this.commonFunctions.showSucessMsg("Sharing status updated!")
    }

  }

  editNotice(event, element) {
    event.stopPropagation();
    this.onEdit.emit(element);
  }

  async deleteNotice(event, data, rowNo) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Confirm', message: 'Are you sure you want to delete communication?', yes: 'Delete', no: 'Cancel' }
    });

    dialogRef.afterClosed().subscribe(async r => {
      let result: any = await this.commonFunctions.deleteCommunication(data.communicationId)

      if (result !== 1) {
        this.commonFunctions.showErrorMsg("Communication not deleted. Something went wrong!")
      }
      else {
        this.generalNotice.splice(rowNo, 1);
        this.generalNoticeDataSource.data = this.generalNotice;
        this.commonFunctions.showSucessMsg("Communication deleted!")
      }
    });
  }

  downloadFile(element: Communication) {
    this.commonFunctions.downloadFile(element.communicationId, element.attachmentFileName);
  }

  searchNotices(skipValidation = false, isOnLoad = false) {
    if (!skipValidation) {
      if (!this.filter.validateForm()) return;
      if (!this.commonFunctions.ValidateDates(this.fromDate, this.toDate, "Created")) {
        return;
      }
    }

    this.generalNotice = []
    this.generalNoticeDataSource.data = []

    let filterValues = this.filter.value;

    let data = {
      year: filterValues.year,
      grade: filterValues.grade,
      division: filterValues.division,
      toDate: this.toDate ? formatDate(this.toDate, 'yyyy-MM-dd', 'en-US') : '',
      fromDate: this.fromDate
        ? formatDate(this.fromDate, 'yyyy-MM-dd', 'en-US')
        : '',
      isShared:
        this.selectedIsShared !== undefined ? this.selectedIsShared : '',
      isOnLoad: isOnLoad
    };

    this.backendService
      .getNotices(data)
      .toPromise()
      .then((result: any) => {
        if (result && result.length > 0) {
          this.generalNotice = result as Communication[];
          this.generalNoticeDataSource.data = this.generalNotice;
        }
      })
      .catch((e) => {
        console.error(e.error);
      });
  }

  refresh() {
    this.filter.reset();
    this.generalNotice = []
    this.generalNoticeDataSource.data = []
    this.clearDate('from');
    this.clearDate('to');
    this.selectedIsShared = ''
    if (this.userRole == 'Student') {
      this.setFilterForStudent();
    }
    else this.setFilterForNonStudents();
    this.searchNotices(false, true);
  }

  clearDate(type) {
    if (type == 'from') {
      this.fromDate = null;
      this.fromDateRef = null;
    }
    else {
      this.toDate = null;
      this.toDateRef = null;
    }
  }

}
