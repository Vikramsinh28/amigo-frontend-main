import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  Test,
  Term,
  Grade,
  GradeDivision,
  Subject,
  Paper,
} from '../../entities';
import { BackendService } from '../../backend';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FrontendService } from 'src/app/_services/frontend.service';
import { CommonGradeDivisionComponent, CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { CommonService } from 'src/app/_helpers/common';

@Component({
  selector: 'app-test-setup',
  templateUrl: './test-setup.component.html',
  styleUrls: ['./test-setup.component.scss'],
})
export class TestUpdateComponent implements OnInit, AfterViewInit {
  userIdentity: any;
  currentYear: any;
  loaded: boolean = false;

  form: FormGroup;

  terms: Term[];
  grades: Grade[] = [];
  gradeDivisions: GradeDivision[];
  divisions: GradeDivision[];
  subjects: Subject[];
  papers: Paper[];
  test4Edit: Test;
  minStartDate: Date;
  maxStartDate: Date;
  minEndDate: Date;
  maxEndDate: Date;

  public cachedGradeDivisionData: GradeDivision[];
  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  @ViewChild(CommonGradeDivisionComponent) commonGradeDivision: CommonGradeDivisionComponent;

  constructor(
    private backendService: BackendService,
    private snackBar: CommonService,
    public dialogRef: MatDialogRef<TestUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private frontendService: FrontendService
  ) {
    // this.currentYear = data.currentYear;
    // this.terms = data.terms;
    // this.grades = data.grades;
    // this.gradeDivisions = data.divisions;
    this.test4Edit = data.test;
  }

  ngOnInit(): void {
    this.setupMinMaxDate(new Date());
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.form = new FormGroup({
      gradeDivisionSubject: new FormControl(null, Validators.required),
      totalMarks: new FormControl(null, Validators.required),
      examDuration: new FormControl(null, Validators.required),
      startDate: new FormControl(new Date(), Validators.required),
      endDate: new FormControl(new Date(), Validators.required),
      examName: new FormControl(null, Validators.required),
      paper: new FormControl(null, Validators.required),
      notes: new FormControl(null),
      testInstructions: new FormControl(null),
    });

    this.config.isYearRequired = true;
    this.config.isGradeVisible = true;
    this.config.isGradeRequired = true;
    this.config.isMultiGrade = false;
    this.config.isDivisionVisible = true;
    this.config.isDivisionRequired = true;
    this.config.isMultiDivision = true;
    this.config.isDivisionAutoSelect = false;
    this.config.isStudentVisible = false;
    this.config.isStudentRequired = false;
    this.config.isSubjectVisible = true;
    this.config.isSubjectRequired = true;
    //this.config.isMultiSubject = false;

    this.form.controls.totalMarks.disable();

    if (this.test4Edit) {
      this.setupMinMaxDate(new Date(this.test4Edit.start_date));

      let commonGradeDivisionValue =
      {
        year: this.test4Edit.client_year_id,
        grade: this.test4Edit.grade_id,
        division: this.test4Edit.division_ids,
        subject: this.test4Edit.subject_id
      }

      this.form.controls.gradeDivisionSubject.setValue(commonGradeDivisionValue);
      this.form.controls.paper.setValue(this.test4Edit.test_paper_id);
      this.form.controls.totalMarks.setValue(this.test4Edit.total_marks);
      this.form.controls.examDuration.setValue(this.test4Edit.exam_duration);
      this.form.controls.startDate.setValue(new Date(this.test4Edit.start_date));
      this.form.controls.endDate.setValue(new Date(this.test4Edit.end_date));
      this.form.controls.examName.setValue(this.test4Edit.exam_name);
      this.form.controls.notes.setValue(this.test4Edit.notes ? this.test4Edit.notes : '');
      this.form.controls.testInstructions.setValue(this.test4Edit.test_instructions ? this.test4Edit.test_instructions : '' );

    }
    this.loaded = true;
  }

  ngAfterViewInit(): void {
    if (this.test4Edit) {
      this.form.controls.paper.setValue(this.test4Edit.test_paper_id);
      this.form.controls.totalMarks.setValue(this.test4Edit.total_marks);
    }
  }

  onSubmit(form) {

    const fd: FormData = new FormData();
    if (!this.commonGradeDivision.validateForm())
    {
      return;
    }

    if (this.test4Edit) {
      fd.append('exam_id', this.test4Edit.exam_id + '');
      fd.append('term_exam_id', this.test4Edit.term_exam_id + '');
    }
    fd.append('grade_id', this.commonGradeDivision.value.grade);
    fd.append('divisions', this.commonGradeDivision.value.division);
    fd.append('exam_name', this.form.controls.examName.value);
    fd.append('exam_category', 'T');
    fd.append('start_date', formatDate(this.form.controls.startDate.value, 'yyyy-MM-dd', 'en-US'));
    fd.append('end_date', formatDate(this.form.controls.endDate.value, 'yyyy-MM-dd', 'en-US'));
    fd.append('user_id', this.userIdentity.userId);
    fd.append('client_id', this.userIdentity.clientId);
    fd.append('year', this.commonGradeDivision.value.year);
    fd.append('subject_id', this.commonGradeDivision.value.subject);
    fd.append('exam_type', 'Theory');
    fd.append('total_marks', this.form.controls.totalMarks.value);
    fd.append('exam_duration', this.form.controls.examDuration.value);
    fd.append('test_paper_id', this.form.controls.paper.value);
    fd.append('notes', this.form.controls.notes.value ? this.form.controls.notes.value : ' ');
    fd.append('test_instructions', this.form.controls.testInstructions.value ? this.form.controls.testInstructions.value : ' ');

    this.backendService.addOrUpdateTest(fd).toPromise().then((result: string) => {
      var test_id = JSON.parse(result);
      this.dialogRef.close(test_id);
      var mode = this.test4Edit ? 'updated' : 'created';
      this.snackBar.showSuccessMsg('Test \''+this.form.controls.examName.value+'\' '+mode+' successfully !');
    }),
      (err: string) => {
        console.log(err);
        this.snackBar.showErrorMsg('Some problem occured creating Question.');
      };
  }

  onSubjectSelection(event) {
    var grade = event.grade;
    var subject_id = event.subject;
    if (!this.test4Edit)
    {
      this.form.controls.totalMarks.setValue(null);
      this.form.controls.paper.setValue(null);
    }
    this.lookupSelectPaper(subject_id, grade).then((result: any) => {
      this.papers = result;
      this.loaded = true;
    });
  }

  onPaperSelection(){
    var paper_id=this.form.controls.paper.value;
    this.papers.forEach(paper=>{
      if(paper.testPaperId == paper_id)
      {
        this.form.controls.totalMarks.setValue(paper.totalMarks);
      }
    })
  }

  lookupSelectPaper(subject_id, grade) {

    return this.backendService
      .getClientTestPaper(
        this.userIdentity.clientId,
        grade,
        subject_id
      )
      .toPromise();
  }

  setupMinMaxDate(startDate) {
    this.minStartDate = new Date(startDate);
    this.maxStartDate = new Date(
      this.minStartDate.getFullYear() + 1,
      this.minStartDate.getMonth(),
      this.minStartDate.getDate()
    );
    this.minEndDate = this.minStartDate;
    this.maxEndDate = new Date(
      this.minStartDate.getFullYear() + 1,
      this.minStartDate.getMonth(),
      this.minStartDate.getDate()
    );
  }
  onStartDateChange(startDate) {
    this.form.controls.endDate.setValue(null);
    this.minEndDate = new Date(
      startDate.value._i.year,
      startDate.value._i.month,
      startDate.value._i.date
    );
    this.maxEndDate = new Date(
      startDate.value._i.year + 1,
      startDate.value._i.month,
      startDate.value._i.date
    );
  }

}
