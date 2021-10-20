import { BackendService } from 'src/app/backend';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, Inject, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { CommonService } from 'src/app/_helpers/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-test-chapter-topic-report',
  templateUrl: './test-chapter-topic-report.component.html',
  styleUrls: ['./test-chapter-topic-report.component.scss']
})

export class TestChapterTopicReportComponent implements OnInit {

  columns: string[] = [];
  columnsToDisplay: string[] = [];
  columnsType: string[] = [];
  data: any;
  resultData: any;
  dataSource = new MatTableDataSource < any > ();
  @Output() onDone = new EventEmitter()
  loaded: boolean = false;
  footer: Number[] = [];
  student: Array < string > = [];
  report: Array < any >= [];
  testDBDetails: any;

  constructor(private backendService: BackendService,
    private snackBar: CommonService,
    @Optional() @Inject(MAT_DIALOG_DATA) public testData: any
    
    ){
    this.testDBDetails = testData;
  }

  ngOnInit(): void {
    if (this.testDBDetails != null) {
      this.loadReport(this.testDBDetails);
    }
  }

  loadReport(testDetails) {
    this.backendService.TestChapterTopicReport(testDetails.exam_id)
      .toPromise()
      .then((result: string) => {
        if (result.indexOf("No records found") <= 0) {
          this.data = JSON.parse(result);
          this.columns = this.data["header_names"];
          this.columnsToDisplay = this.columns.map(function(el) { return el['hname']; });
          this.columnsType = this.columns.map(function(el) { return el['type']; });
          this.footer = this.data["footer"]
          this.resultData = JSON.parse(this.data["result"]);
          this.dataSource.data = this.resultData.data;
          this.loaded = true;
          this.prepareReport();
        }
      }).catch((error: any) => {
        console.log(error);
      })
      .catch((error: any) => {
        this.snackBar.showErrorMsg(error);
      });

  }

  onCancel() {
    this.columnsToDisplay = [];
    this.dataSource.data = [];
    this.report = [];
    this.loaded = false;
    this.onDone.emit(null);
  }

  exportAsExcel() {
    const workSheet = XLSX.utils.json_to_sheet(this.report);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Class Report');
    XLSX.writeFile(workBook, 'Test Report.csv');

  }
  prepareReport() {
    var i, j;
    this.dataSource.data.forEach(data => {
      this.student[this.columnsToDisplay[0]] = data[0];
      j = 1;
      for (i = 1; i < data.length - 2; i = i + 3) {
        var sample = data[i + 1] + '/' + data[i + 2] + ' (' + data[i] + '%)';
        this.student[this.columnsToDisplay[j]] = sample;
        j++;
      }
      this.student[this.columnsToDisplay[j]] = data[i + 1] + ' (' + data[i] + '%)';
      this.report.push(this.student);
      this.student = [];
    });
    this.student[this.columnsToDisplay[0]] = 'Average';
    j = 1;
    for (i = 0; i < this.footer.length - 2; i = i + 3) {
      var sample = this.footer[i + 1] + '/' + this.footer[i + 2] + ' (' + this.footer[i] + '%)';
      this.student[this.columnsToDisplay[j]] = sample;
      j++;
    }
    this.student[this.columnsToDisplay[j]] = this.footer[i + 1] + ' (' + this.footer[i] + '%)';
    this.report.push(this.student);
    this.student = [];
  }
}
