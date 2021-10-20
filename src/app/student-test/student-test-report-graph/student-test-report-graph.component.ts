import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestChapterTopicGraphComponent } from 'src/app/visualizations/test-chapter-topic-graph/test-chapter-topic-graph.component';

@Component({
  selector: 'app-student-test-report-graph',
  templateUrl: './student-test-report-graph.component.html',
  styleUrls: ['./student-test-report-graph.component.scss']
})
export class StudentTestReportGraphComponent implements OnInit, AfterViewInit {
  testData: any = {};
  examId : number;
  studentExamId: number;
  loaded: boolean = false;
  shown:boolean=false;
  @ViewChild("graph") graph: TestChapterTopicGraphComponent

  constructor(@Inject(MAT_DIALOG_DATA) public data : any)
  {
      this.testData.exam_id = this.data.examId;
      this.testData.student_exam_id = this.data.studentExamId;
  }

  ngAfterViewInit(): void {
    this.graph.loadGraph(this.testData);
  }

  ngOnInit(): void {  }

}
