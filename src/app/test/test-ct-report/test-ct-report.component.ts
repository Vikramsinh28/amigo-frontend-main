import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-test-ct-report',
  templateUrl: './test-ct-report.component.html',
  styleUrls: ['./test-ct-report.component.scss']
})
export class TestCtReportComponent implements OnInit {

  examId : number;
  studentExamId: number;
  loaded: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data : any)
  {
      this.examId = this.data.examId;
      this.studentExamId = this.data.studentExamId;
  }

  ngOnInit(): void {
    this.loaded = true;
  }

}
