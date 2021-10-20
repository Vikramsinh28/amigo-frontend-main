import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {YearsTermsListComponent} from './../years-terms-list/years-terms-list.component';
import {GradeAndDivisionComponent} from './../grade-and-division/grade-and-division.component';

@Component({
  selector: 'app-client-onboarding-stepper',
  templateUrl: './client-onboarding-stepper.component.html',
  styleUrls: ['./client-onboarding-stepper.component.scss']
})
export class ClientOnboardingStepperComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

}
