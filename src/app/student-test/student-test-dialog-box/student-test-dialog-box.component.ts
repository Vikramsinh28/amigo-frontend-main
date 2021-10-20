import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, fetchClientInternalNameFromURL } from 'src/app/_helpers/common';
import { AuthenticationService } from 'src/app/_services';
import { FrontendService } from 'src/app/_services/frontend.service';

@Component({
  selector: 'app-student-test-dialog-box',
  templateUrl: './student-test-dialog-box.component.html',
  styleUrls: ['./student-test-dialog-box.component.scss']
})
export class StudentTestDialogBoxComponent implements OnInit {

  password: any = "";
  userIdentity: any;

  constructor(private frontendService: FrontendService,
    private snackBar: CommonService,
    public dialogRef: MatDialogRef<StudentTestDialogBoxComponent>,
    private authenticate: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
  }

  startExam() {
    if (this.password.trim().length > 0) {
      try {
        var clientInternalName = fetchClientInternalNameFromURL()
        this.authenticate.login(clientInternalName, this.userIdentity.userName, this.password).toPromise().then((result: any) => {
          if (result) {
            this.dialogRef.close({ event: 'startExam' });
          }
        }, (error: any) => {
          this.showErrMsg(error.error.message);
        });
      } catch (err) {
        this.showErrMsg("Something went wrong");
      }
    } else {
      this.showErrMsg("Please enter password to start exam");
    }
  }

  cancel() {
    this.dialogRef.close({ event: 'cancel' });
  }

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }
}
