import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BackendService } from 'src/app/backend';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResponseError } from 'src/app/entities/responseError';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/_helpers/common';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  noMatch: boolean = false;
  eye1 : boolean = true;
  eye2 : boolean = true;
  match: boolean = false;
  passLength: boolean = false;
  @ViewChild("current") currentPass: ElementRef;
  @ViewChild("new") newPass: ElementRef;
  @ViewChild("confirm") confirmPass: ElementRef;


  constructor(public dialogRef: MatDialogRef<ChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private backendService: BackendService,
    private snackBar: CommonService,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      currentPass: new FormControl(null, [Validators.required]),
      newPass: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(10)]),
      confirmPass: new FormControl(null, [Validators.required]),
    });
  }

  changePassword(){
    var currPass = this.form.controls.currentPass.value;
    var newPass = this.form.controls.newPass.value;
    this.backendService.changePassword(currPass, newPass)
    .toPromise().then((response: any) => {
      this.showSuccessMsg(response);
    }).catch((errorResponse: any) => {
      var e:ResponseError = JSON.parse(errorResponse.error)
      this.showErrMsg(e.message);
      this.currentPass.nativeElement.focus();
    })
  }

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  showSuccessMsg(msg) {
    let snackBarRef = this.snackBar.showSuccessMsg(msg, 'OK', null);

    snackBarRef.onAction().subscribe(()=>{
      this.dialogRef.close();
    });
  }

  toggle(option){
    if(option == 'new')
    {
      this.eye1 = !this.eye1;
      this.newPass.nativeElement.type = this.eye1 ? "password" : "text";
    }
    else{
      this.eye2 = !this.eye2;
      this.confirmPass.nativeElement.type = this.eye2 ? "password" : "text";
    }
  }

  check(){
    var newPass = this.form.controls.newPass.value;
    var confirmPass = this.form.controls.confirmPass.value;
    this.match = (newPass == confirmPass) ? false : true;
    if(newPass && confirmPass)
    {
      this.passLength = (newPass.length > 10 || newPass.length < 6 || confirmPass.length > 10 || confirmPass.length < 6) ? true : false;
    }
  }
}
