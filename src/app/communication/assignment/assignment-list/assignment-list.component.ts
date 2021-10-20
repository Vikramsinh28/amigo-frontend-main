import { animate,state,style,transition,trigger,} from '@angular/animations';
import { Component,OnInit,ViewChild,EventEmitter,Output,AfterViewInit,} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/backend';
import { Communication } from 'src/app/entities/communication';
import { CommonGradeDivisionComponent,CommonGradeDivisionConfiguration,} from 'src/app/_components/common-grade-division/common-grade-division.component';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { formatDate } from '@angular/common';
import { CommunicationCommonFunctions} from 'src/app/communication/communication-common'
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PdfgenerationService } from 'src/app/_services/pdf-generation.service';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.scss'],
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
export class AssignmentListComponent implements OnInit, AfterViewInit {
  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  dateFormat: string;
  fromDate: Date;
  toDate: Date;
  minFromDate: Date;
  maxFromDate: Date;
  minToDate: Date;
  maxToDate: Date;
  userIdentity: any;
  userRole: string;
  homeWorkData: Communication[];
  homeWorkDataSource = new MatTableDataSource<Communication>();
  @ViewChild('assignmentPaginator', {static: true}) assignmentPaginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  expandedHomework: Communication | null;
  homeworkColumnsToDisplay: string[];
  @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;
  @Output() onEdit = new EventEmitter();
  fromDateRef = null;
  toDateRef = null;
  dateLabel: string;

  selectedIsShared: any;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    public commonFunctions: CommunicationCommonFunctions,
    public pdfservice:PdfgenerationService,

  ) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
    this.dateFormat = this.userIdentity.dateFormat;
  }

  ngOnInit(): void {
    this.homeWorkDataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'Update Date': return item.updateDate;
        case 'Shared Date': return item.sharedDate;
        case 'Due Date': return item.dueDate;
        case 'Subject': return item.subjectName;
        case 'Division': return item.grade;
        case 'Headline': return item.headline;
        default: return item[property];
      }
    };
    this.homeWorkDataSource.sort = this.sort;
    this.homeWorkDataSource.paginator = this.assignmentPaginator;

    if (this.userRole == 'Teacher' || this.userRole == 'Management')
    {
      this.dateLabel = "Created";
      this.config.isMultiGrade = false;
      this.config.isYearRequired = false;
      this.config.isGradeRequired = false;
      this.config.isDivisionRequired = false;
      this.config.isSubjectRequired = false;
      this.config.isDivisionAutoSelect = true;
      if (this.userRole == 'Management')
        this.config.isBypassAcl = true;

      this.homeworkColumnsToDisplay = [
        'Update Date',
        'Shared Date',
        'Due Date',
        'Subject',
        'Division',
        'Headline',
        'isShared',
        'edit',
        'delete',
        'expand_icon',
      ];
    }
    else
    {
      this.dateLabel = "Shared";
      this.config.isMultiGrade = false;
      //this.config.isMultiSubject = false;
      this.config.isYearRequired = false;
      this.config.isGradeRequired = false;
      this.config.isMultiGrade = false;
      this.config.isDivisionRequired = false;
      this.config.isMultiDivision = false;
      this.config.isSubjectRequired = false;
      this.config.isDivisionAutoSelect = false;
      this.config.isYearDisabled = true;
      this.config.isGradeDisabled = true;
      this.config.isDivisionDisabled = true;

      this.homeworkColumnsToDisplay = [
        'Shared Date',
        'Due Date',
        'Subject',
        'Headline',
        'expand_icon',
      ];
    }
  }

  ngAfterViewInit(): void {
    if (this.userRole == "Student")
    {
      this.setFilterForStudent();
    }
    else this.setFilterForNonStudents();

    this.searchAssignments(true);
  }

  setFilterForNonStudents()
  {
    let filterValue = {
      year: this.userIdentity.currentYearId
    }
    this.filter.value = filterValue;
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

  searchAssignments(isOnLoad = false) {

    if (!this.commonFunctions.ValidateDates(this.fromDate, this.toDate, "Created"))
    {
      return;
    }

    this.homeWorkData = [];
    this.homeWorkDataSource.data = [];

    let filterValues = this.filter.value;

    let data = {
      year: filterValues.year,
      division: filterValues.division,
      subject: filterValues.subject ? filterValues.subject : '' ,
      toDate: this.toDate ? formatDate(this.toDate, 'yyyy-MM-dd', 'en-US') : '',
      fromDate: this.fromDate
        ? formatDate(this.fromDate, 'yyyy-MM-dd', 'en-US')
        : '',
      isShared:
        this.selectedIsShared !== undefined ? this.selectedIsShared : '',
      isOnLoad : isOnLoad
    };

    this.backendService
      .geAssignment(data)
      .toPromise()
      .then((result: any) => {
        if (result && result.length > 0) {
          this.homeWorkData = result as Communication[];
          this.homeWorkDataSource.data = this.homeWorkData;
          var date = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
          this.homeWorkDataSource.data.forEach(data=>{
            data.eventCompleted = (formatDate(data.dueDate, 'yyyy-MM-dd', 'en-US') < date) ? true : false;
          })
        }
      })
      .catch((e) => {
        console.error(e.error);
      });
  }

  editAssignment(event, data) {
    event.stopPropagation();
    this.onEdit.emit(data);
  }

  async deleteAssignment(event, data, rowNo) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: true,
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
      this.homeWorkData.splice(rowNo, 1);
      this.homeWorkDataSource.data = this.homeWorkData;
      this.commonFunctions.showSucessMsg("Communication deleted!")
    }
  });
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
      this.homeWorkData[rowNo].sharedDate = new Date();
      this.commonFunctions.showSucessMsg("Sharing status updated!")
    }

  }

  refresh() {
    if (this.userRole == 'Teacher')
    {
      this.filter.reset();
    }
    else
    {
        this.filter.value = {subject: 'null'};
    }
    this.homeWorkData = [];
    this.homeWorkDataSource.data = [];
    this.selectedIsShared = '';
    this.clearDate('from');
    this.clearDate('to');
    this.selectedIsShared = ''
    this.searchAssignments(true);
  }

  downloadFile(element: Communication) {
    this.commonFunctions.downloadFile(element.communicationId, element.attachmentFileName);
  }
  showPaper(data) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      testPaperId: data.attachedPaperId,
      attachmentFileName: data.attachedPaperName,
      withAnswerKey: false,
      isFrozen: true,
      withMarks: false,
      subject: this.homeWorkDataSource.data[0].subjectName,
      grade: data.grade,
    };
    const dialogRef = this.dialog.open(
      PaperPreviewDialogBoxComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {});
  }
  downloadPaper(element)
  {
    let selectedTestPaperId = element.attachedPaperId;
    let isFrozen = true;
    let questions: any[] = [];
    let data ={
      testPaperId: element.attachedPaperId,
      attachmentFileName: element.attachedPaperName,
      withAnswerKey: true,
      isFrozen: true,
      withMarks: true,
      grade: element.grade,
      subject: element.subjectName,
      totalmarks:null,
      date:null,
      duration:null,
      instruction:null,
      footerText:null,
      language:""
    };
    this.backendService
      .getTestPaperPreview(selectedTestPaperId,isFrozen)
      .toPromise().then((result: any) => {
        questions = result;
      this.pdfservice.testPaperPdfGeneration(questions, data, false);

      }).catch((error:any) => {
                    console.log(error);
                });

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
