import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from '../../backend';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudentProfile } from '../../entities'
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-bio',
  templateUrl: './edit-profile-bio.component.html',
  styleUrls: ['./edit-profile-bio.component.scss']
})
export class EditProfileBioComponent implements OnInit {
  form: FormGroup;
  studentProfile: StudentProfile;
  studentId: any;
  userId: any;

  constructor(private backendService: BackendService, public dialogRef: MatDialogRef<EditProfileBioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.studentProfile = this.data.studentProfile
    this.studentId = this.data.studentId
    this.userId = this.data.userId
  }

  ngOnInit(): void {
    if (this.studentProfile != null) {
      this.form = new FormGroup({
        about_me: new FormControl(this.studentProfile.about_me != null ? this.studentProfile.about_me : ''),
        city: new FormControl(this.studentProfile.city != null ? this.studentProfile.city : ''),
        state: new FormControl(this.studentProfile.state != null ? this.studentProfile.state : ''),
        country: new FormControl(this.studentProfile.country != null ? this.studentProfile.country : ''),
        phone: new FormControl(this.studentProfile.phone != null ? this.studentProfile.phone : '', [Validators.maxLength(15)]),
        email: new FormControl(this.studentProfile.email != null ? this.studentProfile.email : '',  Validators.email),
        profile_summary: new FormControl(this.studentProfile.profile_summary != null ? this.studentProfile.profile_summary : '')
      });
    }
  }

  onSubmit(frm) {
    const fd = new FormData();
    fd.append("student_id", this.studentId);
    fd.append("user_id", this.userId);
    fd.append("about_me", frm.get('about_me').value);
    fd.append("city", frm.get('city').value);
    fd.append("state", frm.get('state').value);
    fd.append("country", frm.get('country').value);
    fd.append("phone", frm.get('phone').value);
    fd.append("email", frm.get('email').value);
    fd.append("profile_summary", frm.get('profile_summary').value);
    this.backendService.updateStudentProfileBio(fd).toPromise().then(
      (result: string) => {
        this.studentProfile.about_me = frm.get('about_me').value
        this.studentProfile.city = frm.get('city').value
        this.studentProfile.state = frm.get('state').value
        this.studentProfile.country = frm.get('country').value
        this.studentProfile.phone = frm.get('phone').value
        this.studentProfile.email = frm.get('email').value
        this.studentProfile.profile_summary = frm.get('profile_summary').value
        this.dialogRef.close(this.studentProfile);
      }).
      catch((err: any) => {
        console.log(err)
      }
    );
  }

  get phone() { return this.form.get('phone'); }
  get email() { return this.form.get('email'); }

}
