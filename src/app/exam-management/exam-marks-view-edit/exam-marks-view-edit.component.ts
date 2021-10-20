import { BackendService } from 'src/app/backend';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  CommonGradeDivisionComponent,
  CommonGradeDivisionConfiguration,
} from 'src/app/_components/common-grade-division/common-grade-division.component';
import { MatSort } from '@angular/material/sort';
import { FrontendService } from 'src/app/_services/frontend.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService, validateForm } from 'src/app/_helpers/common';
@Component({
  selector: 'app-exam-marks-view-edit',
  templateUrl: './exam-marks-view-edit.component.html',
  styleUrls: ['./exam-marks-view-edit.component.scss'],
})
export class ExamMarksViewEditComponent implements OnInit {
  config: CommonGradeDivisionConfiguration =
    new CommonGradeDivisionConfiguration();
  columnsToDisplay: string[] = [];
  columnsToDisplayRow: string[] = [];
  positionalAverageFooter: string[] = [];
  averageFooter: string[] = [];
  minMaxFooter: string[] = [];
  subMin: any[] = [];
  subMax: any[] = [];
  subTotal: any[] = [];
  subMedian: any[] = [];
  hideColumns: string[] = [
    'Division',
    'grade_division_id',
    'term_exam_id',
    'student_grade_id',
    'Last Name',
  ];
  dataSource = new MatTableDataSource();
  userIdentity: any;
  userRole: any;

  clientTerms: any[] = [];
  clientExams: any[] = [];
  selectedTerms: any;
  selectedExams: any;
  @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;
  @ViewChild('examViewSort', { static: true }) sortExam: MatSort;
  searchForm: FormGroup;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackbar: CommonService
  ) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
  }

  ngOnInit(): void {
    this.config.isMultiGrade = false;
    this.config.isGradeRequired = true;
    this.config.isDivisionRequired = false;
    this.config.isMultiDivision = false;
    this.config.isSubjectRequired = false;
    this.config.isMultiSubject = false;

    if (this.userRole == 'Management' || this.userRole == 'Admin') {
      this.config.isBypassAcl = true;
      this.config.isBypassAclShowAllYears = true;
    }

    this.searchForm = new FormGroup({
      term: new FormControl('', Validators.required),
      exam: new FormControl('', Validators.required),
      filter: new FormControl(''),
    });
  }

  clearFilter() {
    this.filter.reset();
    this.searchForm.reset();
    this.selectedTerms = '';
    this.selectedExams = '';
    this.resetDataSet();
  }

  resetDataSet() {
    this.dataSource.data = [];
    this.columnsToDisplay = [];
    this.columnsToDisplayRow = [];
    this.positionalAverageFooter = [];
    this.averageFooter = [];
    this.minMaxFooter = [];
    this.subMedian = [];
    this.subMax = [];
    this.subMin = [];
    this.subTotal = [];
  }

  search() {
    this.resetDataSet();

    let filterValidity = this.filter.validateForm();
    let searchValidity = validateForm(this.searchForm);
    if (!filterValidity || !searchValidity) {
      return;
    }

    let self = this;
    let filterValues = this.filter.value;
    let searchValues = this.searchForm.value;

    this.backendService
      .getExamResultView(
        filterValues.grade,
        filterValues.division == null ? '' : filterValues.division,
        searchValues.exam,
        filterValues.subject == null ? '' : filterValues.subject
      )
      .toPromise()
      .then((result: any) => {
        result = JSON.parse(result);
        this.columnsToDisplay = result.header_names;
        this.columnsToDisplayRow = this.columnsToDisplay.filter(function (c) {
          return !self.hideColumns.includes(c);
        });
        this.positionalAverageFooter =
          this.averageFooter =
          this.minMaxFooter =
            this.columnsToDisplayRow;
        this.averageFooter = this.averageFooter.map((e) => e + '_2');
        this.minMaxFooter = this.minMaxFooter.map((e) => e + '_3');

        let result_json = JSON.parse(result.result);
        this.dataSource.data = result_json.data;

        this.subMedian = result_json.data.pop();
        this.subMin = result_json.data.pop();
        this.subMax = result_json.data.pop();
        this.subTotal = result_json.data.pop();
      })
      .catch((e: any) => {
        this.snackbar.showErrorMsg(e.error.message);
      });
  }

  getTerms(data) {
    this.searchForm.reset();
    this.clientTerms = [];
    let clientYear = data.year;

    this.backendService
      .getClientTerm(this.userIdentity.clientId, clientYear)
      .toPromise()
      .then((result: any) => {
        this.clientTerms = result;
      })
      .catch((error: any) => {
        console.log(error);
      }),
      () => {};
  }

  getExams(data) {
    let termId = this.selectedTerms;
    let gradeId = this.filter.value.grade;
    this.clientExams = [];

    if (termId && gradeId) {
      this.backendService
        .getTermExams(gradeId, termId)
        .toPromise()
        .then((result: any) => {
          this.clientExams = result;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
}
