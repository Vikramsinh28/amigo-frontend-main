import { MatTabGroup } from '@angular/material/tabs';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BackendService } from '../backend';
import { StudentProfile, Student } from '../entities';
import { DomSanitizer } from '@angular/platform-browser';
import { FrontendService } from '../_services/frontend.service';
import { CommonService } from '../_helpers/common';
import { StudentYearlyTestsComponent } from 'src/app/student-yearly-overview/student-yearly-tests/student-yearly-tests.component';
import { StudentYearlyExamsComponent } from 'src/app/student-yearly-overview/student-yearly-exams/student-yearly-exams.component';
import { StudentYearlyAchievementsParticipationComponent } from 'src/app/student-yearly-overview/student-yearly-achievements-participation/student-yearly-achievements-participation.component';
import { StudentYearlyDegreeCertificationsComponent } from 'src/app/student-yearly-overview/student-yearly-degree-certifications/student-yearly-degree-certifications.component';
import { StudentYearlyRemarksComponent } from 'src/app/student-yearly-overview/student-yearly-remarks/student-yearly-remarks.component';


@Component({
  selector: 'app-student-yearly-overview',
  templateUrl: './student-yearly-overview.component.html',
  styleUrls: ['./student-yearly-overview.component.scss'],
})
export class StudentYearlyOverviewComponent implements OnInit, AfterViewInit {
  dataLoaded = false;
  studentProfile: StudentProfile;
  userRole: string;
  userIdentity: any;
  pictureUrl: any;

  @ViewChild(StudentYearlyTestsComponent) yearlyTests: StudentYearlyTestsComponent;
  @ViewChild(StudentYearlyExamsComponent) yearlyExams: StudentYearlyExamsComponent;
  @ViewChild(StudentYearlyAchievementsParticipationComponent) yearlyAP: StudentYearlyAchievementsParticipationComponent;
  @ViewChild(StudentYearlyDegreeCertificationsComponent) yearlyDC: StudentYearlyDegreeCertificationsComponent;
  @ViewChild(StudentYearlyRemarksComponent) yearlyRemarks: StudentYearlyRemarksComponent;


  @ViewChild('tabs') tabs: MatTabGroup;
  selectedStudent: any = {};

  constructor(
    private backendService: BackendService,
    private snackBar: CommonService,
    private sanitizer: DomSanitizer,
    private frontendService: FrontendService
  ) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
  }

  ngOnInit(): void {
    if (this.userRole == 'Student') {
      this.selectedStudent['firstName'] = this.userIdentity.firstName;
      this.selectedStudent['lastName'] = this.userIdentity.lastName;
      this.selectedStudent['division'] = this.userIdentity.studentDivision;
      this.selectedStudent['grade'] = this.userIdentity.studentGrade;
      this.selectedStudent['studentId'] = this.userIdentity.studentId;
      this.selectedStudent['studentGradeId'] = this.userIdentity.studentGradeId;
      this.selectedStudent['gradeId'] = this.userIdentity.gradeId;
      this.selectedStudent['clientYearId'] = this.userIdentity.currentYearId;
      this.selectedStudent['regNo'] = this.userIdentity.regNo;
      this.loadProfile(this.userIdentity.studentId, this.userIdentity.clientId);
    }
  }

  ngAfterViewInit():void{
    if (this.userRole == 'Student') {
      this.yearlyExams.loadExamData(this.selectedStudent.gradeId,this.selectedStudent.studentGradeId);
   }

  }

  onStudentSelection(values: any) {
    this.selectedStudent = values.student;
    this.loadProfile(
      this.selectedStudent.studentId,
      this.userIdentity.clientId
    );
    this.resetAllTabs();

    let searchData = this.getSearchStudentObject();
    this.yearlyExams.loadExamData(
      searchData.gradeId,
      searchData.studentGradeId
    );
  }

  loadProfile(studentId, clientId) {
    this.backendService
      .getStudentProfile(studentId, clientId)
      .toPromise()
      .then(
        (data: string) => {
          this.studentProfile = JSON.parse(data);
          if (this.studentProfile) {
            this.dataLoaded = true;
            if (this.studentProfile.picture) {
              var strMIME = 'png'; //since our image-cropper converts all type of images to 'png'
              this.pictureUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                'data:' + strMIME + ';base64,' + this.studentProfile.picture
              );
            } else this.pictureUrl = this.studentProfile.picture;
          } else {
            this.dataLoaded = false;
            this.snackBar.showErrorMsg(
              "Sorry, there isn't any data available for selected student"
            );
          }
        }).
        catch((error: any) => {
          console.log(error);
        }
      );
  }

  changeTab(event) {
    let searchData = this.getSearchStudentObject();
    if (event.index == 1) {
      this.yearlyTests.loadTestData(this.selectedStudent.studentGradeId);
    }
    if(event.index == 2){
      this.yearlyAP.loadAccomplishments(this.selectedStudent.studentId,this.selectedStudent.clientYearId)
    }
    if(event.index == 3){
      this.yearlyDC.loadDegreeCertification(this.selectedStudent.studentId)
    }
    if(event.index == 4){
      this.yearlyRemarks.loadRemarks(searchData.studentGradeId,this.selectedStudent.clientYearId)
    }
  }

  getSearchStudentObject() {
    let studentGradeId, gradeId;
    studentGradeId = this.selectedStudent.studentGradeId;
    gradeId = this.selectedStudent.gradeId;

    return { gradeId: gradeId, studentGradeId: studentGradeId };
  }

  resetAllTabs() {
    if (this.yearlyTests) this.yearlyTests.reset();
    if (this.yearlyExams) this.yearlyExams.reset();
    if (this.yearlyAP) this.yearlyAP.reset();
    if (this.yearlyDC) this.yearlyDC.reset();
    if (this.yearlyRemarks) this.yearlyRemarks.reset();
    if (this.tabs) this.tabs.selectedIndex = 0;
  }
}
