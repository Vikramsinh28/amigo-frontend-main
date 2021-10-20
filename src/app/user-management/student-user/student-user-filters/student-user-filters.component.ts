import { Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EventEmitter } from '@angular/core';
import { BackendService } from 'src/app/backend';
import { ClientYear } from 'src/app/entities/clientYear';
import { ImageCropperComponent } from 'src/app/student-profile/image-cropper/image-cropper.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { ClientDivision } from 'src/app/entities/clientDivision';
import { ClientGrade } from 'src/app/entities/clientGrade';
import { CommonService } from 'src/app/_helpers/common';

@Component({
  selector: 'app-student-user-filters',
  templateUrl: './student-user-filters.component.html',
  styleUrls: ['./student-user-filters.component.scss']
})
export class StudentUserFiltersComponent implements OnInit {
  userIdentity: any;
  form: FormGroup;
  currentImageField: string;
  pictureUrl: any = "";
  grades: any;
  clientYear: ClientYear[];
  clientDivision: ClientDivision[];
  clientGrade: ClientGrade[];
  currentYearOrder: any;
  selectedYearOrder: any;
  mandatoryGrpId: any = "";
  studentCount: number = 1;
  @Input() withValidations: any;
  @Input() filterType: any;
  @Output() searchStudent = new EventEmitter();
  @Output() studentData = new EventEmitter();
  @Output() close = new EventEmitter();
  @Output() resetData =new EventEmitter();
  userId: any;
  studentId: any;
  studentGradeId: any;
  constructor(public dialog: MatDialog,
    private frontendService: FrontendService,
    private backendService: BackendService,
    private snackBar: CommonService) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.initiateForm();
    this.getYear();
  }

  initiateForm() {
    this.form = new FormGroup({
      regNo: new FormControl('', [Validators.maxLength(30)]),
      fName: new FormControl('', [Validators.maxLength(255)]),
      mName: new FormControl('', [Validators.maxLength(255)]),
      lName: new FormControl('', [Validators.maxLength(255)]),
      academicYear: new FormControl(''),
      grade: new FormControl(''),
      division: new FormControl(''),
      activeStatus: new FormControl(2),
      gendr: new FormControl(''),
      birthDate: new FormControl(''),
      email: new FormControl('', [Validators.email, Validators.maxLength(254)]),
      phone: new FormControl('', [Validators.maxLength(15)]),
      leaveDate: new FormControl(''),
      leaveReason: new FormControl('', [Validators.maxLength(500)]),
    });
    if(this.filterType!='Search')
    {
      this.form.controls.regNo.setValidators(Validators.required);
      this.form.controls.fName.setValidators(Validators.required);
      this.form.controls.lName.setValidators(Validators.required);
      this.form.controls.gendr.setValidators(Validators.required);
      this.form.controls.birthDate.setValidators(Validators.required);
      this.form.controls.email.setValidators([Validators.required, Validators.email]);
      this.form.controls.phone.setValidators(Validators.required);
      this.form.controls.academicYear.setValidators(Validators.required);
      this.form.controls.grade.setValidators(Validators.required);
      this.form.controls.division.setValidators(Validators.required);
    }
    if(this.filterType==='View')
    {
      this.form.controls.regNo.disable();
      this.form.controls.fName.disable();
      this.form.controls.mName.disable();
      this.form.controls.lName.disable();
      this.form.controls.gendr.disable();
      this.form.controls.birthDate.disable();
      this.form.controls.email.disable();
      this.form.controls.phone.disable();
      this.form.controls.leaveDate.disable();
      this.form.controls.leaveReason.disable();
      this.form.controls.academicYear.disable();
      this.form.controls.grade.disable();
      this.form.controls.division.disable();
    }
    if(this.filterType==='Edit')
    {
      this.form.controls.academicYear.disable();
      this.form.controls.grade.disable();
    }
  }

  async getYear() {
    await this.backendService
      .getClientYear(this.userIdentity.clientId, "in_session")
      .toPromise().then((result: any) => {
        if (result) {
          this.clientYear = result;
          this.currentYearOrder = this.clientYear.filter((f) => f.isCurrentYear === 1);
          if(this.filterType==='Search')
          {
            this.form.controls.academicYear.setValue(this.currentYearOrder[0].clientYearId);
            this.onYearSelected();
          }
        }
      }).catch((error: any) => {
        this.showErrMsg(error.error);
      })
  }

  onYearSelected() {
    this.selectedYearOrder = (this.form.controls.academicYear.value==undefined) ? undefined :
        this.clientYear.filter(x => x.clientYearId === this.form.controls.academicYear.value);
    this.form.controls.grade.setValue("");
    this.form.controls.division.setValue("");
    this.clientGrade = [];
    this.clientDivision = [];
    if(this.selectedYearOrder!=undefined)
    {
      this.getClientGrade();
    }
  }

  async getClientGrade() {
    await this.backendService
      .getClientGrades(this.userIdentity.clientId, this.form.controls.academicYear.value)
      .toPromise().then(
        (result: any) => {
          this.clientGrade = result;
        }
      ).catch(e =>
        {
          this.showErrMsg(e.error);
          console.log (e);
        });
  }

  onGradeSelected() {
    this.form.controls.division.setValue("");
    this.clientDivision = [];
    this.getDivision();
  }

  getDivision() {
    this.backendService.getClientSubjectsOrGradeDivison(this.userIdentity.clientId, this.form.controls.academicYear.value, this.form.controls.grade.value, "division").toPromise().then((result: any) => {
      this.clientDivision = result;
    }).catch((error: any) => {
      this.showErrMsg(error.error);
    })
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
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.pictureUrl = "";
          this.pictureUrl = result;
        }
      });
    }
  }

  getStudentUserData(): any {
    let studentData: any = {
      regNo: this.form.controls.regNo.dirty ? (this.form.controls.regNo.value ? this.form.controls.regNo.value.toString().trim() : null) : null,
      fName: this.form.controls.fName.dirty ? (this.form.controls.fName.value ? this.form.controls.fName.value.toString().trim() : null) : null,
      mName: this.form.controls.mName.dirty ? (this.form.controls.mName.value ? this.form.controls.mName.value.toString().trim() : null) : null,
      lName: this.form.controls.lName.dirty ? (this.form.controls.lName.value ? this.form.controls.lName.value.toString().trim() : null) : null,
      academicYear: this.form.controls.academicYear.value ? this.form.controls.academicYear.value : null,
      grade: this.form.controls.grade ? (this.form.controls.grade.value ? this.form.controls.grade.value : null) : null,
      division: this.form.controls.division.dirty ? (this.form.controls.division.value ? this.form.controls.division.value : null) : null,
      activeStatus: this.form.controls.activeStatus.value,
      currentYearOrder: this.currentYearOrder ? this.currentYearOrder[0].yearOrder : null,
      selectedYearOrder: this.selectedYearOrder ? this.selectedYearOrder[0].yearOrder : null,
      phone: this.form.controls.phone.dirty ? (this.form.controls.phone.value ? this.form.controls.phone.value : null) : null,
      email: this.form.controls.email.dirty ? (this.form.controls.email.value ? this.form.controls.email.value : null) : null,
      gendr: this.form.controls.gendr.dirty ? (this.form.controls.gendr.value === 1 ? 'M' : 'F') : null,
      birthDate: this.form.controls.birthDate.dirty ? (this.form.controls.birthDate.value ? this.form.controls.birthDate.value : null) : null,
      picture: this.pictureUrl ? this.pictureUrl : "",
      leaveDate: this.form.controls.leaveDate.dirty ? (this.form.controls.leaveDate.value ? this.form.controls.leaveDate.value : null) : null,
      leaveReason: this.form.controls.leaveReason.dirty ? (this.form.controls.leaveReason.value ? this.form.controls.leaveReason.value : null) : null,
    }
    return studentData
  }

  async setStudentUserData(data) {
    this.form.controls.regNo.setValue(data.regNo);
    this.form.controls.fName.setValue(data.firstName);
    this.form.controls.mName.setValue(data.middleName);
    this.form.controls.lName.setValue(data.lastName);
    this.form.controls.academicYear.setValue(data.yearId);
    await this.getClientGrade();
    this.form.controls.grade.setValue(data.gradeId);
    await this.getDivision();
    this.form.controls.division.setValue(data.gradeDivisionId);
    this.form.controls.activeStatus.setValue(data.user.activeState);
    this.form.controls.gendr.setValue(data.gender === "M" ? 1 : 2);
    this.form.controls.birthDate.setValue(data.birthDate);
    this.form.controls.phone.setValue(data.user.phone ? data.user.phone : "");
    this.form.controls.email.setValue(data.user.email ? data.user.email : "");
    this.form.controls.leaveDate.setValue(data.leaveDate);
    this.form.controls.leaveReason.setValue(data.leaveReason);
    this.pictureUrl = data.user.picture ? data.user.picture : "";
    this.userId = data.user.userId;
    this.studentId = data.studentId;
    this.studentGradeId = data.studentGradeId;
    this.mandatoryGrpId = data.mandatoryGrpId;
    this.studentCount = data.studentCount;
  }

  onSearchBtnClick() {
    this.searchStudent.emit(this.getStudentUserData());
  }

  // Send student data on create/update
  insertOrUpdateStudentData(action) {
    if (this.form.valid) {
      let studentData = this.getStudentUserData();
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
        clientId: this.userIdentity.clientId,
        regNo: studentData.regNo,
        fName: studentData.fName,
        mName: studentData.mName,
        lName: studentData.lName,
        gendr: studentData.gendr,
        birthDate: studentData.birthDate,
        leaveDate: studentData.leaveDate,
        leaveReason: studentData.leaveReason,
        academicYear: studentData.academicYear,
        gradeDivisionId: studentData.division,
        studentId: this.studentId,
        studentGradeId: this.studentGradeId,
        userDto: {
          email: studentData.email,
          phone: studentData.phone,
          userId: this.userId,
          userLinkId: this.studentId,
          clientId: this.userIdentity.clientId,
          pictureString: pictureData
        }

      }
      if (this.filterType === 'Create') {
        data.createUserId = this.userIdentity.userId;
        this.backendService.postStudentDetailsObboardingProcess(data).toPromise().then((result) => {
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
        this.backendService.putStudentDetailsObboardingProcess(data).toPromise().then((result) => {
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
    if(this.filterType==='Search')
    {
      this.form.controls.academicYear.setValue(this.currentYearOrder[0].clientYearId);
      this.onYearSelected();
    }
    this.resetData.emit(null);
  }

  clearDate() {
    this.form.controls.leaveDate.setValue('');
  }

  toggleAction(){
    if(this.filterType==='Search')
    {
      this.onSearchBtnClick();
    }
    if(this.filterType==='Edit' || this.filterType==='Create')
    {
      this.insertOrUpdateStudentData('return');
    }
  }
}
