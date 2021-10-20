import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend/backend.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ClientDivision } from '../entities/clientDivision';
import { ClientGrade } from '../entities/clientGrade';
import { ClientYear } from '../entities/clientYear';
import { FrontendService } from '../_services/frontend.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { EventQueueService, AppEvent, AppEventType} from '../_services/broadcast-events/event.queue.service';
import { CommonService } from '../_helpers/common';

@Component({
  selector: 'app-grade-division',
  templateUrl: './grade-division.component.html',
  styleUrls: ['./grade-division.component.scss'],
})
export class GradeDivisionComponent implements OnInit {
  gradeDisplayColumn: string[] = ['grade', 'save', 'delete'];

  divisionDisplayColumn: string[] = ['division', 'edit', 'delete'];
  gradeDataSource = new MatTableDataSource<ClientGrade>();
  divisionDataSource = new MatTableDataSource<ClientDivision>();
  editRowNo: number;
  clientYear: ClientYear[];
  userIdentity: any;
  selectedYear: any;
  currentYear: any;
  currentYearOrder: number;
  selectedYearOrder: number;
  defaultGradeId: number = 0;
  defaultDivisionId: number = 0;
  selectedGradeId: number;
  tempDivision: string;
  selection = new SelectionModel<ClientGrade>(false, []);
  year: any;
  constructor(
    public dialog: MatDialog,
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackBar: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventQueue: EventQueueService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      this.year = paramMap.get('year');
    })
    this.selection = new SelectionModel<ClientGrade>(false, []);
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.backendService
      .getClientYear(this.userIdentity.clientId, "default")
      .toPromise().then((result: any) => {
        this.clientYear = result;
        this.clientYear.forEach((f) => {
          if (f.clientYearId == this.year) {
            this.selectedYear = f;
            this.onYearSelected(f);
          }
          if (f.isCurrentYear == 1) {
            this.currentYear = f.year;
            this.currentYearOrder = f.yearOrder;
          }
        });
      }).catch((error:any) => {
                    console.log(error);
                }),
      () => { };
  }

  ngAfterViewInit() { }

  onYearSelected(selectedYear) {
    this.divisionDataSource.data = null;
    this.selectedYearOrder = selectedYear.yearOrder;
    this.backendService
      .getClientGrades(this.userIdentity.clientId, selectedYear.clientYearId)
      .toPromise().then(
        (result: any) => {
          this.gradeDataSource.data = result;
          this.gradeDataSource.data.forEach((f) => {
            f.openForEdit = true;
          });
        })
        .catch((error: any) => {
          this.snackBar.showErrorMsg(error.error);
        }
      ),(error:any) => {
                    console.log(error);
                };
  }

  onGradeSelected(data) {
    this.selectedGradeId = data.gradeId;
    this.backendService
      .getClientSubjectsOrGradeDivison(
        this.userIdentity.clientId,
        this.selectedYear.clientYearId,
        data.gradeId,
        'division'
      )
      .toPromise().then(
        (result: any) => {
          this.divisionDataSource.data = result;
          this.divisionDataSource.data.forEach((f) => {
            f.openForEdit = true;
          });
        })
        .catch((error: any) => {
          this.snackBar.showErrorMsg(error.error);
        }
      );
  }

  // CRUD OPERATION FOR GRADE STARTS FROM HERE...

  addNewGrade() {
    if (this.selectedYearOrder >= this.currentYearOrder) {
      this.defaultGradeId = this.defaultGradeId - 1;
      let grade: ClientGrade = {
        grade: '',
        gradeId: this.defaultGradeId,
        clientId: this.userIdentity.clientId,
        clientYearId: this.selectedYear.clientYearId,
        countGradeInUse: 0,
        openForEdit: false,
      };
      var data = this.gradeDataSource.data;
      data.push(grade);
      this.gradeDataSource.data = data;
    }
  }

  saveNewGrade(data, rowNo) {
    if (data.grade.trim().length > 0 && data.grade.trim() !== null) {
      let grade: ClientGrade = {
        grade: data.grade.trim(),
        clientYearId: this.selectedYear.clientYearId,
      };
      this.backendService
        .postClientGrade(
          this.userIdentity.clientId,
          this.userIdentity.userId,
          grade
        )
        .toPromise().then(
          (result: any) => {
            this.snackBar.showSuccessMsg('Grade ' + data.grade + ' added sucessfully');
            grade.gradeId = result;
            this.gradeDataSource.data[rowNo].gradeId = result;
            this.gradeDataSource.data[rowNo].openForEdit = true;
            this.gradeDataSource.data[rowNo].countGradeInUse = 0;
            this.onGradeSelected(grade)
          })
          .catch((error: any) => {
            this.snackBar.showErrorMsg(error.error);
          }
        );
    } else {
      this.snackBar.showErrorMsg('All fields are required');
    }
  }

  deleteGrade(data) {
    if (data.gradeId > 0) {
      if (data.openForEdit) {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
          width: '500px',
          disableClose: true,
          data: {
            title: 'Confirm Grade Delete',
            message:
              'Are you sure you want to delete grade: ' + data.grade + ' ?',
            yes: 'Yes',
            no: 'No',
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.backendService
              .deleteClientGrade(
                this.userIdentity.clientId,
                this.selectedYear.clientYearId,
                data.gradeId
              )
              .toPromise().then(
                (result: any) => {
                  this.snackBar.showSuccessMsg(result);
                  this.gradeDataSource.data = this.gradeDataSource.data.filter(
                    (value) => {
                      return value.gradeId != data.gradeId;
                    }
                  );
                  this.divisionDataSource.data = null;
                })
                .catch((error: any) => {
                  this.snackBar.showErrorMsg(error.error);
                }
              );
          }
        });
      }
    } else {
      this.gradeDataSource.data = this.gradeDataSource.data.filter((value) => {
        return value.gradeId != data.gradeId;
      });
    }
  }

  // CRUD OPERATION FOR DIVISION STARTS FROM HERE...

  addNewDivision() {
    this.tempDivision = null;
    if (this.selectedGradeId != null) {
      if (this.selectedYearOrder >= this.currentYearOrder) {
        this.defaultDivisionId = this.defaultDivisionId - 1;
        let tempDivision: ClientDivision = {
          clientYearId: this.selectedYear.clientYearId,
          division: '',
          gradeDivisionId: this.defaultDivisionId,
          countGradeDivisionInUse: 0,
          openForEdit: false,
        };
        var divisionData = this.divisionDataSource.data;
        divisionData.push(tempDivision);
        this.divisionDataSource.data = divisionData;
      }
    } else {
      this.snackBar.showErrorMsg('Please select grade');
    }
  }

  saveNewDivision(data, rowNo) {
    if (data.division.toString().trim().length > 0 && data.division.toString().trim() !== null) {
      let division: ClientDivision = {
        gradeId: this.selectedGradeId,
        gradeDivisionId: data.gradeDivisionId
      };

      // Save newly added division
      if (data.gradeDivisionId < 0) {
        this.backendService
          .postClientGradeDivison(
            this.userIdentity.userId,
            division,
            'division',
            data.division.toString().trim()
          )
          .toPromise().then(
            (result: any) => {
              this.snackBar.showSuccessMsg('Division ' + data.division + ' added sucessfully');
              this.divisionDataSource.data[rowNo].gradeDivisionId = result;
              this.divisionDataSource.data[rowNo].openForEdit = true;
              this.divisionDataSource.data[rowNo].countGradeDivisionInUse = 0;
            })
            .catch((error: any) => {
              this.snackBar.showErrorMsg(error.error);
            }
          );
      } else {
        // Update exisiting division
        this.backendService.putClientGradeDivison(data.division.toString().trim(), this.userIdentity.userId, division, "division").toPromise().then((result) => {
          this.divisionDataSource.data[rowNo].openForEdit = true;
          this.divisionDataSource.data[rowNo].division = data.division;
          this.snackBar.showSuccessMsg(result);
        }).catch( (error) => {
          this.snackBar.showErrorMsg(error.error);
        })
      }
    } else {
      this.snackBar.showErrorMsg('All fields are required');
    }
  }

  editDivision(rowNo, data) {
    this.divisionDataSource.data[rowNo].openForEdit = false;
    this.tempDivision = data.division;
  }

  deleteDivision(data) {
    if (data.gradeDivisionId > 0) {
      if (data.openForEdit) {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
          width: '300px',
          disableClose: true,
          data: {
            title: 'Confirm Division Delete',
            message:
              'Are you sure you want to delete Division ' +
              data.division +
              ' ?',
            yes: 'Yes',
            no: 'No',
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.backendService
              .deleteClientGradeDivison(
                this.selectedGradeId,
                data.gradeDivisionId,
                'division'
              )
              .toPromise().then(
                (result: any) => {
                  this.snackBar.showSuccessMsg(result);
                  this.divisionDataSource.data = this.divisionDataSource.data.filter(
                    (value) => {
                      return value.gradeDivisionId != data.gradeDivisionId;
                    }
                  );
                })
                .catch((error: any) => {
                  this.snackBar.showErrorMsg(error.error);
                }
              );
          }
        });
      }
    } else {
      this.divisionDataSource.data = this.divisionDataSource.data.filter(
        (value) => {
          return value.gradeDivisionId != data.gradeDivisionId;
        }
      );
    }
  }
  escpDivision(rowNo) {
    this.divisionDataSource.data[rowNo].division = this.tempDivision;
  }

  navigateTermYear() {
    if (!this.selectedYear) {
      this.selectedYear = -1;
    }
    this.router.navigate(['/term-year'], { queryParams: { 'year': this.selectedYear.clientYearId } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Year & Term'}));
  }

  navigateSubjectGroup() {
    if (!this.selectedGradeId) {
      this.selectedGradeId = -1;
    }
    if (!this.selectedYear) {
      this.selectedYear = -1;
    }
    this.router.navigate(['/subject-group'], { queryParams: { 'grade': this.selectedGradeId, 'year': this.selectedYear.clientYearId, 'flag': 'true' } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Subject Groups'}));
  }

}
