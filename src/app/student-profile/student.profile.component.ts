import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { BackendService } from '../backend';
import { StudentProfile, Skill, Interest, Student } from '../entities'
import { EditProfileBioComponent } from './edit-profile/edit-profile-bio.component';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { FrontendService } from '../_services/frontend.service';
import { CommonService } from '../_helpers/common';

declare var Bokeh: any;

@Component({
  selector: 'app-student.profile',
  templateUrl: './student.profile.component.html',
  styleUrls: ['./student.profile.component.scss'],
})
export class StudentProfileComponent implements OnInit {
  dataLoaded = false
  studentProfile: StudentProfile;
  studentId: number;
  SKILL = 'S'
  INTEREST = 'I'
  userRole: string;
  userIdentity: any;
  selectable = false;
  removable = false;
  addOnBlur = false;

  demographicForm;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  cropCompleted = false;
  currentImageField: string;
  pictureUrl: any;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private backendService: BackendService,
    public dialog: MatDialog,
    private snackBar: CommonService,
    private sanitizer: DomSanitizer,
    private frontendService: FrontendService
  ) { }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName
    if (this.userRole == 'Student') {
      this.studentId = this.userIdentity.studentId
      this.loadProfile(this.studentId, this.userIdentity.clientId)
      this.selectable = true
      this.removable = true
      this.addOnBlur = true
    }

    this.demographicForm = new FormGroup({
      logoGraphic: new FormControl(null, [Validators.required]),
    });
  }

  editStudentBio() {
    const dialogRef = this.dialog.open(EditProfileBioComponent, { data: { studentProfile: this.studentProfile, studentId: this.studentId, userId: this.userIdentity.userId } });
    dialogRef.disableClose = true
    dialogRef.afterClosed().subscribe((result: StudentProfile) => {
      if (result) {
        this.studentProfile = result
      }
    });
  }

  addSkillInterest(event: MatChipInputEvent, record_type: string): void {
    var input = event.input;
    var value = event.value;

    var found = false
    if (value && (value).trim() != '') {
      value = value.trim()
      var records = null
      if (record_type == this.SKILL) {
        records = this.studentProfile.skills
      } else {
        records = this.studentProfile.interests
      }
      records.forEach(record => {
        if (record.name.toUpperCase() === value.toUpperCase()) {
          found = true;
        }
      });
      if (!found) {
        this.backendService.createStudentSkillOrInterest(this.userIdentity.studentId, value, record_type, this.userIdentity.userId).toPromise().then((id: number) => {
          if (record_type == this.SKILL) {
            this.studentProfile.skills.push({ id: id, name: value });
          } else {
            this.studentProfile.interests.push({ id: id, name: value });
          }
        }).catch((error:any) => {
                    console.log(error);
                })
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeSkill(skill: Skill): void {
    const index = this.studentProfile.skills.indexOf(skill);

    if (index >= 0) {
      this.backendService.removeStudentSkillOrInterest(skill.id).toPromise().then(result => {
        this.studentProfile.skills.splice(index, 1);
      }).catch((error:any) => {
                    console.log(error);
                })
    }
  }

  removeInterest(interest: Interest): void {
    const index = this.studentProfile.interests.indexOf(interest);

    if (index >= 0) {
      this.backendService.removeStudentSkillOrInterest(interest.id).toPromise().then(result => {
        this.studentProfile.interests.splice(index, 1);
      }).catch((error:any) => {
                    console.log(error);
                })
    }
  }

  onStudentSelection(values: any) {
    let selectedStudent = values.student;
    this.cleanup_target()
    this.studentId = selectedStudent.studentId
    this.loadProfile(this.studentId, this.userIdentity.clientId)
  }

  loadProfile(studentId, clientId) {
    this.backendService.getStudentProfile(studentId, clientId).toPromise().then((data: string) => {
      this.studentProfile = JSON.parse(data)
      if (this.studentProfile) {
        this.dataLoaded = true
        if (this.studentProfile.picture) {

          var strMIME = 'png' //since our image-cropper converts all type of images to 'png'
          this.pictureUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:' + strMIME + ';base64,' + this.studentProfile.picture)
        }
        else
          this.pictureUrl = this.studentProfile.picture

      } else {

        this.dataLoaded = false;
        this.snackBar.showErrorMsg("Sorry, there isn't any data available for selected student");
      }
    }).catch((error:any) => {
                    console.log(error);
                })
    this.backendService.getStudentAcademicGraph(studentId).toPromise().then((data: string) => {
      data = JSON.parse(data)
      Bokeh.embed.embed_item(data, 'target')
    }).catch((error:any) => {
                    console.log(error);
                })
  }
  cleanup_target() {
    var target = document.querySelector('section#target')
    if (target) {
      target.innerHTML = "";
    }

  }

  get logoGraphic() {
    return this.demographicForm.get('logoGraphic');
  }

  imageCropper(field): void {
    this.currentImageField = field;
    const dialogRef = this.dialog.open(ImageCropperComponent, {
      data: {
        name: 'Cropping Tool',
        instruction: 'Please select an image to crop',
        dataField: field,
        autoSave: true
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
        this.pictureUrl = result
    });
  }
}
