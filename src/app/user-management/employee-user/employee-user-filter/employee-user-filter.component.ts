import { Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EventEmitter } from '@angular/core';
import { BackendService } from 'src/app/backend';
import { ImageCropperComponent } from 'src/app/student-profile/image-cropper/image-cropper.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { CommonService } from 'src/app/_helpers/common';

@Component({
  selector: 'app-employee-user-filter',
  templateUrl: './employee-user-filter.component.html',
  styleUrls: ['./employee-user-filter.component.scss']
})
export class EmployeeUserFilterComponent implements OnInit {
  userIdentity: any;
  form: FormGroup;
  currentImageField: string;
  pictureUrl: any = "";
  @Input() withValidations: any;
  @Input() filterType: any;
  @Output() searchEmployee = new EventEmitter();
  @Output() employeeData = new EventEmitter();
  @Output() close = new EventEmitter();
  @Output() resetData =new EventEmitter();
  userId: any;
  empId: any;
  clientRoleList: any;
  constructor(public dialog: MatDialog,
    private frontendService: FrontendService,
    private backendService: BackendService,
    private snackBar: CommonService) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.form = new FormGroup({
      empNo: new FormControl('', [Validators.maxLength(30)]),
      fName: new FormControl('', [Validators.maxLength(255)]),
      mName: new FormControl('', [Validators.maxLength(255)]),
      lName: new FormControl('', [Validators.maxLength(255)]),
      activeStatus: new FormControl(2),
      gendr: new FormControl(''),
      birthDate: new FormControl(''),
      email: new FormControl('', [Validators.email, Validators.maxLength(254)]),
      phone: new FormControl('', [Validators.maxLength(15)]),
      title: new FormControl('', [Validators.maxLength(50)]),
      clientRoleId: new FormControl(''),
    });
    if(this.filterType!='Search')
    {
      this.form.controls.empNo.setValidators(Validators.required);
      this.form.controls.fName.setValidators(Validators.required);
      this.form.controls.lName.setValidators(Validators.required);
      this.form.controls.birthDate.setValidators(Validators.required);
      this.form.controls.gendr.setValidators(Validators.required);
      this.form.controls.email.setValidators([Validators.required,Validators.email]);
      this.form.controls.phone.setValidators(Validators.required);
      this.form.controls.clientRoleId.setValidators(Validators.required);
      this.form.controls.title.setValidators(Validators.required);
    }
    if(this.filterType==='View')
    {
      this.form.controls.empNo.disable();
      this.form.controls.fName.disable();
      this.form.controls.mName.disable();
      this.form.controls.lName.disable();
      this.form.controls.gendr.disable();
      this.form.controls.birthDate.disable();
      this.form.controls.email.disable();
      this.form.controls.phone.disable();
      this.form.controls.clientRoleId.disable();
      this.form.controls.title.disable();
    }
  }

  imageCropper(field): void {
    if(this.filterType!=='View')
    {
      this.currentImageField = field;
      const dialogRef = this.dialog.open(ImageCropperComponent, {
        data: {
          name: 'Cropping Tool',
          instruction: 'Please select an image to crop',
          dataField: field,
          autoSave: false
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.pictureUrl = "";
          this.pictureUrl = result;
        }
      });
    }
  }

  getEmployeeUserData(): any {
    let employeeData: any = {
      empNo: this.form.controls.empNo.dirty ? (this.form.controls.empNo.value ? this.form.controls.empNo.value.toString().trim() : null) : null,
      fName: this.form.controls.fName.dirty ? (this.form.controls.fName.value ? this.form.controls.fName.value.toString().trim() : null) : null,
      mName: this.form.controls.mName.dirty ? (this.form.controls.mName.value ? this.form.controls.mName.value.toString().trim() : null) : null,
      lName: this.form.controls.lName.dirty ? (this.form.controls.lName.value ? this.form.controls.lName.value.toString().trim() : null) : null,
      phone: this.form.controls.phone.dirty ? (this.form.controls.phone.value ? this.form.controls.phone.value : null) : null,
      email: this.form.controls.email.dirty ? (this.form.controls.email.value ? this.form.controls.email.value : null) : null,
      gendr: this.form.controls.gendr.dirty ? (this.form.controls.gendr.value === 1 ? 'M' : 'F') : null,
      birthDate: this.form.controls.birthDate.value ? this.form.controls.birthDate.value : null,
      picture: this.pictureUrl ? this.pictureUrl : "",
      activeStatus: this.form.controls.activeStatus.value,
      clientRoleId: this.form.controls.clientRoleId.dirty ? (this.form.controls.clientRoleId.value ? this.form.controls.clientRoleId.value : null) : null,
      title: this.form.controls.title.dirty ? (this.form.controls.title.value ? this.form.controls.title.value : null) : null
    }
    return employeeData
  }

  async setEmployeeUserData(data) {
    this.clientRoleList = data.clientRoleList;
    this.form.controls.empNo.setValue(data.clientEmployeeNo);
    this.form.controls.fName.setValue(data.firstName);
    this.form.controls.mName.setValue(data.middleName);
    this.form.controls.lName.setValue(data.lastName);
    this.form.controls.gendr.setValue(data.gender === "M" ? 1 : 2);
    this.form.controls.birthDate.setValue(data.birthdate);
    this.form.controls.phone.setValue(data.user.phone ? data.user.phone : "");
    this.form.controls.email.setValue(data.user.email ? data.user.email : "");
    this.pictureUrl = data.user.picture ? data.user.picture : "";
    this.userId = data.user.userId;
    this.empId = data.employeeId
    this.form.controls.clientRoleId.setValue(data.user.clientRoleId);
    this.form.controls.title.setValue(data.title);
  }

  onSearchBtnClick() {
    this.searchEmployee.emit(this.getEmployeeUserData());
  }

  setClientRoleList(roleList) {
    this.clientRoleList = roleList;
  }

  // Send employee data on create/update
  insertOrUpdateemployeeData(action) {
    if (this.form.valid) {
      let employeeData = this.getEmployeeUserData();
      let pictureData = "";
      if (this.pictureUrl) {
        if (this.pictureUrl.changingThisBreaksApplicationSecurity) {
          pictureData = this.pictureUrl.changingThisBreaksApplicationSecurity.split(",")[1];
          pictureData = pictureData.replace(/\n/g, "");
        } else {
          pictureData = this.pictureUrl.split(",")[1];
          pictureData = pictureData.replace(/\n/g, "");
        }
      }
      let data: any = {
        empNo: employeeData.empNo,
        fName: employeeData.fName,
        mName: employeeData.mName,
        lName: employeeData.lName,
        gendr: employeeData.gendr,
        birthDate: employeeData.birthDate,
        title: employeeData.title,
        clientRoleId: employeeData.clientRoleId,
        employeeId: this.empId,
        userDto: {
          email: employeeData.email,
          phone: employeeData.phone,
          userId: this.userId,
          pictureString: pictureData,
          clientRoleId: employeeData.clientRoleId,
          userLinkId: this.empId
        }
      }
      if (this.filterType === 'Create') {
        data.createUserId = this.userIdentity.userId;
        this.backendService.postEmployeeeDetailsObboardingProcess(data).toPromise().then((result) => {
          this.form.markAsPristine();
          this.showSucessMsg(result);
          this.reset();
          if(action == 'return')
          {
            this.close.emit(null);
          }
        }).catch((error: any) => {
          this.showErrMsg(error.error);
        })
      } else if (this.filterType === 'Edit') {
        data.updateUserId = this.userIdentity.userId;
        data.userDto.updateUserId = this.userIdentity.userId;
        this.backendService.putEmployeeeDetailsObboardingProcess(data).toPromise().then((result) => {
          this.form.markAsPristine();
          this.showSucessMsg(result);
          this.close.emit(null);
        }).catch((error: any) => {
          this.showErrMsg(error.error);
        })
      }
    }
  }

  // <------------------------ Common Function --------------------------------->
  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }
  showSucessMsg(msg) {
    this.snackBar.showSuccessMsg(msg);
  }

  reset() {
    this.form.reset();
    this.form.controls.activeStatus.patchValue(2);
    this.resetData.emit(null);
  }

  toggleAction(){
    if(this.filterType==='Search')
    {
      this.onSearchBtnClick();
    }
    if(this.filterType==='Edit' || this.filterType==='Create')
    {
      this.insertOrUpdateemployeeData('return');
    }
  }

}
