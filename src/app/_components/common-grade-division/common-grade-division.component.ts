import { MatSelect } from '@angular/material/select';
import { BackendService } from 'src/app/backend';
import { Component, forwardRef, OnInit, Input, AfterViewInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ControlContainer, FormControl, FormGroup, NgForm, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { CommonService } from 'src/app/_helpers/common';
export class CommonGradeDivisionConfiguration {
  isBypassAcl: boolean = false;
  isBypassAclShowAllYears: boolean = false;
  //------------------------------
  yearMode: String = "single"
  isMultiYear: boolean = false
  isYearRequired: boolean = true
  yearValue: any
  isYearDisabled: boolean = false;
  //----------------------------
  isMultiGrade: boolean = true
  isGradeVisible: boolean = true
  isGradeRequired: boolean = true
  gradeValue: any
  isGradeDisabled: boolean = false;
  //isGradeAutoSelect: boolean = false;
  //-----------------------------
  isMultiDivision: boolean = true
  isDivisionVisible: boolean = true
  isDivisionRequired: boolean = true
  divisionValue: any
  isDivisionAutoSelect: boolean = false
  isDivisionDisabled: boolean = false;
  //------------------------------
  isMultiSubject : boolean = false
  isSubjectVisible: boolean = true
  isSubjectRequired: boolean = true
  subjectValue: any
  isSubjectDisabled: boolean = false;
  isSubjectCombined: boolean = false;
  isSubjectNeeded: boolean = false;
  //------------------------------
  isMultiStudent: boolean = true
  isStudentVisible: boolean = false
  isStudentRequired: boolean = true
  studentValue: any
  isStudentDisabled: boolean = false;
}
@Component({
  selector: 'app-common-grade-division',
  templateUrl: './common-grade-division.component.html',
  styleUrls: ['./common-grade-division.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonGradeDivisionComponent),
      multi: true,
    },
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})

export class CommonGradeDivisionComponent implements OnInit, AfterViewInit {

  onChange: Function = (value: any) => { };
  onTouched: Function = () => { };
  @Input() config: CommonGradeDivisionConfiguration;
  @Output() yearSelectionChanged = new EventEmitter();
  @Output() gradeSelectionChanged = new EventEmitter();
  @Output() divisionSelectionChanged = new EventEmitter();
  @Output() subjectSelectionChanged = new EventEmitter();
  @Input() filterType: string;
  @Input() yearMode: string = "PastCurrentNext"; // possible values: PastCurrentNext, CurrentNext, PastCurrent

  clientYears: any[] = [];
  clientGrades: any[] = [];
  clientDivisions: any[] = [];
  clientSubjects: any[] = [];
  clientStudents: any[] = []

  userIdentity: any;
  cachedData: any[] = [];
  controlForm: FormGroup;
  isReady: boolean = false;

  @ViewChild('ckallSelectGrade') allGrade: MatCheckbox;
  @ViewChild('ckallSelectDivision') allDivision: MatCheckbox;
  @ViewChild('ckallSelectSubject') allSubject: MatCheckbox;
  @ViewChild('ckallSelectStudent') allStudent: MatCheckbox;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackBar: CommonService
  ) { }

  ngAfterViewInit(): void { }

  ngOnInit(): void {
    if (!this.config) {
      this.config = new CommonGradeDivisionConfiguration();
    }
    this.createForm();

    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.backendService.getYearGradeDivisionSubject(this.config.isBypassAcl, this.config.isBypassAclShowAllYears)
      .toPromise().then((result: any) => {
        this.clientYears = result.map(o => ({ id: o.clientYrId, name: o.yrLabel }))
        this.clientYears = this.findUnique(this.clientYears)
        this.cachedData = result;
        this.isReady = true;
      })
      .catch((error:any) => {
                    console.log(error);
                });
  }

  createForm() {
    this.controlForm = new FormGroup({});
    //Year control
    if (this.config.isYearRequired)
      this.controlForm.addControl('year', new FormControl(this.config.yearValue, Validators.required));
    else
      this.controlForm.addControl('year', new FormControl(this.config.yearValue));

    if (this.config.isYearDisabled)
      this.controlForm.controls.year.disable({ onlySelf: true });

    //Grade control
    if (this.config.isGradeVisible) {
      if (this.config.isGradeRequired)
        this.controlForm.addControl('grade', new FormControl(this.config.gradeValue, Validators.required));
      else
        this.controlForm.addControl('grade', new FormControl(this.config.gradeValue));

      if (this.config.isGradeDisabled)
        this.controlForm.controls.grade.disable({ onlySelf: true });
    }

    //Division control
    if (this.config.isDivisionVisible) {
      if (this.config.isDivisionRequired)
        this.controlForm.addControl('division', new FormControl(this.config.divisionValue, Validators.required));
      else
        this.controlForm.addControl('division', new FormControl(this.config.divisionValue));

      if (this.config.isDivisionDisabled)
        this.controlForm.controls.division.disable({ onlySelf: true });
    }

    //Subject control
    if (this.config.isSubjectVisible) {
      if (this.config.isSubjectRequired)
        this.controlForm.addControl('subject', new FormControl(this.config.subjectValue, Validators.required));
      else
        this.controlForm.addControl('subject', new FormControl(this.config.subjectValue));

      if (this.config.isSubjectDisabled)
        this.controlForm.controls.subject.disable({ onlySelf: true });
    }

    //Student Control
    if (this.config.isStudentVisible) {
      if (this.config.isStudentRequired)
        this.controlForm.addControl('student', new FormControl(this.config.studentValue, Validators.required));
      else
        this.controlForm.addControl('student', new FormControl(this.config.studentValue));

      if (this.config.isStudentDisabled)
        this.controlForm.controls.student.disable({ onlySelf: true });
    }
  }

  findUnique(arr) {
    arr = arr.reduce(
      (accumulator, current) => {
        if (!accumulator.some(x => x.id == current.id)) {
          accumulator.push(current)
        }
        return accumulator;
      }, []
    )
    return arr;
  }

  get ready() {
    return this.isReady;
  }

  writeValue(value) {
    this.assignValues(value);
  }

  get value() {
    return this.extractValues();
  }

  set value(value) {
    this.assignValues(value);
  }

  assignValues(value) {
    if (value && this.isReady) {
      if (value.year) {
        this.controlForm.controls.year.setValue(value.year);
        this.onYearSelected();
      }
      if (value.grade) {
        this.controlForm.controls.grade.setValue(value.grade);
        this.onGradeSelected(null);
      }
      if (value.division) {
        this.controlForm.controls.division.setValue(value.division);
        this.onDivisionSelected(null);
      }
      if (value.subject) {
        if (value.subject == "null") {
          this.controlForm.controls.subject.setValue('');
        }
        else {
          this.controlForm.controls.subject.setValue(value.subject);
        }
        this.onSubjectSelected(this.controlForm.value);
      }
      if (value.student) {
        this.controlForm.controls.student.setValue(value.student);
        this.onStudentSelected(null);
      }

    }
    else {
      setTimeout(() => { this.assignValues(value); }, 100);
    }
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }
  onYearSelected() {
    if (this.config.isGradeVisible) {
      this.resetVariables();

      let selectedYears = this.controlForm.controls.year.value;
      let years = this.cachedData.filter(e => e.clientYrId === selectedYears);

      if (years) {
        years.forEach(year => {
          this.clientGrades.push(year.grade);
        });
      }

    }
    this.onChange(this.controlForm.value);
    this.onTouched();
    this.yearSelectionChanged.emit(this.controlForm.value);
  }

  onGradeSelected(event) {
    let selectedGrades = this.controlForm.controls.grade.value;
    let selectedYears = this.controlForm.controls.year.value;
    // for divisions
    //----------------------------------------------------------------------
    if (this.config.isDivisionVisible) {
      let ids: any;
      this.clientDivisions = []
      this.controlForm.controls.division.reset();

      //for single select
      if (!Array.isArray(selectedGrades)) {
        if (selectedGrades) {
          this.clientDivisions = this.cachedData.filter(e => e.clientYrId == selectedYears && e.grade.id == selectedGrades)[0].divisions;
          ids = this.clientDivisions.map(d => d.division.id);
        }
      }
      else {
        // for multiselect
        this.clientDivisions = this.cachedData.filter((e1) => {
          return selectedGrades.some((g) => {
            return g === e1.grade.id && e1.clientYrId == selectedYears
          })
        });

        ids = [];
        this.clientDivisions.forEach(grade => {
          ids.push(...(grade.divisions.map(division => division.id)))
        })
      }
      // If Division autoselect = true, then upon selection of the grade, all the corresponding divisions
      // will be selected by default
      if (this.config.isDivisionAutoSelect) {
         this.controlForm.controls.division.setValue(ids);
         this.onDivisionSelected(null);
      }
    }
    // for students
    //-------------------------------------------------------------------------
    if (this.config.isStudentVisible) {
      this.clientStudents = []
      this.controlForm.controls.student.reset();
    }
    this.onChange(this.controlForm.value);
    this.onTouched();
    this.gradeSelectionChanged.emit(this.controlForm.value);
  }

  onDivisionSelected(event) {
    let selectedGrades = this.controlForm.controls.grade.value;
    let selectedYears = this.controlForm.controls.year.value;
    let selectedDivisions = this.controlForm.controls.division.value;

    // for subjects
    //-------------------------------------------------------------------------
    if (this.config.isSubjectVisible || this.config.isSubjectNeeded) {
      // for single select
      this.clientSubjects = []

      if (this.config.isSubjectVisible)
        this.controlForm.controls.subject.reset();

      if (!Array.isArray(selectedDivisions)) {
        if (selectedDivisions) {
          let divisions: any[] = this.cachedData.filter(e => e.clientYrId == selectedYears && e.grade.id == selectedGrades)[0].divisions;
          let index = divisions.findIndex(function (item, i) { return item.division.id == selectedDivisions });
          this.clientSubjects = divisions[index].subjects;
        }
      }
      else {
        // for multiselect
        // step 1: - extract subjects for selected divisions
        let exSubjects: any[] = [];
        this.clientDivisions.forEach((cd) => {
          if (selectedDivisions.includes(cd.division.id)) {
            exSubjects.push(cd.subjects)
          }
        })
        if (exSubjects.length == 0)
          this.clientSubjects = [];
        else if (exSubjects.length == 1)
          this.clientSubjects = exSubjects[0]
        else
          this.clientSubjects = this.findCommonValues(exSubjects);
      }
    }

    //if students visible
    if (this.config.isStudentVisible) {
      this.clientStudents = [];
      this.controlForm.controls.student.reset();

      let selectedDivisions = this.controlForm.controls.division.value;
      let selectedYears = this.controlForm.controls.year.value;

      if (selectedDivisions) {
        this.backendService.getStudentDetailsByGradeOrDivision(this.userIdentity.clientId, selectedYears, "grade-division", selectedDivisions)
          .toPromise()
          .then((result: any) => {
            this.clientStudents = result;
          }).catch( (error: any) => {
            this.showErrorMsg("Something went wrong while loading students");
            console.log(error);
          })
      }
    }
    this.divisionSelectionChanged.emit(this.controlForm.value);
  }

  onSubjectSelected(event) {
    this.subjectSelectionChanged.emit(this.controlForm.value);
  }

  get Subjects()
  {
    return this.clientSubjects;
  }

  toggleAllSelection(event, selectControl) {
    if (event.checked)
      selectControl.options.forEach((item: MatOption) => item.select());
    else
      selectControl.options.forEach((item: MatOption) => item.deselect());

    this.onChange(this.controlForm.value);
    this.onTouched();
  }

  optionClick(event, selectControl: MatSelect, ckSelectAllId) {
    // if selectAll - Grade selected
    if (ckSelectAllId == "#ckallSelectGrade") {
      if (this.config.isMultiGrade) {
        if (this.controlForm.controls.grade.value != null) {
          this.allGrade.checked = (selectControl.options.length == this.controlForm.controls.grade.value.length)
        }
      }
    } // if selectAll - Division selected
    else if (ckSelectAllId == "#ckallSelectDivision") {
      if (this.config.isMultiDivision) {
        if (this.controlForm.controls.division.value != null) {
          this.allDivision.checked = (selectControl.options.length == this.controlForm.controls.division.value.length)
        }
      }

    }
    else if (ckSelectAllId == "#ckallSelectStudent") {
      if (this.config.isMultiStudent) {
        if (this.controlForm.controls.student.value != null) {
          this.allStudent.checked = (selectControl.options.length == this.controlForm.controls.student.value.length)
        }
      }
    }
    this.onChange(this.controlForm.value);
    this.onTouched();
  }

  onStudentSelected(event) { }

  findCommonValues(arr: any[]) {
    // Return blank array if arr is null
    if (!arr) return [];
    //No algorithm to execute if arr has only one element. Return arr[0]
    if (arr.length == 1) return arr[0];

    let values = [];

    //Step 2: fill values array with all the elements
    arr.forEach(a => {
      for (let i = 0; i < a.length; i++) {
        values[a[i].id] = a[i].name;
      }
    });

    //Step 3: Create arrIds only with ids. (no names)
    let arrIds: any[] = arr.map((ele) => {
      return (ele as any[]).map((e) => e.id)
    })

    // Step 4: Sort array to get smallest array first
    arrIds.sort(function (a, b) {
      return a.length - b.length;
    });

    // Step 5: compare arrays with each other and reduce number of elements from the first array
    let result = arrIds.shift().reduce(function (res, v) {
      if (res.indexOf(v) === -1 && arrIds.every(function (a) {
        return a.indexOf(v) !== -1;
      })) res.push(v);
      return res;
    }, []);

    let resultObj: any[] = [];
    // Step 6: create resultObj from final result array which will have intersected ids.
    result.forEach(r => {
      resultObj.push({ id: r, name: values[r] })
    });
    return resultObj
  }
  extractValues() {
    let value: any = this.controlForm.value;

    let yearName;
    let gradeName;
    let divisionName;
    let subjectName;
    let studentName;
    if (value.year) {
      yearName = this.clientYears.filter((y) => y.id == value.year)[0].name;
      value['yearName'] = yearName;
    }
    if (this.config.isGradeVisible && value.grade) {
      if (this.config.isMultiGrade) {
        gradeName = [];
        for (let i = 0; i < this.cachedData.length; i++) {
          if (value.grade.indexOf(this.cachedData[i].grade.id) >= 0) {
            gradeName.push(this.cachedData[i].grade.name);
          }
        }
      }
      else {
        gradeName = this.cachedData.filter((cd: any) => { return cd.grade.id == value.grade })[0].grade.name;
      }

      value['gradeName'] = gradeName;
    }
    if (this.config.isDivisionVisible && value.division) {
      if (this.config.isMultiDivision) {
        divisionName = [];
        for (let i = 0; i < this.cachedData.length; i++) {
          for (let j = 0; j < this.cachedData[i].divisions.length; j++) {
            if (value.division.indexOf(this.cachedData[i].divisions[j].division.id) >= 0) {
              divisionName.push(this.cachedData[i].divisions[j].division.name)
            }
          }
        }
      }
      else {
        for (let i = 0; i < this.cachedData.length; i++) {
          if (divisionName) break;
          for (let j = 0; j < this.cachedData[i].divisions.length; j++) {
            if (this.cachedData[i].divisions[j].division.id == value.division) {
              divisionName = this.cachedData[i].divisions[j].division.name
              break;
            }
          }
        }
      }
      value['divisionName'] = divisionName;
    }
    if (this.config.isSubjectVisible && value.subject) {
      if (!this.config.isMultiSubject)
      {
        subjectName = this.clientSubjects.filter((cs) => { return value.subject == cs.id })[0].name;
        value['subjectName'] = subjectName;
      }
      else
      {
        let subjects = this.clientSubjects.filter((cs) => { return value.subject.includes(cs.id) });
        let subjectNames = [];
        for (let i=0; i< subjects.length; i++)
        {
          subjectNames.push(subjects[i]['name']);
        }
        value['subjectName'] = subjectNames;
      }

    }

    if (this.config.isStudentVisible && value.student) {
      if (this.config.isMultiStudent) {
        studentName = []
        studentName = this.clientStudents
          .filter((cs) => { return value.student.indexOf(cs.studentGradeId) >= 0 });
      }
      else {
        studentName = this.clientStudents.filter((cs) => { return value.student == cs.id })[0].name;
      }
      value['studentName'] = studentName;
    }

    return value;
  }

  validateForm(): boolean {
    Object.keys(this.controlForm.controls).forEach((key) => {
      this.controlForm.get(key).updateValueAndValidity();
      if (!this.controlForm.get(key).valid) {
        this.controlForm.get(key).markAllAsTouched();
      }
    });
    return this.controlForm.valid
  }

  reset() {
    this.controlForm.reset();
    this.resetVariables();
  }

  resetVariables(withYears: boolean = false, resetControls = true) {
    if (withYears)
      this.clientYears = []

    this.clientGrades = [];
    this.clientDivisions = [];
    this.clientStudents = [];
    this.clientSubjects = [];

    if (resetControls) {
      if (this.allDivision) this.allDivision.checked = false;
      if (this.allGrade) this.allDivision.checked = false;
      if (this.allStudent) this.allStudent.checked = false;
      if (this.allSubject) this.allSubject.checked = false;
    }

  }

  showErrorMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }
}
