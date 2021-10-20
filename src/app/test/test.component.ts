import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { TestChapterTopicGraphComponent } from '../visualizations/test-chapter-topic-graph/test-chapter-topic-graph.component';
import { TestChapterTopicReportComponent } from '../visualizations/test-chapter-topic-report/test-chapter-topic-report.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { TestListActiveComponent } from './test-list-active/test-list-active.component';
import { TestListCompletedComponent } from './test-list-completed/test-list-completed.component';
import { TestListComponent } from './test-list/test-list.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit, AfterViewInit {
  testEvalData: any = {};
  @ViewChild (TestListComponent) testGrid : TestListComponent;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;

  @ViewChild(TestChapterTopicReportComponent) report: TestChapterTopicReportComponent;
  @ViewChild(TestChapterTopicGraphComponent) graph: TestChapterTopicGraphComponent;
  @ViewChild(EvaluationComponent) evaluation: EvaluationComponent;
  @ViewChild(TestListActiveComponent) active: TestListActiveComponent;
  @ViewChild(TestListCompletedComponent) completed: TestListCompletedComponent;

    
  constructor(
    public dialog: MatDialog
    ){}
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.enableTestTabs(2);
    }, 200);
  }

  ngOnInit(): void {
  }

  onSelectedForEvaluate(test: any) {
    this.tabGroup.selectedIndex = 3;
    this.evaluation.loadStudentTree(test);
    this.enabletabs(3);
  }
  onSelectedForReport(test: any) {
    this.tabGroup.selectedIndex = 4
    this.report.loadReport(test);
    this.enabletabs(4);
  }

  onSelectedForGraph(test: any) {
    this.tabGroup.selectedIndex = 5
    this.graph.loadGraph(test);
    this.enabletabs(5);
  }

  onDone(test: any)
  {
    this.tabGroup.selectedIndex = 2;
    this.enableTestTabs(2);
    this.completed.ngOnInit();
  }

  gotoActive(test:any){
    this.tabGroup.selectedIndex = 1;
    this.active.ngOnInit();
  }

  enabletabs(a){
    try {
      this.tabGroup._tabs.forEach((tab, i) =>
      {
          if (i == a)
            tab.disabled = false;
          else
            tab.disabled = true;
      });
    } catch (error) {
      console.log('error -->', error)
    }
  }

  enableTestTabs(a){
    try {
      this.tabGroup._tabs.forEach((tab, i) =>
      {
          if (i <= a)
            tab.disabled = false;
          else
            tab.disabled = true;
      });
    } catch (error) {
      console.log('error -->', error)
    }
  }
  displayTestPreview(data)
  {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.data = {
      testPaperId: data.test_paper_id,
      attachmentFileName: data.test_paper_name,
      withAnswerKey: true,
      isFrozen: true,
      withMarks: true,
      grade: data.grade,
      subject: data.subject_name,
      totalmarks: data.total_marks
      };
      const dialogRef = this.dialog.open(
        PaperPreviewDialogBoxComponent,
        dialogConfig
      );

      dialogRef.afterClosed().subscribe((result) => { });
  }

}
