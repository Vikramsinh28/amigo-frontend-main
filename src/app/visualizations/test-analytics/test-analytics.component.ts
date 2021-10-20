import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FrontendService } from 'src/app/_services/frontend.service';
import { BackendService } from '../../backend';
import { Test } from '../../entities';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TestChapterTopicGraphComponent } from '../test-chapter-topic-graph/test-chapter-topic-graph.component';
import { TestChapterTopicReportComponent } from '../test-chapter-topic-report/test-chapter-topic-report.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';

@Component({
  selector: 'app-test-analytics',
  templateUrl: './test-analytics.component.html',
  styleUrls: ['./test-analytics.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TestAnalyticsComponent implements OnInit {

  userIdentity: any;
  allExams: Test[] = [];
  completedExams: Test[] = [];
  completedExamDs = new MatTableDataSource < Test > ();
  dateFormat: string;
  testEvalData: any;

  @ViewChild('completedSort', { static: true }) sortCE: MatSort;
  @ViewChild('completedPaginator', { static: true }) paginatorCE: MatPaginator;
  @ViewChild(TestChapterTopicReportComponent) report: TestChapterTopicReportComponent;
  @ViewChild(TestChapterTopicGraphComponent) graph: TestChapterTopicGraphComponent;


  expandedCETest: Test | null;

  displayedCEColumns: string[] = [
    'start_date',
    'exam_name',
    'grade',
    'total_marks',
    'subject_name',
    'chapters',
    'testReport',
    'testGraph',
    'create_user',
    'expand_icon'
  ];


  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
    this.loadData();
    this.completedExamDs.sort = this.sortCE;
    this.completedExamDs.paginator = this.paginatorCE;
  }

  loadData() {
    this.backendService
      .getExam(this.userIdentity.clientId, 'T')
      .toPromise().then((result: string) => {
        this.allExams = JSON.parse(result);
        this.completedExams = this.allExams.filter(t => t.exam_status === 5);
        this.completedExamDs.data = this.completedExams;
        console.log(this.completedExamDs.data);

      }).catch((error: any) => {
        console.log(error);
      });
  }

  openTestReport(testData) {
    console.log(testData)
    if (testData.exam_status >= 3) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.data = testData;

      const dialogRef= this.dialog.open(TestChapterTopicReportComponent,dialogConfig);
      dialogRef.afterClosed().subscribe((result) => { });
    }
  }

  openTestGraph(testData) {

    if (testData.exam_status >= 3) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.data = testData;

      const dialogRef= this.dialog.open(TestChapterTopicGraphComponent,dialogConfig);
      dialogRef.afterClosed().subscribe((result) => { });
    }
  }

  expandCETest(element, row) {
    this.expandedCETest = this.expandedCETest === element ? null : element;
  }

  displayTestPreview(data)
  {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.data = {
      testPaperId: data.test_paper_id,
      attachmentFileName: data.test_paper_name,
      withAnswerKey: true,
      isFrozen: true,
      withMarks: true,
      grade: data.grade,
      subject: data.subject_name,
      totalmarks: data.total_marks
      };
      const dialogRef = this.dialog.open(
        PaperPreviewDialogBoxComponent,
        dialogConfig
      );

      dialogRef.afterClosed().subscribe((result) => { });
  }
}
