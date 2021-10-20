import { AfterViewInit, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EvaluationPaperComponent } from '../evaluation-paper/evaluation-paper.component';

@Component({
  selector: 'app-student-paper-evaluated',
  templateUrl: './student-paper-evaluated.component.html',
  styleUrls: ['./student-paper-evaluated.component.scss']
})
export class StudentPaperEvaluatedComponent implements OnInit, AfterViewInit {

  @ViewChild (EvaluationPaperComponent) paper: EvaluationPaperComponent;

  constructor(public dialogRef: MatDialogRef<StudentPaperEvaluatedComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any)
   {
    dialogRef.disableClose = true;
   }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.paper.onShowPaperRequest(this.data, this.data.examId, 'Student');
  }


}
