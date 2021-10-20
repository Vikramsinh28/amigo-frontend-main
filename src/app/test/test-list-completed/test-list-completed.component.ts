import { Master } from './../../entities/master';
import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Test } from '../../entities';
import { Grade, GradeDivision } from '../../entities';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BackendService } from '../../backend';
import { MatSort } from '@angular/material/sort';
import { EvaluationComponent } from './../evaluation/evaluation.component';
import { TestChapterTopicReportComponent } from 'src/app/visualizations/test-chapter-topic-report/test-chapter-topic-report.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { TestChapterTopicGraphComponent } from 'src/app/visualizations/test-chapter-topic-graph/test-chapter-topic-graph.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';

@Component({
  selector: 'app-test-list-completed',
  templateUrl: './test-list-completed.component.html',
  styleUrls: ['./test-list-completed.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class TestListCompletedComponent implements OnInit {

  @ViewChild (EvaluationComponent) questionGrid : EvaluationComponent

  @Output() selected4Evaluate  = new EventEmitter()
  @Output() selected4Report  = new EventEmitter()
  @Output() selected4Graph  = new EventEmitter()
  @Output() onOpenTestPaper=new EventEmitter();
  userIdentity: any;
  completedExamDs = new MatTableDataSource<Test>();
  currentYear : any;
  completedExams : Test[] = []
  allExams: Test[] = [];
  grades: Grade[] = []
  divisions: any;
  testEvalData: any;
  dateFormat: string;

  @ViewChild('completedSort', {static: true}) sortCE: MatSort;
  @ViewChild('completedPaginator', {static: true}) paginatorCE: MatPaginator;

  @ViewChild('report') report: TestChapterTopicReportComponent;
  @ViewChild(TestChapterTopicGraphComponent) graph: TestChapterTopicGraphComponent;

  expandedCETest: Test | null;
  displayedCEColumns: string[] = [
    'start_date',
    'exam_name',
    'grade',
    'total_marks',
    'subject_name',
    'chapters',
    'currentStatus',
    'nextAction',
    'testReport',
    'testGraph',
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

  constructor(
    public dialog: MatDialog,
    private backendService: BackendService,
    private frontendService: FrontendService
  ) {}


  ngOnInit(): void {

    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
    this.reloadTable();
    this.completedExamDs.sort = this.sortCE;
    this.completedExamDs.paginator = this.paginatorCE;
  }

reloadTable() {
  this.backendService
    .getExam(this.userIdentity.clientId, 'T')
    .toPromise().then((result: string) => {
      this.allExams = JSON.parse(result);
      this.allExams.forEach(exam=>{
        exam.current_status=this.submissionStatus[exam.exam_status].name
      });
      this.completedExams = this.allExams.filter(t=> t.exam_status === 3 || t.exam_status=== 4 || t.exam_status === 5);
      this.completedExamDs.data = this.completedExams;
    }).catch((error:any) => {
                    console.log(error);
                });
}

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.completedExamDs.filter = filterValue;

  if (this.completedExamDs.paginator) {
    this.completedExamDs.paginator.firstPage();
  }
}

nextAction(testData){

  this.testEvalData = testData;
  this.selected4Evaluate.emit(this.testEvalData);
  return;

}

openTestReport(testData)
{
  if (testData.exam_status >= 3)
  {
    this.testEvalData = testData;
    this.selected4Report.emit(this.testEvalData);
    return;
  }
}

expandCETest(element,row)
{
  this.expandedCETest= this.expandedCETest===element? null : element;
}
displayTestPreview(data)
{
    this.onOpenTestPaper.emit(data);
}

openTestGraph(testData)
{
  if (testData.exam_status >= 3)
  {
    this.testEvalData = testData;
    this.selected4Graph.emit(this.testEvalData);
    return;
  }
}

}
