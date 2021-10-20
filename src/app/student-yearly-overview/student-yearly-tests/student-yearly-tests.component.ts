import { StudentPaperEvaluatedComponent } from './../../test/evaluation/student-paper-evaluated/student-paper-evaluated.component';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Test, Student,EXAM_STATUS_LIST,EXAM_STATUS } from 'src/app/entities';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/backend';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatDialog } from '@angular/material/dialog';
import { StudentTestReportGraphComponent } from '../../student-test/student-test-report-graph/student-test-report-graph.component';

@Component({
  selector: 'app-student-yearly-tests',
  templateUrl: './student-yearly-tests.component.html',
  styleUrls: ['./student-yearly-tests.component.scss'],
})
export class StudentYearlyTestsComponent implements OnInit {
  completedExamDs = new MatTableDataSource<Test>();
  completedExams: Test[] = [];
  allExams: Test[] = [];

  displayedCEColumns: string[] = [
    'startDateEndDate',
    'examTakenDate',
    'examName',
    'subjectName',
    'marks',
    'viewPaper',
    'viewReport',
  ];

  userIdentity: any;
  dateFormat: string;

  @ViewChild('completedSort', { static: true }) sortCE: MatSort;
  @ViewChild('completedPaginator', { static: true }) paginatorCE: MatPaginator;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.completedExamDs.sort = this.sortCE;
    this.completedExamDs.paginator = this.paginatorCE;
  }

  loadTestData(studentGradeId) {
    this.reset();
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;

    let statuses: any = EXAM_STATUS_LIST;
    
    this.backendService
      .getStudentExams(studentGradeId, statuses)
      .toPromise()
      .then((result: any) => {
        this.allExams = JSON.parse(result);
        if (statuses.includes(EXAM_STATUS.CLOSED)) {
          this.completedExams = this.allExams.filter(
            (t) =>
              t.student_exam_status === EXAM_STATUS.CLOSED ||
              t.student_exam_status === EXAM_STATUS.EVALUATE ||
              t.student_exam_status === EXAM_STATUS.SCORE_RELEASED
          );
          this.completedExamDs.data = this.completedExams;
        }
      })
      .catch((error: any) => {
        console.log(error);
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
      data: dialogueData,
    });
  }
  onViewReport(testData) {
    let dialogueData: any = {};

    dialogueData['studentExamId'] = testData.student_exam_id;
    dialogueData['examId'] = testData.exam_id;
    dialogueData['testPaperName'] = testData.test_paper_name;

    const dialogRef = this.dialog.open(StudentTestReportGraphComponent, {
      data: dialogueData,
    });
  }
  reset() {
    this.allExams = [];
    this.completedExams = [];
    this.completedExamDs.data = [];
  }
}
