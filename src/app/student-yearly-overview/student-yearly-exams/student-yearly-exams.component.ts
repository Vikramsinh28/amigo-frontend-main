import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { BackendService } from 'src/app/backend';
import { Test, Student } from 'src/app/entities';
import { MatTableDataSource } from '@angular/material/table';
import { FrontendService } from 'src/app/_services/frontend.service';

@Component({
  selector: 'app-student-yearly-exams',
  templateUrl: './student-yearly-exams.component.html',
  styleUrls: ['./student-yearly-exams.component.scss'],
})
export class StudentYearlyExamsComponent implements OnInit {
  userIdentity: any;
  userRole:any;
  allExams: Test[] = [];
  exams: string[] = [];
  examDataSources: any[] = [];
  examDataSource: any;

  displayedColumns: string[] = [
    'subjectName',
    'marks'
      ];


  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService
    ) {
        this.userIdentity = this.frontendService.getJWTUserIdentity();
        this.userRole=this.userIdentity.loginRoleName;
    }

  ngOnInit(): void {
  }

  loadExamData(gradeId, studentGradeId) {
    this.reset();
    this.backendService
      .getYearlyStudentExams(gradeId, studentGradeId)
      .toPromise()
      .then((result: any) => {
        result.forEach((e) => {
          this.exams.push(e.examName);
          this.examDataSource = new MatTableDataSource<Test>();
          this.examDataSource.data = e.examDetails;
          this.examDataSources.push(this.examDataSource);
        });
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  reset() {
    this.exams = [];
    this.examDataSources = [];
  }
}
