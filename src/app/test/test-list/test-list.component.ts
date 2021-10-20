import { Master } from '../../entities/master';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Test } from '../../entities';
import { Term, Grade, GradeDivision } from '../../entities'
import { TestUpdateComponent } from '../test-setup/test-setup.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BackendService } from '../../backend';
import { MatSort } from '@angular/material/sort';
import { FrontendService } from 'src/app/_services/frontend.service';
import { formatDate } from '@angular/common';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonService } from 'src/app/_helpers/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';


@Component({
  selector: 'app-test-list',
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TestListComponent implements OnInit {

  userIdentity: any;
  upcomingExamDs = new MatTableDataSource<Test>();
  currentYear : any;
  upcomingExams : Test[] = [];
  allExams: Test[] = [];
  terms: Term[]
  grades: Grade[] = []
  divisions: any;
  dateFormat: string;
  @Output() onDone =new EventEmitter();
  @Output() onOpenTestPaper=new EventEmitter();
  expandedTest: Test | null;

  displayedUEColumns: string[] = [
    'start_date',
    'exam_name',
    'grade',
    'total_marks',
    'subject_name',
    'chapters',
    'currentStatus',
    'nextAction',
    'create_user',
    'action',
    'expand_icon'
  ];


  submissionStatus: Master[] = [
    { id: 0, name: 'Created' },
    { id: 1, name: 'Notified' },
    { id: 2, name: 'Opened' },
    { id: 3, name: 'Closed' },
    { id: 4, name: 'Evaluated' },
    { id: 5, name: 'Score Released' },
  ];

  nextStatus: Master[] = [
    { id: 0, name: 'Notify' },
    { id: 1, name: 'Open' },
    { id: 2, name: 'Close' },
    { id: 3, name: 'Evaluate' },
    { id: 4, name: 'Re-Evaluate' },
    { id: 5, name: 'Re-Evaluate' },
  ];


  editButtonStatus: boolean[] = [];
  constructor(
    public dialog: MatDialog,
    private backendService: BackendService,
    private snackBar: CommonService,
    private frontendService: FrontendService
  ) {}

  @ViewChild('upcomingSort', {static: true}) sortUE: MatSort;
  @ViewChild('upcomingPaginator', {static: true}) paginatorUE: MatPaginator;

  ngOnInit(): void {

    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
    this.reloadTable();

    this.upcomingExamDs.sort = this.sortUE;
    this.upcomingExamDs.paginator = this.paginatorUE;
  }

addTest(): void {
    const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;

      dialogConfig.data = {
          'test' : null,
         }
    const dialogRef = this.dialog.open(TestUpdateComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      this.reloadTable();
    });
  }

editTest(test: Test): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
        'test' : test,
    }
    const dialogRef = this.dialog.open(TestUpdateComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      this.reloadTable();
    });
  }

deleteTest(test: Test): void {
  const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
    width: '300px',
    disableClose: true,
    data: {title:'Confirm',message:'Are you sure you want to delete test \''+test.exam_name+'\' ?',yes:'Delete',no:'Cancel'}
  });
  dialogRef.afterClosed().subscribe(result=>{
    if(result){
      this.backendService.removeExam(test.term_exam_id).toPromise().then(
        result => {
            this.reloadTable()
        }
    )
    this.snackBar.showSuccessMsg('Test \''+test.exam_name+'\' deleted successfully !');
    }
  },(error:any) => {
                    console.log(error);
                })
  }

reloadTable() {
    this.backendService
      .getExam(this.userIdentity.clientId, 'T')
      .toPromise().then((result: string) => {
        this.allExams = JSON.parse(result);
        this.allExams.forEach(exam=>{
          exam.current_status=this.submissionStatus[exam.exam_status].name
        });
        this.upcomingExams = this.allExams.filter(t=> t.exam_status === 0 || t.exam_status=== 1);
        this.upcomingExamDs.data = this.upcomingExams;
      },(error:any) => {
                    console.log(error);
                });
}

  releaseScore() {
    console.log('releaseScore -To be implemented yet');
    // TODO: Use this function to release the score.
  }

  evaluateSubmissions() {
    console.log('evaluateSubmissions -To be implemented yet');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.upcomingExamDs.filter = filterValue;

    if (this.upcomingExamDs.paginator) {
      this.upcomingExamDs.paginator.firstPage();
    }
  }

  nextAction(testData){

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {title:'Confirm',message:'Are you sure you want to change status to \''+this.nextStatus[testData.exam_status].name+'\' for the test \''+testData.exam_name+'\' ?',
      yes:'Yes',no:'No'}
    });
    dialogRef.afterClosed().subscribe(result=>{
      if(result)
      {
        const fd: FormData = new FormData();
      fd.append('exam_id', testData.exam_id + '');
      fd.append('subject_id', testData.subject_id + '');
      fd.append('user_id', this.userIdentity.userId);
      fd.append('exam_status', testData.exam_status+1);
      fd.append('update_exam_only', 'true');
      fd.append("client_id", this.userIdentity.clientId)
      fd.append("year", this.userIdentity.currentYearId)
      fd.append("start_date", formatDate(testData.start_date, 'yyyy-MM-dd', 'en-US'))
      fd.append("end_date", formatDate(testData.end_date, 'yyyy-MM-dd', 'en-US'))

      this.backendService
        .addOrUpdateTest(fd)
        .toPromise()
        .then((result: string) => {
          var response = JSON.parse(result);
          testData.exam_status = testData.exam_status + 1
          this.snackBar.showSuccessMsg('Status of the test \''+testData.exam_name+'\' has been changed. Now test is locked to be edited');
          this.reloadTable();
          if(testData.exam_status==2)
          {
            this.onDone.emit(null);
          }
        }),
        (err: string) => {
          console.log(err);
          this.snackBar.showErrorMsg('Some problem while attaching paper.');
        };
      }
    })
  }

  expandTest(element,row)
  {
    this.expandedTest= this.expandedTest===element? null : element;
  }
  displayTestPreview(data)
  {
    this.onOpenTestPaper.emit(data);
  }
  reOpenTest(testData)
  {
    console.log('reOpenTest -To be implemented yet');
  }

}

