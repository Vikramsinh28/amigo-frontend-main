import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Lightbox } from 'ngx-lightbox';
import { BackendService } from 'src/app/backend';
import { Evaluation, TeacherEvaluation } from 'src/app/entities';
import { CommonService, getMIMEType } from 'src/app/_helpers/common';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-evaluation-paper',
  templateUrl: './evaluation-paper.component.html',
  styleUrls: ['./evaluation-paper.component.scss'],
})
export class EvaluationPaperComponent implements OnInit {
  @Input() testDetails: any = {};
  grade: string = '';

  examId: number = -1;
  answerPaper: any;
  testPaperForm: FormGroup;
  isLoaded: boolean = false;
  studentExamId: number;
  studentName: string;
  studentMark:number;
  totalMark:number;
  rollNo: string;
  examDuration: number;
  testPaperName : string;
  subject : string;
  evaluated: string;
  _albums = [];
  @Input() mode: string = 'Teacher';
  @Output() updateDone = new EventEmitter();

  constructor(
    private snackBar: CommonService,
    private backendService: BackendService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private _lightbox: Lightbox
    ) { }

  ngOnInit(): void {}

  loadTestPaper() {
    this.createForm();
  }

  createForm(): any {
    this.testPaperForm = this.fb.group(
      this.answerPaper.reduce(
        (
          group: any,
          question: {
            student_exam_answer_id: string;
            teacher_feedback: string;
            teacher_eval_marks: Number;
            teacher_eval_result: Number;
          }
        ) => {
          return Object.assign(group, {
            ['q_' + question.student_exam_answer_id]: this.buildSubGroup(
              question.teacher_eval_marks,
              question.teacher_feedback,
              question.teacher_eval_result
            ),
          });
        },
        {}
      )
    );
    this.refreshMark();
  }

  private buildSubGroup(marks, feedback, result) {
    return this.fb.group({
      teacher_marks: [marks],
      feedback: [feedback],
      teacher_eval_result: [result == 1 ? true : false],
    });
  }

  prepareQuestionImages() {
    this.answerPaper.forEach((question) => {
      if (question.question_attachment !== null) {
        let fExt = question.question_attachment[0].fileName.split('.').pop();
        const index = environment.allowedImageUploadExtentions
          .toLowerCase()
          .indexOf(fExt.toLowerCase());

        if (index >= 0) question.question_attachment[0].type = 'image';
        else question.question_attachment[0].type = 'doc';

        let strMIME = getMIMEType(fExt);
        let objectURL =
          'data:' + strMIME + ';base64,' + question.question_attachment[0].data;
        question.question_attachment[0].data = this.sanitizer.bypassSecurityTrustUrl(
          objectURL
        );
      }

      if (
        question.answer_attachment != null &&
        question.answer_attachment.length > 0
      ) {
        question.answer_attachment.forEach((atch) => {
          let fExt = atch.fileName.split('.').pop();
          const index = environment.allowedImageUploadExtentions
            .toLowerCase()
            .indexOf(fExt.toLowerCase());

          if (index >= 0) atch.type = 'image';
          else atch.type = 'doc';

          let strMIME = getMIMEType(fExt);
          let objectURL = 'data:' + strMIME + ';base64,' + atch.data;
          atch.data = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        });
      }
    });
  }

  onShowPaperRequest(data, examId, mode) {
    this.studentExamId = data.studentExamId;
    this.studentName = data.name;
    this.rollNo = data.rollNo;
    this.examId = examId;
    this.mode = mode;
    this.totalMark = data.totalMarks;
    this.examDuration = data.examDuration;
    this.testPaperName = data.testPaperName;
    this.subject = data.subject;
    this.evaluated = data.cssClass;

    this.backendService
      .getStudentAnswerPaper(this.studentExamId)
      .toPromise()
      .then((result: string) => {
        this.answerPaper = JSON.parse(result);
        this.prepareQuestionImages();
        this.createForm();
        this.isLoaded = true;
      }).catch((error:any) => {
                    console.log(error);
                });
  }
  onSubmit() {
    let pending_eval = this.validateForm();
    this.UpdateTreeView();
    if (pending_eval && pending_eval.length > 0) {
      this.snackBar.showErrorMsg('Some questions are pending for evaluations\nPending evaluation for question(s) no : ' +pending_eval.join(','));
      return;
    } else {
      this.onSaveDraft(true);
    }
  }

  onSaveDraft(isSubmit = false) {
    let data = this.readEvaluation();
    if (isSubmit) {
      data.isSubmit = isSubmit;
    }
    if (data.evaluations.length > 0 || isSubmit) {
      this.backendService
        .SaveTeacherEvaluation(JSON.stringify(data))
        .toPromise()
        .then((result: string) => {
          this.testPaperForm.markAsPristine();
          this.snackBar.showSuccessMsg('Evaluation saved!');
          this.UpdateTreeView();
          this.refreshMark();
        }).catch((error:any) => {
                    console.log(error);
                });

    }
    else {
      this.snackBar.showSuccessMsg('No new evaluation to be saved!');
    }
  }

  readEvaluation(checkforDirty = true) {
    let teacherEvaluation: TeacherEvaluation = {};
    let evaluations: Evaluation[] = [];

    Object.keys(this.testPaperForm.controls).forEach((key) => {
      if (checkforDirty == false) {
        checkforDirty = this.testPaperForm.get(key).dirty;
      }

      if (this.testPaperForm.get(key).dirty == checkforDirty) {
        let e: Evaluation = {};
        e.studentAnswerId = Number(key.split('_').pop());
        e.marks = this.testPaperForm.get(key).value.teacher_marks;
        e.feedback = this.testPaperForm.get(key).value.feedback;
        e.result = this.testPaperForm.get(key).value.teacher_eval_result;
        evaluations.push(e);
      }
    });

    teacherEvaluation.evaluations = evaluations;
    teacherEvaluation.examId = this.examId;
    teacherEvaluation.studentExamId = this.studentExamId;

    return teacherEvaluation;
  }

  validateForm() {
    let eval_for_teacher = this.answerPaper.filter(
      (q) => q.sys_eval_done != true
    );

    let blank_eval = [];
    eval_for_teacher.forEach((question) => {
      let cntr = this.testPaperForm.get('q_' + question.student_exam_answer_id);
      if (cntr.value.teacher_marks == '') {
        blank_eval.push(question.position);
      }
    });

    return blank_eval;
  }

  updateResult(student_exam_answer_id, event) {

    setTimeout(() => {
      if (Number(event.target.value) > 0) {
        this.testPaperForm.controls['q_' + student_exam_answer_id].patchValue({
          teacher_eval_result: true,
          teacher_marks: event.target.value
        });
      } else {
        this.testPaperForm.controls['q_' + student_exam_answer_id].patchValue({
          teacher_eval_result: false,
          teacher_marks: event.target.value
        });
      }

      this.testPaperForm.controls['q_' + student_exam_answer_id].markAsDirty();
    }, 10);
  }

  clearVariables() {
    //this.gradeDivision = [];
    this.grade = '';
    this.examId = -1;
    //this.students = [];
  }

  clearData(){
    this.answerPaper=[];
    this.studentName=null;
    this.rollNo=null;
    this.isLoaded=false;
  }

  open(src): void {
    this._albums=[];
    const album = {
      src: src,
   };
   this._albums.push(album);
    this._lightbox.open(this._albums, 0,{fitImageInViewPort:true,centerVertically:true,disableScrolling:true,showZoom:true});
  }

  UpdateTreeView(){
    let pendingEval=this.validateForm();
    let colorCheck={
      pending:pendingEval.length,
      studentExamId:this.studentExamId,
      totalQuestion:this.answerPaper.length
    }
    this.updateDone.emit(colorCheck);
  }

  refreshMark(){
    this.studentMark=0;

    Object.keys(this.testPaperForm.controls).forEach((key) => {
        this.studentMark  += Number(this.testPaperForm.get(key).value.teacher_marks);
    });


  }
}
