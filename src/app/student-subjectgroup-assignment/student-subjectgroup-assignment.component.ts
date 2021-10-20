import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { CommonService } from '../_helpers/common';

interface student {
  selected: boolean;
  grno: string;
  rollno: string;
  name: string;
  division: string;
  mandatory: Array<string>;
  optional: Array<string>
}
interface group {
  subjectGroupId?: number;
  groupCode?: string;
  subjectName?: string;
}
@Component({
  selector: 'app-student-subjectgroup-assignment',
  templateUrl: './student-subjectgroup-assignment.component.html',
  styleUrls: ['./student-subjectgroup-assignment.component.scss']
})
export class StudentSubjectgroupAssignmentComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  studentDisplayColumn: string[] = ['regNo', 'studentName', 'division', 'mandatory', 'optional', 'select'];
  groupDisplayColumn: string[] = ['assign', 'group', 'subjects'];
  studentDataSource = new MatTableDataSource<StudentPromotion>();
  mandatorySubjectGroupDataSource = new MatTableDataSource<group>();
  optionalSubjectGroupDataSource = new MatTableDataSource<group>();
  selection = new SelectionModel<StudentPromotion>(true, []);
  mandatorySubjectGroup: group[];
  optionalSubjectGroup: group[];
  studentDetails: StudentPromotion[];
  userIdentity: any;
  selectedYearDivision: ClientDivision[] = [];
  selectedYearGrade: ClientGrade[] = [];
  selectedGrade: any;
  selectedDivision: any;
  clientYear: ClientYear[];
  selectedYear: any;
  currentYear: any;
  currentYearOrder: number;
  selectedYearOrder: number;
  routeFlag: any = "false";
  constructor(public dialog: MatDialog,
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackBar: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventQueue: EventQueueService) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      if (paramMap.get('year') && paramMap.get('grade') && paramMap.get('division') && paramMap.get('flag')) {
        this.routeFlag = paramMap.get('flag');
        this.selectedYear = Number(paramMap.get('year'));
        this.selectedGrade = Number(paramMap.get('grade'));
        this.selectedDivision = Number(paramMap.get('division'));
      }
    })
    this.backendService
      .getClientYear(this.userIdentity.clientId, "default")
      .toPromise().then(async (result: any) => {
        this.clientYear = result;
        this.clientYear.forEach((f) => {
          if (f.isCurrentYear == 1) {
            this.currentYear = f.year;
            this.currentYearOrder = f.yearOrder;
            if (this.routeFlag === "false") {
              this.selectedYear = f.clientYearId;
              this.selectedYearOrder = f.yearOrder;
              this.loadGrade(this.selectedYear);
            }
          }
        });
        if (this.routeFlag === "true") {
          this.selectedYearOrder = this.clientYear.find(x => x.clientYearId === this.selectedYear).yearOrder;
          this.loadGrade(this.selectedYear);
          this.onGradeSelected();
          this.showDetails();
        }
      }).catch((error: any) => {
        this.showErrMsg(error.error);
      })
  }

  ngAfterViewInit() {
    this.studentDataSource.sort = this.sort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.studentDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.studentDetails.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: StudentPromotion): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.studentGradeId + 1}`;
  }

  onYearSelected(selectedYear) {
    this.reset();
    this.selectedYearDivision = [];
    this.selectedYearDivision = [];
    this.selectedYearOrder = this.clientYear.filter(x => x.clientYearId === selectedYear)[0].yearOrder;
    this.loadGrade(selectedYear)
  }

  loadGrade(selectedYear) {
    this.backendService
      .getClientGrades(this.userIdentity.clientId, selectedYear)
      .toPromise().then(
        (result: any) => {
          this.selectedYearGrade = result;
        })
        .catch((error: any) => {
          this.showErrMsg(error.error);
        }
      );
  }

  onGradeSelected() {
    this.reset();
    this.backendService.getClientSubjectsOrGradeDivison(this.userIdentity.clientId, this.selectedYear, this.selectedGrade, "division").toPromise().then((result: any) => {
      this.selectedYearDivision = result;
    }).catch((error: any) => {
      this.showErrMsg(error.error);
    })
  }

  showDetails() {
    if (this.validateData()) {
      this.backendService.getClientSubjectGroup(this.userIdentity.clientId, this.selectedYear, this.selectedGrade, "student-subject-group").toPromise().then(async (result: any) => {
        this.mandatorySubjectGroup = result.filter(r => r.isMandatory === 'Y');
        this.optionalSubjectGroup = result.filter(r => r.isMandatory === 'N');
        this.mandatorySubjectGroupDataSource.data = this.mandatorySubjectGroup;
        this.optionalSubjectGroupDataSource.data = this.optionalSubjectGroup;
      }).catch((error: any) => {
        this.showErrMsg(error.error)
      })
      // Student Details Code Starts From Here...
      if (this.selectedDivision != null) {
        this.backendService.getStudentDetailsByGradeOrDivision(this.userIdentity.clientId, this.selectedYear, "grade-division", this.selectedDivision).toPromise().then((result: any) => {
          this.studentDetails = result;
          this.studentDataSource.data = this.studentDetails;
        }).catch((error: any) => {
          this.showErrMsg(error.error);
        })
      } else {
        this.backendService.getStudentDetailsByGradeOrDivision(this.userIdentity.clientId, this.selectedYear, "grade", this.selectedGrade).toPromise().then(async (result: any) => {
          this.studentDetails = result;
          this.studentDataSource.data = this.studentDetails;
        }).catch( (error: any) => {
          this.showErrMsg(error.error);
        })
      }
    }
  }

  deleteStudentGroup(data, type, rowNo) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirm Add Group',
        message:
          "Are you sure you want to delete Group: " + (type === 'mandatory' ? data.mandatoryGrpName : data.optionalGrpName) + " . Are you sure you want to continue ?",
        yes: 'Yes',
        no: 'No',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let studentData: any = {
          studentGradeId: [data.studentGradeId],
          groupId: null
        }
        if (type === "mandatory") {
          this.backendService.updateStudentGroup(studentData, "mandatory-group").toPromise().then((result) => {
            this.studentDetails[rowNo].mandatoryGrpId = null;
            this.studentDetails[rowNo].mandatoryGrpName = null;
            this.showSucessMsg("For "+ data.studentName +" , "+ type +" group assignment is removed successfully.");
          }).catch((error: any) => {
            this.showErrMsg(error.error)
          })
        } else if (type === "optional") {
          this.backendService.updateStudentGroup(studentData, "optional-group").toPromise().then((result) => {
            this.studentDetails[rowNo].optionalGrpId = null;
            this.studentDetails[rowNo].optionalGrpName = null;
            this.showSucessMsg("For "+ data.studentName +" , "+ type +" group assignment is removed successfully.");
          }).catch((error: any) => {
            this.showErrMsg(error.error)
          })
        }
      }
    })
  }

  // <----------------------------------------- Mandatory/Optional Table  Code --------------------------------------->

  assignGroup(data, table) {
    if (this.selection.selected.length > 0) {
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: 'Confirm Add Group',
          message:
            "If any other group is already assigned to the selected students, it will get updated with the Group " + data.groupCode + " . Are you sure you want to continue?",
          yes: 'Yes',
          no: 'No',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          let studentData: any = {
            studentGradeId: this.selection.selected.map(id => id.studentGradeId),
            groupId: data.subjectGroupId
          }
          if (table === "mandatoryTable") {
            this.backendService.updateStudentGroup(studentData, "mandatory-group").toPromise().then((result) => {
              studentData.studentGradeId.forEach((f) => {
                for (let i = 0; i < this.studentDetails.length; i++) {
                  if (this.studentDetails[i].studentGradeId === f) {
                    this.studentDetails[i].mandatoryGrpId = data.subjectGroupId;
                    this.studentDetails[i].mandatoryGrpName = data.groupCode;
                    break;
                  }
                }
              })
              this.showSucessMsg(result);
              this.selection.clear()
            }).catch((error: any) => {
              this.showErrMsg(error.error);
            })
          } else if (table === "optionalTable") {
            this.backendService.updateStudentGroup(studentData, "optional-group").toPromise().then((result) => {
              studentData.studentGradeId.forEach((f) => {
                for (let i = 0; i < this.studentDetails.length; i++) {
                  if (this.studentDetails[i].studentGradeId === f) {
                    this.studentDetails[i].optionalGrpId = data.subjectGroupId;
                    this.studentDetails[i].optionalGrpName = data.groupCode;
                    break;
                  }
                }
              })
              this.showSucessMsg(result);
              this.selection.clear()
            }).catch((error: any) => {
              this.showErrMsg(error.error);
            })
          }

        }
      })
    } else {
      this.showErrMsg("Please select atleast one student")
    }
  }

  // <------------------------------------------ Navigation Code ------------------------------------------->

  navigateStudentPrmotion() {
    this.router.navigate(['/student-promotion'], { queryParams: { 'grade': this.selectedGrade } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Student Promotion'}));
  }

  navigateRollNo() {
    this.router.navigate(['/student-rollNo']);
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Roll Number'}));
  }




  // <------------------------------------------- Common Function ------------------------------------------->

  validateData() {
    if (this.selectedGrade == null) {
      this.showErrMsg("Please select grade");
      return false;
    } else if (this.selectedYear == null) {
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
    this.mandatorySubjectGroup = [];
    this.optionalSubjectGroup = [];
    this.studentDataSource.data = this.studentDetails;
    this.mandatorySubjectGroupDataSource.data = this.mandatorySubjectGroup;
    this.optionalSubjectGroupDataSource.data = this.optionalSubjectGroup;
    this.selection.clear()
  }

  showSucessMsg(msg) {
    this.snackBar.showSuccessMsg(msg);
  }


}
