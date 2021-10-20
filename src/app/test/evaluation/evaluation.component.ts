import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BackendService } from 'src/app/backend';
import {  FormGroup } from '@angular/forms';
import { EvaluationPaperComponent } from './evaluation-paper/evaluation-paper.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonService } from 'src/app/_helpers/common';

interface Student
{
name: string;
studentGradeId: number;
studentExamId: number;
gradeDivisionId: number;
}

interface GradeDivision {
  id?: number;
  name?: string;
  studentGradeId?: number;
  studentExamId?: number;
  gradeDivisionId?: number;
  cssClass ?: string;
  rollNo ?: string;
  total_eval ?: number;
  totalMarks ?: number;
  children?: GradeDivision[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: number;
}


@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
})
export class EvaluationComponent implements OnInit {
  private _transformer = (node: GradeDivision, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      id: node.id,
      name: node.name,
      studentExamId: node.studentExamId,
      gradeDivisionId: node.gradeDivisionId,
      level: level,
      cssClass: node.cssClass,
      rollNo: node.rollNo,
      total_eval: node.total_eval,
      totalMarks: node.totalMarks,
    };
  };
  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  treedataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener
  );

  hasChild = (_: number, node: FlatNode) => node.expandable;
  expandedQuestion: null;
  expandedQuestion_2: null;
  activeNode = 0;
  students: GradeDivision[];
  @Input() testDetails: any = '';
  grade: string = '';
  divisions: string[] = [];
  division_ids: string[] = [];
  examId: number = -1;
  gradeDivision: GradeDivision[] = [];
  answerPaper: any;
  testPaperForm: FormGroup;
  isLoaded: boolean = false;
  studentExamId: number;
  studentName: string;
  rollNo: string;
  examStatus: number;
  @ViewChild(EvaluationPaperComponent) paper: EvaluationPaperComponent;
  @Output() onDone =new EventEmitter()

  constructor(
    private snackBar: CommonService,
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  loadStudentTree(testData) {

    this.clearVariables();

    if (testData.term_exam_id) {
      this.grade = testData.grade;
      this.examId = testData.exam_id;
      this.division_ids = testData.division_ids;
      this.divisions = testData.divisions;
      this.examStatus = testData.exam_status;

      this.division_ids.forEach((d, i) => {
        this.gradeDivision.push({
          id: Number(d),
          name: 'Class: ' + this.grade + ' - ' + this.divisions[i],
        });
      });
    }
    this.backendService
      .getExamStudents(this.examId, this.division_ids.join(','))
      .toPromise()
      .then((result: string) => {
        let studentsObjs: any[] = JSON.parse(result);

        const getCssClass = (total_eval, done_eval) => {
          if (total_eval == 0) return 'grey_bg';
          else if (done_eval == 0) return 'red_bg';
          else if (total_eval > done_eval) return 'orange_bg';
          else if (total_eval == done_eval) return 'green_bg';
        };

        this.students = studentsObjs.map(function (s) {
          return {
            name: s.name,
            studentGradeId: -1,
            studentExamId: s.student_exam_id,
            gradeDivisionId: s.grade_division_id,
            total_eval: Number(s.total_eval),
            count_eval_done: Number(s.count_eval_done),
            cssClass: getCssClass(
              Number(s.total_eval),
              Number(s.count_eval_done)
            ),
            rollNo: s.roll_no,
            totalMarks: s.total_marks,
          };
        });

        this.gradeDivision.forEach((d) => {
          d.children = this.students.filter((s) => s.gradeDivisionId == d.id);
        });

        this.treedataSource.data = this.gradeDivision;
      }).catch((error:any) => {
                    console.log(error);
                });
  }

  getCssClass(total_eval, done_eval): string {
    if (total_eval == 0) return 'grey_bg';
    else if (done_eval == 0) return 'red_bg';
    else if (total_eval > done_eval) return 'orange_bg';
    else if (total_eval == done_eval) return 'green_bg';
  }

  onTreeNodeClick(node:GradeDivision, event) {
    if (node.total_eval == 0)
    {
      this.snackBar.showErrorMsg('Student has not submitted the paper.');
      return;
    }
    this.paper.onShowPaperRequest(node, this.examId, 'Teacher');
  }

  async onReleaseScore() {
    if (this.examStatus == 5)
    {
      this.snackBar.showErrorMsg('Scores are already released for this test');
      return;
    }

    var cnfrm = false;

    let pev = await this.backendService.getPendingEvaluation(this.examId).toPromise();

    let pendingList = JSON.parse(String(pev));
    let dialogRef: any;
    if (pendingList.length > 0)
    {
       dialogRef = await this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {title:'Confirm',message:'You have ' +
        pendingList.length +
        ' paper(s) pending to evaluate.\n' +
        this.formatPendingList(pendingList) +
        '\n' +
        'Do you still want to release scores for this exam?',yes:'Yes',no:'Cancel'}
      });
    }
    else
    {
       dialogRef = await this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {title:'Confirm',message:'Are you sure you want to release the exam score to students ?',yes:'Confirm',no:'Cancel'}
      });
    }
    cnfrm = await dialogRef.afterClosed().toPromise();

    if (!cnfrm) return;

    if (cnfrm) {
      var userIdentity = this.frontendService.getJWTUserIdentity();
      let data: any = {};
      data['examId'] = this.examId;
      data['examStatus'] = 5; // exam.exam_status = 5 = Released score
      data['userId'] = userIdentity.userId;

      this.backendService
        .updateExamStatus(JSON.stringify(data))
        .toPromise()
        .then((result: string) => {
          this.snackBar.showSuccessMsg('Scores have been released for evaluated papers.');
        }).catch((error:any) => {
                    console.log(error);
                });
    }
  }


  formatPendingList(pendingList) {
    let pendinglistString = '';
    if (pendingList.length > 0) {
      pendingList.forEach((pele) => {
        pendinglistString =
          pendinglistString + pele.roll_no + '. ' + pele.name + '\n';
      });
    }
    return pendinglistString;
  }

  updateResult(questionPosition)
  {

  }

  clearVariables() {
    this.gradeDivision = [];
    this.grade = '';
    this.examId = -1;
    this.division_ids = [];
    this.divisions = [];
    this.students = [];
  }

  onCancel(){
    this.paper.clearData();
    this.onDone.emit(null);
  }

  refreshTree(data){
    this.gradeDivision.forEach(result=>{
      for(let i=0;i<result.children.length;i++)
      {
        if(result.children[i].studentExamId==data.studentExamId)
        {
          if(data.pending==data.totalQuestion)
          {
            result.children[i].cssClass='red_bg';
          }
          else if(data.pending>0){
            result.children[i].cssClass='orange_bg';
          }
          else{
            result.children[i].cssClass='green_bg';
          }
          break;
        }
      }
    })
    this.treedataSource.data=this.gradeDivision;
    this.treeControl.expandAll();
  }
}
