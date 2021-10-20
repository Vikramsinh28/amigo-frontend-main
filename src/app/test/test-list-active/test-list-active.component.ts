import { Master } from './../../entities/master';
import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Test } from '../../entities';
import { Grade, GradeDivision } from '../../entities'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BackendService } from '../../backend';
import { MatSort } from '@angular/material/sort';
import { EvaluationComponent } from './../evaluation/evaluation.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { formatDate } from '@angular/common';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonService } from 'src/app/_helpers/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';


@Component({
  selector: 'app-test-list-active',
  templateUrl: './test-list-active.component.html',
  styleUrls: ['./test-list-active.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TestListActiveComponent implements OnInit {

  @ViewChild (EvaluationComponent) questionGrid : EvaluationComponent

  userIdentity: any;
  activeExamsDS = new MatTableDataSource<Test>();
  currentYear : any;
  activeExams : Test[] = [];
  allExams: Test[] = [];
  grades: Grade[] = []
  divisions: any;
  dateFormat: string;

  @ViewChild('activeSort', {static: true}) sortAE: MatSort;
  @ViewChild('activePaginator', {static: true}) paginatorAE: MatPaginator;
  @Output() onDone =new EventEmitter();
  @Output() onOpenTestPaper=new EventEmitter();
  expandedAETest: Test | null;

  displayedAEColumns: string[] = [
    'start_date',
    'exam_name',
    'grade',
    'total_marks',
    'subject_name',
    'chapters',
    'currentStatus',
    'nextAction',
    'create_user',
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
  ) { }

  ngOnInit(): void {

    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
    this.reloadTable();

    this.activeExamsDS.sort = this.sortAE;
    this.activeExamsDS.paginator = this.paginatorAE;
  }

  reloadTable() {
    this.backendService
      .getExam(this.userIdentity.clientId, 'T')
      .toPromise().then((result: string) => {
        this.allExams = JSON.parse(result);
        this.allExams.forEach(exam=>{
          exam.current_status=this.submissionStatus[exam.exam_status].name
        });

        this.activeExams = this.allExams.filter(t=> t.exam_status === 2);
        this.activeExamsDS.data = this.activeExams;
      }).catch((error:any) => {
                    console.log(error);
                });
}

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.activeExamsDS.filter = filterValue;

  if (this.activeExamsDS.paginator) {
    this.activeExamsDS.paginator.firstPage();
  }
}

expandAETest(element,row)
  {
    this.expandedAETest= this.expandedAETest===element? null : element;
  }

displayTestPreview(data)
  {
     this.onOpenTestPaper.emit(data);
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
        this.onDone.emit(null);
      }),
      (err: string) => {
        console.log(err);
        this.snackBar.showErrorMsg('Some problem while attaching paper.');
      };
    }
  })
}

}
