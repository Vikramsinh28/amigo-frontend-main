import { Attachment } from './../../entities/attachment';
import { StudentTestPaperResponse } from './../../entities/studentTestPaperResponse';
import { StudentTestPaperAnswer } from './../../entities/studentTestPaperAnswers';
import { environment } from './../../../environments/environment';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { StudentTestPaper } from 'src/app/entities';
import { BackendService } from 'src/app/backend';
import { Router } from '@angular/router';
import { QUESTION_TYPE } from '../../entities';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService, getMIMEType } from 'src/app/_helpers/common';
import { TestPaperEventsService } from 'src/app/_services';
import { CountdownComponent } from 'ngx-countdown';
import { Output } from '@angular/core';
import {
  AppEvent,
  AppEventType,
  EventQueueService,
} from 'src/app/_services/broadcast-events/event.queue.service';
import { FrontendService } from 'src/app/_services/frontend.service';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-student-test-paper',
  templateUrl: './student-test-paper.component.html',
  styleUrls: ['./student-test-paper.component.scss'],
})
export class StudentTestPaperComponent
  implements OnInit, OnDestroy, AfterViewInit {
  testPaperForm: FormGroup;
  studentTestPaper: StudentTestPaper;
  userIdentity: any;
  questions: any;
  surveyQuestionForm: FormGroup;
  formSubmitted = false;
  MAX_UPLOAD_FILES = 2;
  sfiles: any;
  user_id: number;
  testDetails: any;
  currentDate = new Date();
  isLoaded: boolean = false;
  autoSaveMode: boolean = false;
  fireAutoSave: any;
  firstTimeSave: boolean = true;
  @ViewChildren(CountdownComponent) testCountdown = new QueryList<
    CountdownComponent
  >();
  @ViewChild('form') form: NgForm;
  countDown: CountdownComponent;
  @Output() disableControls = new EventEmitter();
  dateFormat: string;
  _albums = [];
  clientLogo:any;

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private snackBar: CommonService,
    private testService: TestPaperEventsService,
    private eventQueue: EventQueueService,
    public dialog: MatDialog,
    private frontendService: FrontendService,
    private _lightbox: Lightbox
  ) {}

  ngAfterViewInit(): void {
    this.testCountdown.changes.subscribe(
      (comps: QueryList<CountdownComponent>) => {
        if (comps) {
          this.countDown = comps.first;
          comps.first.config.demand = true;
          comps.first.begin();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.stopAutoSave();
    this.eventQueue.dispatch(
      new AppEvent(AppEventType.StudentPaperUnloaded, 'unload')
    );
    window.removeEventListener('beforeunload', this.beforeUnload);
    window.removeEventListener('blur', this.windowBlur);
  }

  public stopAutoSave() {
    clearTimeout(this.fireAutoSave);
  }
  ngOnInit() {
    this.testService.sharedTestDetails.subscribe(
      (tDetails) => (this.testDetails = tDetails)
    );
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.user_id = this.userIdentity.userId;
    this.dateFormat = this.userIdentity.dateFormat;
    this.loadTestPaper();
    window.addEventListener('keyup', this.disableF5);
    window.addEventListener('keydown', this.disableF5);
    window.addEventListener('beforeunload', this.beforeUnload);
    //window.addEventListener("blur", this.windowBlur)
  }

  windowBlur(e) {
    alert('Are you sure you want to move to another window?');
  }
  disableF5(e) {
    if ((e.which || e.keyCode) == 116) e.preventDefault();
  }

  beforeUnload(event) {
    event.returnValue = 'Closing this tab will make you lose this data.';
    event.preventDefault();
  }

  loadTestPaper() {
    this.clientLogo = this.sanitizer.bypassSecurityTrustResourceUrl(this.frontendService.getClientLogo());
    this.backendService
      .getStudentExamStatus(this.testDetails.studentExamId)
      .toPromise()
      .then((result: string) => {
        let examStatusResult = JSON.parse(result);

        if (
          examStatusResult &&
          examStatusResult.length > 0 &&
          Number(JSON.parse(result)[0]['exam_status']) == 2
        ) {
          this.backendService
            .getStudentTestPaper(
              this.testDetails.testPaperId,
              this.userIdentity.userId,
              true,
              this.testDetails.studentExamId
            )
            .toPromise()
            .then((result: string) => {
              this.studentTestPaper = JSON.parse(result);
              this.questions = [];
              this.questions = this.studentTestPaper.questions;
              if (this.questions.length > 0) {
                this.isLoaded = true;

                let logoURL =
                  'data:' +
                  '"image/jpeg"' +
                  ';base64,' +
                  this.studentTestPaper.client_info.client_logo;
                this.studentTestPaper.client_info.client_logo = this.sanitizer.bypassSecurityTrustUrl(
                  logoURL
                );
                this.eventQueue.dispatch(
                  new AppEvent(AppEventType.StudentPaperLoaded, 'load')
                );
                this.startAutoSaveTimer();
                this.prepareQuestionImages();
                this.createForm();
                this.disableControls.emit();
                // Save blank paper as soon as the paper is loaded
                this.onSaveDraft(true);
              }
            }).catch((error:any) => {
                    console.log(error);
                })
            .catch((e: any) => {});
        } else {
          this.snackBar.showErrorMsg('Exam is not available!');
          this.router.navigate(['/student-test-list']);
        }
      }).catch((error:any) => {
                    console.log(error);
                });
  }

  prepareQuestionImages() {
    this.questions.forEach((question) => {
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
    });
  }

  createForm(): any {
    this.testPaperForm = this.fb.group(
      this.questions.reduce(
        (
          group: any,
          question: {
            test_paper_question_id: string;
            position: string;
          }
        ) => {
          return Object.assign(group, {
            ['q_' + question.test_paper_question_id]: this.buildSubGroup(
              question,
              question.position
            ),
          });
        },
        {}
      )
    );
  }

  private buildSubGroup(question, position) {
    switch (question.qb_question_type_id) {
      case 3:
        return this.fb.group(
          question.objective_answers.reduce((subGroup, answer) => {
            return Object.assign(subGroup, {
              [answer]: [false],
            });
          }, {})
        );
      case 7:
        let index = 0;
        return this.fb.group(
          question.objective_answers.reduce((subGroup, answer) => {
            return Object.assign(subGroup, {
              ['f' + String(index++)]: [''],
            });
          }, {})
        );
      case 2:
        return this.fb.group(
          question.objective_answers.reduce((subGroup, answer) => {
            return Object.assign(subGroup, {
              ['o' + question.position]: [''],
            });
          }, {})
        );
      case 4:
        return this.fb.group({
          answer: [''],
          image: [''],
        });
      case 5:
        return this.fb.group({
          answer: [''],
          image: [''],
        });
      case 6:
        return this.fb.group({
          answer: [''],
          image: [''],
        });
      default:
        throw new Error('unhandled question type');
    }
  }

  attachDocument(event, question) {}

  countDownEvent(event) {
    if (event.action == 'done') {
      this.onSubmit(true);
    }
    if (event.action == 'notify' && this.countDown) {
      this.snackBar.showErrorMsg('Time is about to get over.. Only ' +
            Math.round(Math.ceil(this.countDown.left / 60000)).toString() +
            ' minutes left!!');
    }
  }

  onSubmit(automode: boolean = false) {

    if (!automode){
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {title:'Submit',message:'Are you sure you want to submit your paper ? Once Submitted, you will not able to modify any answers',yes:'Submit',no:'Cancel'}
      });
      dialogRef.afterClosed().subscribe(studentConfirm=>{
        if (studentConfirm) {
          this.formSubmitted = true;
          let data = this.readTestPaperAnswers(false);
          this.SavePaper(data, automode);
        }
      })
    } else {
      this.formSubmitted = true;
      let data = this.readTestPaperAnswers(false);
      this.SavePaper(data, automode);
    }
  }

  onSaveDraft(automode = false) {
    let checkforDirty: boolean = !this.firstTimeSave;

    let data = this.readTestPaperAnswers(checkforDirty);

    this.SavePaper(data, automode);
    this.firstTimeSave = false;
    if (automode) {
      this.stopAutoSave()
      this.startAutoSaveTimer();
    }
  }

  SavePaper(data: StudentTestPaperResponse, automode: boolean) {
    if (
      data.studentAnswers.length > 0 ||
      data.studentAttachments.length > 0 ||
      this.formSubmitted
    ) {
      let fd = new FormData();
      fd.append('data', JSON.stringify(data.studentAnswers));
      fd.append('studentExamId', JSON.stringify(data.studentExamId));
      fd.append('testPaperId', JSON.stringify(data.testPaperId));
      fd.append('userId', JSON.stringify(this.user_id));
      fd.append('finalSubmit', String(data.finalSubmit));

      var addAnswerAttachments = [];
      data.studentAttachments.forEach((file) => {
        var id = file.id + '_answer_doc';
        if (!file.delete) {
          fd.append(id, file.data);
        }
        addAnswerAttachments.push({
          id: id,
          fileName: file.fileName,
          delete: file.delete,
          uid: file.uid,
        });
      });
      fd.append('answer_add_docs', JSON.stringify(addAnswerAttachments));
      this.backendService
        .saveStudentTestPaper(fd)
        .toPromise()
        .then((result: string) => {
          if (!automode)
            this.snackBar.showSuccessMsg('Paper saved successfully!');
          else console.log('Paper saved successfully! --' + Date().toLocaleLowerCase());

          this.markFormAsPrisitne();
          if (this.formSubmitted) {
            //Navigate the page to the list
            this.router.navigate(['/student-test-list']);
          }
        }).catch((error:any) => {
                    console.log(error);
                });
    } else {
      if (!automode)
        this.snackBar.showSuccessMsg('No modifications to be saved!');
      else
        console.log(
          'No modifications to be saved! -- ' + Date().toLocaleLowerCase()
        );
    }
  }

  markFormAsPrisitne() {
    this.testPaperForm.markAsPristine();
    // Object.keys(this.testPaperForm.controls).forEach((key) => {
    //   let question = this.questions.filter((q) => q.test_paper_question_id == key.split('_').pop())[0];
    //   if (question.qb_question_type_id == QUESTION_TYPE.LONG_QUESTION ||
    //     question.qb_question_type_id == QUESTION_TYPE.SHORT_QUESTION ||
    //     question.qb_question_type_id == QUESTION_TYPE.VERY_SHORT_QUESTION
    //   )
    //   {
    //     if (this.testPaperForm.get(key).value.image)
    //     {
    //       let img = [];
    //       this.testPaperForm.get(key).value.image.forEach((image) => {
    //           image.saved = true;
    //           img.push(image);
    //       });
    //       this.testPaperForm.get(key).setValue(img);
    //     }
    //   }
    // });
  }

  readTestPaperAnswers(checkforDirty = false) {
    let studentAnswersResp: StudentTestPaperResponse = {};
    let studentAnswers: StudentTestPaperAnswer[] = [];
    let attachments: Attachment[] = [];

    Object.keys(this.testPaperForm.controls).forEach((key) => {
      if (checkforDirty == false) {
        checkforDirty = this.testPaperForm.get(key).dirty;
      }

      if (this.testPaperForm.get(key).dirty == checkforDirty) {
        let answer: StudentTestPaperAnswer = {};
        answer.testPaperQuestionId = Number(key.split('_').pop());

        let question = this.questions.filter(
          (q) => q.test_paper_question_id == key.split('_').pop()
        )[0];

        if (
          question.qb_question_type_id == QUESTION_TYPE.FILL_IN_THE_BLANKS ||
          question.qb_question_type_id == QUESTION_TYPE.MULTI_SELECT_MCQ ||
          question.qb_question_type_id == QUESTION_TYPE.SINGLE_SELECT_MCQ
        ) {
          answer.answer = this.formatAnswers(
            question.qb_question_type_id,
            this.testPaperForm.get(key).value
          );
        } else {
          answer.answer = this.testPaperForm.get(key).value.answer;
          if (this.testPaperForm.get(key).value.image) {
            answer.attachments = [];
            let index = 1;
            this.testPaperForm.get(key).value.image.forEach((image) => {

              if (!image.saved) {
                let atch: Attachment = {};
                atch.fileName = image.file.name;
                atch.delete = image.delete;
                if (!atch.delete) atch.data = image.file;
                atch.id =
                  String(question.test_paper_question_id) +
                  '_' +
                  index.toString();
                atch.uid = image.uid;
                attachments.push(atch);
                index++;
              }
            });
          }
        }

        studentAnswers.push(answer);
        //this.testPaperForm.get(key).markAsPristine();
      }
    });
    studentAnswersResp.studentAnswers = studentAnswers;
    studentAnswersResp.studentAttachments = attachments;
    studentAnswersResp.studentExamId = this.testDetails.studentExamId;
    studentAnswersResp.testPaperId = this.testDetails.testPaperId;
    studentAnswersResp.finalSubmit = this.formSubmitted;
    return studentAnswersResp;
  }

  public startAutoSaveTimer() {
    this.autoSaveMode = true;
    var saveTimeout = environment.autoSaveDraftTestPaper * 60 * 1000;
    // set a timeout to refresh the token a minute before it expires
    let expires = new Date(Date.now() + saveTimeout);
    let timeout = expires.getTime() - Date.now();
    this.fireAutoSave = setTimeout(() => this.onSaveDraft(true), timeout);
  }

  formatAnswers(questionType, data) {
    var answer: any;
    switch (questionType) {
      case QUESTION_TYPE.FILL_IN_THE_BLANKS: {
        answer = [];
        Object.keys(data).forEach((key) => {
          answer.push(data[key]);
        });
        return answer.join("~`^");
      }
      case QUESTION_TYPE.MULTI_SELECT_MCQ: {
        answer = [];
        Object.keys(data).forEach((key) => {
          answer.push(data[key]);
        });
        return answer.join();
      }
      case QUESTION_TYPE.SINGLE_SELECT_MCQ: {
        answer = '';
        Object.keys(data).forEach((key) => {
          answer = data[key];
        });
        return answer;
      }
    }
    return answer;
  }

  getSubjectiveAnswerRows(selectedQtype) {
    var rows = 1;
    switch (selectedQtype) {
      case QUESTION_TYPE.VERY_SHORT_QUESTION: {
        rows = 2;
        break;
      }
      case QUESTION_TYPE.SHORT_QUESTION: {
        rows = 5;
        break;
      }
      case QUESTION_TYPE.LONG_QUESTION: {
        rows = 15;
        break;
      }
    }
    return rows;
  }

  open(src): void {
    this._albums=[];
    const album = {
      src: src,
   };
   this._albums.push(album);
    this._lightbox.open(this._albums, 0,{fitImageInViewPort:true,centerVertically:true,disableScrolling:true,showZoom:true});
  }

  openImage(event): void {
    if (event.target && event.target.tagName == 'IMG') {
      if (event.target.src) {
        let albums = [];
        const album = {
          src: event.target.src,
        };
        albums.push(album);
        this._lightbox.open(albums, 0, { fitImageInViewPort: true, centerVertically: true, disableScrolling: true, showZoom: true });
      }
    }
  }
}
