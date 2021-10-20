import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend/backend.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ClientYear } from '../entities/clientYear';
import { YearTerm } from '../entities/yearTerm';
import { FrontendService } from '../_services/frontend.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { EventQueueService, AppEvent, AppEventType} from '../_services/broadcast-events/event.queue.service';
import { ResponseError } from '../entities/responseError';
import { CommonService } from '../_helpers/common';

@Component({
  selector: 'app-term-year',
  templateUrl: './term-year.component.html',
  styleUrls: ['./term-year.component.scss'],
})
export class TermYearComponent implements OnInit {
  termDisplayColumn: string[] = ['termName', 'edit', 'delete'];

  yearDisplayColumn: string[] = ['AcademicYear'];
  termDataSource = new MatTableDataSource<YearTerm>();
  yearDataSource = new MatTableDataSource<ClientYear>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  editRowNo: number;
  clientYear: ClientYear[];
  userIdentity: any;
  selectedYear: any;
  currentYear: any;
  // isInEditMode: boolean = false;
  currentYearOrder: number;
  selectedYearOrder: number;
  defaultTermId: number = 0;
  showTermBtn: boolean = true;
  tempData: string;
  selection = new SelectionModel<ClientYear>(false, []);
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
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.backendService
      .getClientYear(this.userIdentity.clientId, "default")
      .toPromise().then((result: any) => {
        this.yearDataSource.data = result;
        this.yearDataSource.data.forEach((f) => {
          if (this.year && f.clientYearId == this.year) {
            this.onYearSelected(f);
            this.selection.toggle(f);
          }
          else if (f.isCurrentYear == 1) {
            this.currentYear = f.year;
            if (!this.year) {
              this.currentYearOrder = f.yearOrder;
              this.selectedYearOrder = f.yearOrder;
              this.onYearSelected(f);
              this.selection.toggle(f);
            }
          }
        });
      }).catch((error:any) => {
                    console.log(error);
                }),
      () => { };
  }

  ngAfterViewInit() { }

  addYear() {
    let newAcademicYear = this.yearDataSource.data[0].year.split('-', 2);
    newAcademicYear[0] = (parseInt(newAcademicYear[0]) + 1).toString();
    newAcademicYear[1] = (parseInt(newAcademicYear[1]) + 1).toString();
    let clientYearDetails: ClientYear = {
      year: newAcademicYear[0] + '-' + newAcademicYear[1],
      clientId: this.userIdentity.clientId,
      yearOrder: this.yearDataSource.data[0].yearOrder + 1,
      isCurrentYear: 2,
      createUserId: this.userIdentity.userId,
    };
    if (clientYearDetails.yearOrder - this.currentYearOrder == 1) {
      let dialogMsg =
        'Are you sure you want to create new academic year ' +
        clientYearDetails.year +
        ' ?';
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: 'Confirm New Year',
          message: dialogMsg,
          yes: 'Yes',
          no: 'No',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.backendService
            .postClientYear(clientYearDetails)
            .toPromise().then((result: any) => {
              let yearData = this.yearDataSource.data;
              clientYearDetails.clientYearId = result;
              yearData.push(clientYearDetails);
              this.yearDataSource.data = yearData
                .sort((a, b) => <any>a.yearOrder - <any>b.yearOrder)
                .reverse();
              this.onYearSelected(clientYearDetails);
              this.snackBar.showSuccessMsg("Academic year " + clientYearDetails.year + " inserted sucessfully");
            }).catch((errorResponse) => {
              var e:ResponseError = JSON.parse(errorResponse.error);
              this.snackBar.showErrorMsg(e.message);
            });
        }
      });
    } else {
      this.snackBar.showErrorMsg('Cannot add more than 1 academic year');
    }
  }

  addTerm() {
    if (this.selectedYearOrder >= this.currentYearOrder) {
      this.defaultTermId = this.defaultTermId - 1;
      let term: YearTerm = {
        termId: this.defaultTermId,
        clientYearId: -1,
        termName: null,
        yearOrder: this.selectedYearOrder,
        countTermUsedInExam: 0,
        openForEdit: false,
      };
      var data = this.termDataSource.data;
      data.push(term);
      this.termDataSource.data = data;
      // this.isInEditMode = true;
      this.editRowNo = this.termDataSource.data.length - 1;
    }
  }

  editTerm(rowNo, data) {
    this.termDataSource.data[rowNo].openForEdit = false;
    this.tempData = data.termName
  }

  saveTerm(rowNo, data) {
    if (!this.validateData(data)) {
      let termData: YearTerm = {
        clientYearId: this.selectedYear,
        termName: data.termName.trim(),
      };
      // Check is this new data inserted.
      if (data.termId < 0) {
        this.backendService
          .postClientTerm(
            termData,
            this.userIdentity.clientId,
            this.userIdentity.userId
          )
          .toPromise().then(
            (result: any) => {
              this.termDataSource.data[rowNo].termId = result;
              this.termDataSource.data[rowNo].openForEdit = true;
              this.snackBar.showSuccessMsg("Term " + termData.termName + " inserted sucessfully");
            })
            .catch((error: any) => {
              this.termDataSource.data[rowNo].openForEdit = false;
              this.snackBar.showErrorMsg(error.error);
            }
          );
      } else {
        termData.termId = data.termId;
        this.backendService
          .putClientTerm(termData, this.userIdentity.clientId, this.userIdentity.userId)
          .toPromise().then(
            (result: any) => {
              this.termDataSource.data[rowNo].openForEdit = true;
              this.snackBar.showSuccessMsg(result);
            })
            .catch((error: any) => {
              this.termDataSource.data[rowNo].openForEdit = false;
              this.snackBar.showErrorMsg(error.error);
            }
          );
      }
    }
  }
  deleteTerm(data) {
    if (data.termId > 0) {
      let dialogMsg =
        'Are you sure you want to delete ' +
        data.termName +
        ' of ' +
        this.currentYear +
        ' ?';
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: 'Confirm Term Delete',
          message: dialogMsg,
          yes: 'Delete',
          no: 'Cancel',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.backendService.deleteClientTerm(data.termId).toPromise().then(
            (result) => {
              this.termDataSource.data = this.termDataSource.data.filter(
                (value) => {
                  return value.termId != data.termId;
                }
              );
              this.snackBar.showSuccessMsg(result);
            })
            .catch((error) => {
              this.snackBar.showErrorMsg(error.error);
            }
          );
        }
      });
    } else {
      // Delete new added row which is not in database.
      this.termDataSource.data = this.termDataSource.data.filter((value) => {
        return value.termId != data.termId;
      });
    }
  }

  onYearSelected(data) {
    if (data.yearOrder < this.currentYearOrder) {
      this.showTermBtn = false;
    } else {
      this.showTermBtn = true;
    }
    this.selectedYear = data.clientYearId;
    this.selectedYearOrder = data.yearOrder;
    this.backendService
      .getClientTerm(this.userIdentity.clientId, data.clientYearId)
      .toPromise().then((result: any) => {
        this.termDataSource.data = result;
        this.termDataSource.data.forEach((f) => {
          f.openForEdit = true;
        });
      }).catch((error:any) => {
                    console.log(error);
                }),
      () => { };
  }

  validateData(data) {
    if (data.termName !== null) {
      if (data.termName.trim().length > 0) {
        return false;
      } else {
        this.snackBar.showErrorMsg('All fields are required');
        return true;
      }
    } else {
      this.snackBar.showErrorMsg('All fields are required');
      return true;
    }
  }

  escpTermName(rowNo) {
    this.termDataSource.data[rowNo].termName = this.tempData;
  }

  navigateGradeDivision() {
    this.router.navigate(['/grade-division'], { queryParams: { 'year': this.selectedYear } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Grade & Division'}));
  }
}
