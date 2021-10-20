import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BackendService } from '../backend';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ClientDivision } from '../entities/clientDivision';
import { ClientGrade } from '../entities/clientGrade';
import { ClientYear } from '../entities/clientYear';
import { StudentPromotion } from '../entities/student-promotion';
import { CommonService } from '../_helpers/common';
import { EventQueueService, AppEvent, AppEventType } from '../_services/broadcast-events/event.queue.service';
import { FrontendService } from '../_services/frontend.service';

@Component({
  selector: 'app-student-roll-no-generation',
  templateUrl: './student-roll-no-generation.component.html',
  styleUrls: ['./student-roll-no-generation.component.scss']
})
export class StudentRollNoGenerationComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  studentDisplayColumn: string[] = ['regNo', 'rollNo', 'edit-save', 'division', 'studentName'];
  studentDetails: StudentPromotion[];
  studentDataSource = new MatTableDataSource<StudentPromotion>();
  userIdentity: any;
  selectedYearDivision: ClientDivision[];
  selectedYearGrade: ClientGrade[];
  selectedGrade: any;
  selectedDivision: any;
  clientYear: ClientYear[];
  selectedYear: any;
  currentYear: any;
  currentYearOrder: number;
  selectedYearOrder: number;
  sortByFLName: boolean = true;
  editCopy: any;

  constructor(public dialog: MatDialog,
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackBar: CommonService,
    private router: Router,
    private eventQueue: EventQueueService) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.backendService
      .getClientYear(this.userIdentity.clientId, "default")
      .toPromise().then((result: any) => {
        this.clientYear = result;
        this.clientYear.forEach((f) => {
          if (f.isCurrentYear == 1) {
            this.selectedYear = f;
            this.currentYear = f.year;
            this.currentYearOrder = f.yearOrder;
            this.onYearSelected(f);
          }
        });
      }).catch( (error: any) => {
        this.showErrMsg(error.error);
      })
  }

  ngAfterViewInit() {
    this.studentDataSource.sort = this.sort;
  }

  onYearSelected(selectedYear) {
    this.reset();
    this.selectedGrade = null;
    this.selectedDivision = null;
    this.selectedYearDivision = [];
    this.selectedYearDivision = [];
    this.selectedYearOrder = selectedYear.yearOrder;
    this.backendService
      .getClientGrades(this.userIdentity.clientId, selectedYear.clientYearId)
      .toPromise().then(
        (result: any) => {
          this.selectedYearGrade = result;
        })
        .catch((error: any) => {
          this.showErrMsg(error.error);
        }
      ),(error:any) => {
                    console.log(error);
                };
  }

  onGradeSelected() {
    this.reset();
    this.backendService.getClientSubjectsOrGradeDivison(this.userIdentity.clientId, this.selectedYear.clientYearId, this.selectedGrade.gradeId, "division").toPromise().then((result: any) => {
      this.selectedYearDivision = result;
    }).catch((error: any) => {
      this.showErrMsg(error.error);
    })
  }

  showDetails() {
    if (this.validateData()) {
      if (this.selectedDivision != null) {
        this.backendService.getStudentDetailsByGradeOrDivision(this.userIdentity.clientId, this.selectedYear.clientYearId, "grade-divisions", this.selectedDivision.map(id => id.gradeDivisionId)).toPromise().then((result: any) => {
          this.studentDetails = result;
          this.studentDetails.forEach((f) => {
            f.openForEdit = true
          })
          this.studentDataSource.data = this.studentDetails;
        }).catch((error: any) => {
          this.showErrMsg(error.error);
        })
      } else {
        this.backendService.getStudentDetailsByGradeOrDivision(this.userIdentity.clientId, this.selectedYear.clientYearId, "grade", this.selectedGrade.gradeId).toPromise().then(async (result: any) => {
          this.studentDetails = result;
          this.studentDetails.forEach((f) => {
            f.openForEdit = true
          })
          this.studentDataSource.data = this.studentDetails;
        }).catch( (error: any) => {
          this.showErrMsg(error.error);
        })
      }
    }
  }

  generateStudentRollNo() {
    if (this.validateData()) {
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: 'Confirm Roll Number Generation',
          message:
            "You have selected Grade: " + this.selectedGrade.grade + " Divisions: " + this.selectedDivision.map(div => div.division) + ". This action will overwriter roll number (If exist). Are you sure you want to proceed with ?",
          yes: 'Yes',
          no: 'No',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          let studentData: any = {
            gradeDivisionId: this.selectedDivision.map(id => id.gradeDivisionId),
            sortByFLName: this.sortByFLName
          }
          this.backendService.generateStudentRollNo(studentData).toPromise().then((result) => {
            this.showDetails();
            this.showSucessMsg(result);
          }).catch((error: any) => {
            this.showErrMsg(error.error);
          })
        }
      })
    }
  }

  editRollNo(rowNo) {
    this.editCopy = this.studentDataSource.data[rowNo].rollNo;
    this.studentDataSource.data[rowNo].openForEdit = false;
  }

  discardRollNo(rowNo, data){
    data.rollNo = this.editCopy;
    data.openForEdit = true;
  }

  saveRollNo(rowNo, data) {
    let rollNo = data.rollNo.toString().trim();
    if (rollNo.length > 0 && rollNo !== null) {
      let studentData: any = {
        studentRollNo: rollNo,
        studentGradeId: data.studentGradeId
      }
      this.backendService.updateStudentRollNo(studentData).toPromise().then((result) => {
        this.studentDetails[rowNo].rollNo = rollNo;
        this.studentDetails[rowNo].openForEdit = true;
        this.studentDataSource.data = this.studentDetails;
        this.showSucessMsg(result)
      }).catch((error: any) => {
        this.showErrMsg(error.error);
      })
    } else {
      this.showErrMsg("Roll No required")
    }
  }

  // <------------------------------------------- Common Function ------------------------------------------->

  validateData() {
    if (this.selectedGrade == null) {
      this.showErrMsg("Please select grade");
      return false;
    } else if (this.selectedDivision == null) {
      this.showErrMsg("Please select division");
      return false;
    }
    return true;
  }

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  reset() {
    this.studentDetails = [];
    this.studentDataSource.data = this.studentDetails;
  }

  showSucessMsg(msg) {
    this.snackBar.showSuccessMsg(msg);
  }

  changeSortType(data) {
    this.sortByFLName = data;
  }

  navigateStudentAssignment() {
    this.router.navigate(['/student-subjectgroup']);
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Subject Assignment'}));
  }

  navigateChangeAcademicYear() {
    this.router.navigate(['/start-new-year']);
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Change Academic Year'}));
  }

}
