import { StudentPaperEvaluatedComponent } from './../../test/evaluation/student-paper-evaluated/student-paper-evaluated.component';
import { TestPaperEventsService } from './../../_services/test-paper-events.service';
import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { Test } from 'src/app/entities';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/backend';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StudentTestPaperComponent } from '../student-test-paper/student-test-paper.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FrontendService } from 'src/app/_services/frontend.service';
import { StudentTestReportGraphComponent } from '../student-test-report-graph/student-test-report-graph.component';
import { StudentTestDialogBoxComponent } from '../student-test-dialog-box/student-test-dialog-box.component';

@Component({
  selector: 'app-student-test-list',
  templateUrl: './student-test-list.component.html',
  styleUrls: ['./student-test-list.component.scss']
})
export class StudentTestListComponent implements OnInit {

  activeExamsDS = new MatTableDataSource<Test>();
  upcomingExamDs = new MatTableDataSource<Test>();
  completedExamDs = new MatTableDataSource<Test>();
  activeExams: Test[] = [];
  upcomingExams: Test[] = [];
  completedExams: Test[] = []
  allExams: Test[] = [];
  displayedAEColumns: string[] = [
    'startDate',
    'endDate',
    'examName',
    'subjectName',
    'totalMarks',
    'testDuration',
    'notes',
    'startExam'
  ];
  displayedUEColumns: string[] = [
    'startDate',
    'endDate',
    'examName',
    'subjectName',
    'totalMarks',
    'testDuration',
    'notes'
  ];
  displayedCEColumns: string[] = [
    'startDate',
    'endDate',
    'examName',
    'subjectName',
    'totalMarks',
    'testDuration',
    'notes',
    'marks',
    'viewPaper',
    'viewReport'
  ];
  userIdentity: any;
  dateFormat: string;
  @ViewChild('activeSort', { static: true }) sortAE: MatSort;
  @ViewChild('activePaginator', { static: true }) paginatorAE: MatPaginator;


  @ViewChild('upcomingSort', { static: true }) sortUE: MatSort;
  @ViewChild('upcomingPaginator', { static: true }) paginatorUE: MatPaginator;

  @ViewChild('completedSort', { static: true }) sortCE: MatSort;
  @ViewChild('completedPaginator', { static: true }) paginatorCE: MatPaginator;
  @ViewChild(StudentTestDialogBoxComponent) stuedntTest: StudentTestDialogBoxComponent;

  EXAM_STATUS_LIST: string = '1,2,3,4,5';
  @Output() passExamDetails = new EventEmitter();
  testDetails: any;

  constructor(
    private backendService: BackendService,
    private router: Router,
    private testService: TestPaperEventsService,
    public dialog: MatDialog,
    private frontendService: FrontendService
  ) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;
    this.loadExamData();
    this.activeExamsDS.sort = this.sortAE;
    this.activeExamsDS.paginator = this.paginatorAE;

    this.upcomingExamDs.sort = this.sortUE;
    this.upcomingExamDs.paginator = this.paginatorUE;

    this.completedExamDs.sort = this.sortCE;
    this.completedExamDs.paginator = this.paginatorCE;
  }

  loadExamData(statuses: any = this.EXAM_STATUS_LIST) {
    this.backendService
      .getStudentExams(this.userIdentity.studentGradeId, statuses).toPromise().then
      ((result: string) => {
        this.allExams = JSON.parse(result);
        if (statuses.includes(1)) {
          this.upcomingExams = this.allExams.filter(t => t.exam_status === 1 && t.student_exam_status == 1);
          this.upcomingExamDs.data = this.upcomingExams;
        }

        if (statuses.includes(2)) {
          this.activeExams = this.allExams.filter(t => t.exam_status === 2 && t.student_exam_status == 2);
          this.activeExamsDS.data = this.activeExams;
        }

        if (statuses.includes(3)) {
          this.completedExams = this.allExams.filter(t => t.student_exam_status === 3 || t.student_exam_status === 4 || t.student_exam_status === 5);
          this.completedExamDs.data = this.completedExams;
        }
      }).catch((error:any) => {
                    console.log(error);
                });

  }
  startExam(testData) {
    const dialogRef = this.dialog.open(StudentTestDialogBoxComponent, {
      width: '450px',
      data: {
        title: 'Start Exam',
        instruction: testData.test_instructions,
        totalMarks: testData.total_marks,
        duration: testData.exam_duration,
        testName: testData.test_paper_name,
        subject: testData.subject_name
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'startExam') {
        this.router.navigate(["/student-test-paper"]);
        this.testService.nextTestDetails({
          studentExamId: testData.student_exam_id,
          testPaperId: testData.test_paper_id,
          testName: testData.test_paper_name,
          duration: testData.exam_duration,
          grade: testData.grade,
          marks: testData.total_marks,
          subject: testData.subject_name,
          instructions: testData.test_instructions
        });
      }
    });
  }

  onViewPaper(testData) {
    let dialogueData: any = {};
    dialogueData['studentExamId'] = testData.student_exam_id;
    dialogueData['examId'] = testData.exam_id;
    dialogueData['testPaperName'] = testData.test_paper_name;
    dialogueData['examDuration'] = testData.exam_duration;
    dialogueData['totalMarks'] = testData.total_marks;
    dialogueData['subject'] = testData.subject_name;

    const dialogRef = this.dialog.open(StudentPaperEvaluatedComponent, {
      data: dialogueData
    });
  }

  onViewReport(testData) {
    let dialogueData: any = {};

    dialogueData['studentExamId'] = testData.student_exam_id;
    dialogueData['examId'] = testData.exam_id
    dialogueData['testPaperName'] = testData.test_paper_name

    const dialogRef = this.dialog.open(StudentTestReportGraphComponent, {
      data: dialogueData
    });
  }
}
