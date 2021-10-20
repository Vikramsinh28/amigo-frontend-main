import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../backend';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ClientDivision } from '../entities/clientDivision';
import { ClientGrade } from '../entities/clientGrade';
import { ClientYear } from '../entities/clientYear';
import { StudentPromotion } from '../entities/student-promotion';
import { FrontendService } from '../_services/frontend.service';
import { EventQueueService, AppEvent, AppEventType} from '../_services/broadcast-events/event.queue.service';
import { ResponseError } from '../entities/responseError';
import { CommonService } from '../_helpers/common';

export interface StudentPromotionDto {
  studentId: any;
  gradeDivId: number;
}
@Component({
  selector: 'app-student-promotion',
  templateUrl: './student-promotion.component.html',
  styleUrls: ['./student-promotion.component.scss']
})
export class StudentPromotionComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) currentYearSort: MatSort;
  @ViewChild(MatSort) nextYearSort: MatSort;
  displayColumn: string[] = ['studentName', 'regNo', 'rollNo', 'newGrade', 'newDiv', 'checkbox'];
  nextYearDisplayColumn: string[] = ['studentName', 'regNo', 'delete'];
  userIdentity: any;
  currentYearSelectedGrade: any = "";
  currentYearSelectedDivision: any = "";
  nextYearSelectedGrade: any = "";
  nextYearSelectedDivision: any = "";
  selectedYear: any = "";
  grade: any = "";
  nextYearLabel: any = null;
  clientYear: ClientYear;
  currentYearGrade: ClientGrade[];
  currentYearDivision: ClientDivision[]
  nextYearDivision: ClientDivision[]
  nextYearGrade: ClientGrade[];
  nextYearId: any = "";
  currentYearStudentDetails: StudentPromotion[];
  nextYearStudentDetails: StudentPromotion[];
  currentYearStudentDetailsDataSource = new MatTableDataSource<StudentPromotion>();
  nextYearStudentDetailsDataSource = new MatTableDataSource<StudentPromotion>();
  selection = new SelectionModel<StudentPromotion>(true, []);
  constructor(public dialog: MatDialog,
    private backendService: BackendService,
    private frontendService: FrontendService,
    private activatedRoute: ActivatedRoute,
    private snackBar: CommonService,
    private router: Router,
    private eventQueue: EventQueueService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      this.grade = paramMap.get('grade');
    })
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.loadYear();
  }

  ngAfterViewInit() {
    this.currentYearStudentDetailsDataSource.sort = this.currentYearSort;
    this.nextYearStudentDetailsDataSource.sort = this.nextYearSort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.currentYearStudentDetailsDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.currentYearStudentDetails.forEach(row => row.newStdGdId === null ? this.selection.select(row) : this.selection.deselect(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: StudentPromotion): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.studentId + 1}`;
  }

  // <------------------------------------ Current Academic Year Code ----------------------------------------------------------->

  async loadYear() {
    try {
      this.clientYear = await this.backendService.getClientYear(this.userIdentity.clientId, "previous_current_year").toPromise();
    } catch (err) {
      // request failed
      this.showErrMsg(err.error);
    }
  }

  onYearSelected() {
    this.reset();
    this.nextYearLabel = this.selectedYear.nextYearLabel;
    this.nextYearId = this.selectedYear.nextYearId;
    this.backendService.getStudentPromotionData(this.userIdentity.clientId, this.selectedYear.yearOrder).toPromise().then((result: any) => {
      this.currentYearGrade = result.currentYearGrades;
      this.nextYearGrade = result.nextYearGrades;
    }).catch((error: any) => {
      this.showErrMsg(error.error)
    })
  }

  // Get divisons for selected grade.
  onGradeSelected() {
    this.currentYearSelectedDivision = "";
    this.currentYearStudentDetails = [];
    this.nextYearStudentDetails = [];
    this.currentYearStudentDetailsDataSource.data = this.currentYearStudentDetails;
    this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
    this.selection.clear()
    this.backendService.getClientSubjectsOrGradeDivison(this.userIdentity.clientId, this.selectedYear.clientYearId, this.currentYearSelectedGrade.gradeId, "division").toPromise().then((result: any) => {
      this.currentYearDivision = result;
    }).catch((error: any) => {
      this.showErrMsg(error.error);
    })
  }

  displayStudentDetails() {
    if (this.validateData("currentYear")) {
      if (this.currentYearSelectedDivision != null) {
        this.backendService.getStudentDetails(this.userIdentity.clientId, this.selectedYear.yearOrder, "grade-division", this.currentYearSelectedDivision.gradeDivisionId, (this.selectedYear.yearOrder + 1)).toPromise().then((result: any) => {
          this.currentYearStudentDetails = result;
          this.currentYearStudentDetailsDataSource.data = this.currentYearStudentDetails;
        }).catch((error: any) => {
          this.showErrMsg(error.error);
        })
      } else {
        this.backendService.getStudentDetails(this.userIdentity.clientId, this.selectedYear.yearOrder, "grade", this.currentYearSelectedGrade.gradeId, (this.selectedYear.yearOrder + 1)).toPromise().then((result: any) => {
          this.currentYearStudentDetails = result;
          this.currentYearStudentDetailsDataSource.data = this.currentYearStudentDetails;
        }).catch((error: any) => {
          this.showErrMsg(error.error);
        })
      }
    }
  }

  // This function will duplicate records of current selected student to next academic year.
  duplicateStudentDetails() {
    let duplicateRecord: boolean = false;
    if (this.validateData("promoteStudent")) {
      this.selection.selected.forEach((item) => {
        if (this.nextYearStudentDetails.some((x) => x.studentId === item.studentId && x.studentName === item.studentName)) {
          duplicateRecord = true;
        } else {
          if (item.newStdGdId === null && !duplicateRecord) {
            item.studentGradeId = -1;
            this.nextYearStudentDetails.push(item)
          }
        }
      })
      if (this.nextYearStudentDetails.length > 0) {
        this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
      } else {
        this.showErrMsg("Please select atleast one student")
      }
      if (duplicateRecord) {
        this.showErrMsg("There are some students already exits are not added.")
      }
    }
    this.selection.clear// Clear selected student checkbox to avoid duplicacy.
  }

  // This function will promote student to new grade and division.
  promoteStudets() {
    if (this.validateData("promoteStudent")) {
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: 'Confirm Student Promotion',
          message:
            'Are you sure you want to promote ' + this.selection.selected.length + " students",
          yes: 'Yes',
          no: 'No',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (this.nextYearStudentDetails.length > 0) {
            let arr: number[] = [];
            this.nextYearStudentDetails.forEach((x) => {
              if (x.studentGradeId === -1) { // Check that student that in not yet promoted are pushed inside array.
                arr.push(x.studentId);
              }
            })

            let studentData: StudentPromotionDto = {
              studentId: arr,
              gradeDivId: this.nextYearSelectedDivision.gradeDivisionId
            }

            this.backendService.postStudentDetails(studentData).toPromise().then((result: any) => {
              result.forEach(async element => {
                let nextStudentDetailIndex = await this.nextYearStudentDetails.findIndex(x => x.studentId === element.studentId);
                // Set studentGradeId for promoted student.
                this.nextYearStudentDetails[nextStudentDetailIndex].studentGradeId = element.studentGradeId;

                let currentStudentDetailIndex = await this.currentYearStudentDetails.findIndex(x => x.studentId === element.studentId);
                // Set newGrade, newDiv and newStudentGradeId of promoted students in current academic table.
                this.currentYearStudentDetails[currentStudentDetailIndex].newGd = this.nextYearSelectedGrade.grade;
                this.currentYearStudentDetails[currentStudentDetailIndex].newDiv = this.nextYearSelectedDivision.division;
                this.currentYearStudentDetails[currentStudentDetailIndex].newStdGdId = element.studentGradeId;

                this.showSucessMsgOnGroupInserted("Students promoted sucessfully")
                this.selection.clear();
              });
            }).catch((error: any) => {
              this.showErrMsg(error.error);
            })
          }
        }
      });

    }
  }

  onCurrentDivisionSelected() {
    this.currentYearStudentDetails = [];
    this.currentYearStudentDetailsDataSource.data = this.currentYearStudentDetails;
  }

  // <------------------------------------ Next Academic Year Code ----------------------------------------------------------->
  onNextYearGradeSelection() {
    this.nextYearSelectedDivision = "";
    this.nextYearStudentDetails = [];
    this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
    this.backendService.getClientSubjectsOrGradeDivison(this.userIdentity.clientId, this.nextYearSelectedGrade.clientYearId, this.nextYearSelectedGrade.gradeId, "division").toPromise().then((result: any) => {
      this.nextYearDivision = result;
    }).catch((error: any) => {
      this.showErrMsg(error.error);
    })
  }

  onNextYearDivisionSelection() { // On division selection display student details.
    this.nextYearStudentDetails = [];
    this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
  }

  displayNextYearStudentDetails() {
    if (this.validateData("nextYear")) {
      this.backendService.getStudentDetailsByGradeOrDivision(this.userIdentity.clientId, this.nextYearSelectedGrade.clientYearId, "grade-division", this.nextYearSelectedDivision.gradeDivisionId).toPromise().then((result: any) => {
        this.nextYearStudentDetails = result;
        this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
      }).catch((error: any) => {
        this.showErrMsg(error.error);
      })
    }
  }

  deleteStudent(data) {
    if (data.studentGradeId > 0) {
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: 'Confirm Grade Delete',
          message:
            'Are you sure you want to delete student: ' + data.studentName + " Grade: " + this.nextYearSelectedGrade.grade + " Division: " + this.nextYearSelectedDivision.division + " ?",
          yes: 'Yes',
          no: 'No',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.backendService.deleteStudentDetails(data.studentId, data.studentGradeId).toPromise().then((result: any) => {
            this.nextYearStudentDetails = this.nextYearStudentDetails.filter(
              (value) => {
                return value.studentId != data.studentId;
              }
            );
            this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
            this.changeStudentStatus(data.studentId) // This will change student status to not promoted once deleted.
            this.showSucessMsgOnGroupInserted(result);
          }).catch((errorResponse: any) => {
            var e:ResponseError = JSON.parse(errorResponse.error)
            this.showErrMsg(e.message)
          })
        }
      })
    } else {
      // Delete from fron-end.
      this.nextYearStudentDetails = this.nextYearStudentDetails.filter(
        (value) => {
          return value.studentId != data.studentId;
        }
      );
      this.nextYearStudentDetailsDataSource.data = this.nextYearStudentDetails;
      this.changeStudentStatus(data.studentId)
    }
  }

  // <------------------------------------ Common function ----------------------------------------------------------->
  validateData(flag) {
    if (this.currentYearSelectedGrade.length == 0 && (flag === 'currentYear' || flag === 'promoteStudent')) {
      this.showErrMsg("Please select previous academic year grade");
      return false;
    } else if (this.currentYearSelectedDivision.length == 0 && (flag === 'currentYear' || flag === 'promoteStudent')) {
      this.showErrMsg("Please select previous academic year division");
      return false;
    } else if (this.nextYearSelectedGrade.length == 0 && (flag === 'nextYear' || flag === 'duplicateRecord' || flag === 'promoteStudent')) {
      this.showErrMsg("Please select next academic year grade");
      return false;
    } else if (this.nextYearSelectedDivision.length == 0 && (flag === 'nextYear' || flag === 'duplicateRecord' || flag === 'promoteStudent')) {
      this.showErrMsg("Please select next academic year division");
      return false;
    }
    if (flag === 'duplicateRecord' || flag === 'promoteStudent') {
      if (!this.selection.selected.length) {
        this.showErrMsg("Please select atleast one student")
        return false;
      }
    }
    return true;
  }

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  showSucessMsgOnGroupInserted(msg) {
    this.snackBar.showSuccessMsg(msg);
  }

  changeStudentStatus(studentId) { // Change student status to not promoted.i.e make newGd, newDiv, newStdGdId as null
    this.currentYearStudentDetails.forEach((x) => {
      if (x.studentId === studentId) {
        x.newGd = null;
        x.newDiv = null;
        x.newStdGdId = null;
      }
    })
    this.currentYearStudentDetailsDataSource.data = this.currentYearStudentDetails;
    this.selection.clear() // This will clear selected checkbox to avoid duplicacy.
  }

  navigateSubjectGroup() {
    this.router.navigate(['/subject-group'], { queryParams: { 'grade': this.currentYearSelectedGrade.gradeId, 'year': this.userIdentity.currentYearId } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Subject Groups'}));
  }

  navigateStudentSubjectGroup() {
    this.router.navigate(['/student-subjectgroup']);
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Subject Assignment'}));
  }

  reset() {
    this.currentYearStudentDetails = []
    this.nextYearStudentDetails = []
    this.currentYearStudentDetailsDataSource.data = []
    this.nextYearStudentDetailsDataSource.data = []
    this.currentYearSelectedGrade = ""
    this.currentYearSelectedDivision = ""
    this.nextYearSelectedDivision = ""
    this.nextYearSelectedGrade = ""
  }
}
