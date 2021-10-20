import { Component, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-years-terms-add-edit',
  templateUrl: './years-terms-add-edit.component.html',
  styleUrls: ['./years-terms-add-edit.component.scss']
})
export class YearsTermsAddEditComponent implements AfterViewInit {

  user : any;
  form : FormGroup;
  loaded: boolean = false
  
  constructor() {}
  ngOnInit(){
    this.loaded = true
    this.form = new FormGroup({
      year: new FormControl(null, Validators.required),
      term: new FormControl(null),
      term1: new FormControl(null),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      startDate1: new FormControl(null, Validators.required),
      endDate1: new FormControl(null, Validators.required),
      
     
    });
    
  }
  ngAfterViewInit() {}
  
}
