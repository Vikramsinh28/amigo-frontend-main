import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/backend';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ResponseError } from 'src/app/entities/responseError';
import { SNY, SNYGrade } from 'src/app/entities/startNewYear';
import { CommonService } from 'src/app/_helpers/common';
import { EventQueueService, AppEvent, AppEventType} from '../../_services/broadcast-events/event.queue.service';

@Component({
  selector: 'app-start-new-year',
  templateUrl: './start-new-year.component.html',
  styleUrls: ['./start-new-year.component.scss']
})
export class StartNewYearComponent implements OnInit {

  leftDisplayedColumns: string[] = ['grade', 'totalCnt', 'promotedCnt', 'lcCnt', 'closeSession'];
  rightDisplayedColumns: string[] = ['grade', 'totalCnt'];
  startNewYearDetails: SNY
  leftDS = new MatTableDataSource<SNYGrade>();
  rightDS = new MatTableDataSource<SNYGrade>();
  loaded: boolean = false
  label1: string = '';
  label2: string = '';
  
  constructor(private backendService: BackendService,
    private snackBar: CommonService,
    public dialog: MatDialog,
    private router: Router,
    private eventQueue: EventQueueService) { }

  ngOnInit(): void {
    this.reset();
    this.loadData();
  }

  loadData() {
    this.backendService.getStartNewYearData().toPromise().then((result: any) => {
      this.startNewYearDetails = JSON.parse(result)
      this.setYrLabel()

      this.leftDS.data = this.startNewYearDetails.left.grades
      this.rightDS.data = this.startNewYearDetails.right.grades
      this.loaded = true
    }).catch((error:any) => {
      this.showErrMsg(error.error);
    })
  }

  setYrLabel() {
    if (this.startNewYearDetails.futureYearPresent) {
      this.label1 = 'Current Year';
      this.label2 = 'Upcoming Year';
    }
    else {
      this.label1 = 'Previous Year';
      this.label2 = 'Current Year';
    }
  }

  closeSession(snyGrade: SNYGrade) {
    if (snyGrade.totalCnt == snyGrade.lcCnt + snyGrade.promotedCnt) {
      this.backendService.putCloseSession(snyGrade.gradeId).toPromise().then((result: any) => {
        console.log(result)
        snyGrade.inSession = false
      }).catch((errorResponse:any) => {
        var e:ResponseError = JSON.parse(errorResponse.error)
        this.showErrMsg(e.message)
      })
    } else {
      this.showErrMsg("Cannot close session as all students need to either be promoted or marked left.")
    }
  }

  startNewYear() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm', message: 'Are you sure you want to set: \'' + this.startNewYearDetails.right.yrLabel + '\' as current year?'
          + '\n\n Note: You will not able to undo this action.', yes: 'Yes', no: 'No'
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.backendService.putStartNewYear(false).toPromise().then((result: any) => {
          if (result) {
            window.location.reload();
            this.indicateStartNewYearDone()
          }
        }).catch((error: any) => {
          var e: ResponseError = JSON.parse(error.error)
          if (e.message.startsWith("[E1009]")) {
            var errMsg = e.message.substring(7)
            const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
              width: '350px',
              data: {
                title: 'Confirm', message: errMsg + ' Are you sure you want to Start New Year?', yes: 'Yes', no: 'No'
              },
              disableClose: true,
            });
            dialogRef.afterClosed().subscribe(async result => {
              if (result) {
                this.backendService.putStartNewYear(true).toPromise().then((result: any) => {
                  this.indicateStartNewYearDone()
                })
                 .catch( (error: any) => {
                    var e: ResponseError = JSON.parse(error.error)
                    this.showSucessMsg(e.message)
                  })
              }
            });
          } else {
            this.showErrMsg(e.message);
          }
        })
      }
    });

  }
  indicateStartNewYearDone() {
    this.showSucessMsg("Current year is set to \'" + this.startNewYearDetails.right.yrLabel + "\'");
    this.startNewYearDetails.futureYearPresent = false
    this.startNewYearDetails.left.currentAcademicYear = false
    this.startNewYearDetails.right.currentAcademicYear = true
    this.setYrLabel()
  }

  reset() {
    this.startNewYearDetails = null;
    this.leftDS.data = null;
    this.rightDS.data = null;
    this.loaded = false;
  }


  showSucessMsg(msg) {
    this.snackBar.showSuccessMsg(msg);
  }


  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  navigateRollNo() {
    this.router.navigate(['/student-rollNo']);
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Roll Number'}));
  }

}
