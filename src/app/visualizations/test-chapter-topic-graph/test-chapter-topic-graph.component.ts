import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, Inject, Optional } from '@angular/core';
import { BackendService } from 'src/app/backend';
import { CommonService } from 'src/app/_helpers/common';
import { PdfgenerationService } from 'src/app/_services/pdf-generation.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


declare var Bokeh: any;

@Component({
  selector: 'app-test-chapter-topic-graph',
  templateUrl: './test-chapter-topic-graph.component.html',
  styleUrls: ['./test-chapter-topic-graph.component.scss']
})
export class TestChapterTopicGraphComponent implements OnInit {

  @Input() testDetails : any;
  @Output() onDone = new EventEmitter()
  @ViewChild('target') target: ElementRef;
  @Input() show: boolean = true;
  loaded: boolean = true;
  testDBDetails: any;

  data: any;
  constructor(private backendService: BackendService,
    private snackBar: CommonService,
    public pdfservice: PdfgenerationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public testData: any) {
    this.testDBDetails = testData;
    this.loaded = true;
  }

  ngOnInit(): void {
    if (this.testDBDetails != null) {
      this.loadGraph(this.testDBDetails);
    }
  }

  loadGraph(testDetails) {
    //Clear up target element
    if (this.target)
      this.target.nativeElement.innerHTML = '';

    let studentExamId = testDetails['student_exam_id'] ? testDetails['student_exam_id'] : ''
    this.backendService.TestChapterTopicGraph(testDetails['exam_id'], studentExamId)
      .toPromise()
      .then((result: string) => {
        try {
          if (result != "No data found" || result.length <= 3)
            this.data = JSON.parse(result);
          else {
            if (this.target) {
              this.target.nativeElement.innerHTML = 'Sorry, no records are available.';
              this.loaded = false;
              return;
            }
          }
        } catch (error) { console.log(error) }

        if (result.length > 3) {
          Bokeh.embed.embed_item(this.data, 'target');
          this.loaded = true;
        }
      }).catch((error: any) => {
        console.log(error);
      })
      .catch((error: any) => {
        this.snackBar.showErrorMsg(error);
      });

  }

  onCancel() {
    this.onDone.emit(null);
  }

  onDownload() {
    var canvas = document.getElementsByClassName("bk-canvas");
    this.pdfservice.downloadGraph(canvas, 2);
  }

}
