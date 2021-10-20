import { CommonGradeSubjectConfiguration, CommonGradeSubjectComponent } from './../../_components/common-grade-subject/common-grade-subject.component';
import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Grade, Subject, Question } from '../../entities';
import { BackendService } from '../../backend';
import { QUESTION_TYPE, DIFFICULTY_LEVEL } from '../../entities'
import { FrontendService } from 'src/app/_services/frontend.service';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService, downloadFile, extractTextFromHtml } from 'src/app/_helpers/common';
import { ReportIssueComponent } from 'src/app/question-bank/report-issue/report-issue.component';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-question-bank-list',
  templateUrl: './question-bank-list.component.html',
  styleUrls: ['./question-bank-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class QuestionBankListComponent implements OnInit {

  userIdentity: any
  grades: Grade[];
  selectedGrade: Grade;

  subjects: Subject[];
  selectedSubject: Subject;

  config: CommonGradeSubjectConfiguration = new CommonGradeSubjectConfiguration();
  questionDataSource = new MatTableDataSource<Question>();
  questionColumnsToDisplay = ['order', 'Question Type', 'Chapter', 'Topic', 'Question', 'Skill Assesed', 'action', 'expand_icon']
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(CommonGradeSubjectComponent) filter: CommonGradeSubjectComponent;
  expandedQuestion: Question | null;
  @Output() selected4Edit = new EventEmitter()
  resultQuestions: any;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog,
    private snackBar: CommonService,
    private lightbox: Lightbox
  ) { }

  ngOnInit(): void {
    this.config.isGradeRequired = true;
    this.config.isSubjectVisible = true;
    this.config.isSubjectRequired = true;
    this.config.isChapterVisible = true;
    this.config.isChapterRequired = true;
    this.config.isTopicVisible = true;
    this.config.isQTypeVisible = true;

    this.questionDataSource.sort = this.sort;
    this.questionDataSource.paginator = this.paginator;
    this.userIdentity = this.frontendService.getJWTUserIdentity();

  }

  loadData() {
    if (this.filter.validateForm()) {
      // Reset the page index
      this.paginator.pageIndex = 0;
      //reset result questions
      this.resultQuestions = [];

      let filterValues = this.filter.value;

      this.backendService.getQuestion(
        filterValues.grade,
        filterValues.subject,
        filterValues.chapter,
        filterValues.topic,
        filterValues.qtype).toPromise().then((result: string) => {
        this.resultQuestions = JSON.parse(result)
        this.questionDataSource.data = this.resultQuestions.map(function (q) {
          return {
            'grade': filterValues.grade,
            'subject': filterValues.subject,
            'qb_question_id': q.qb_question_id,
            'chapter_id': q.chapter_id,
            'topic_id': q.topic_id,
            'skill': q.skill,
            'qb_question_type_id': q.qb_question_type_id,
            'indicative_marks': q.indicative_marks,
            'qb_difficulty_level_id': q.qb_difficulty_level_id,
            'Difficulty Level': q.difficulty_level_name,
            'average_minutes': q.average_minutes,
            'QuestionTextExtract' : extractTextFromHtml(q.question_text).slice(0, 70) + '..',
            'Question Type': q.question_type_name,
            'Chapter': q.chapter_text,
            'Topic': q.topic_text,
            'keywords': q.keywords,
            'create_user': q.create_user,
            'update_user': q.update_user,
            'create_user_id': q.create_user_id,
          }
        }, [filterValues.grade, filterValues.subject])
      }).catch((error:any) => {
                    console.log(error);
                })
    }
  }

  async editQuestion(selectedQuestion: Question, row) {
    await this.expandQuestion(selectedQuestion, row)
    this.selected4Edit.emit(selectedQuestion)
  }

  deleteQuestion(selectedQuestion: Question, row) {
    // To check same user is deleting the question.
    let dialogMsg = "";
    if (this.userIdentity.userId == selectedQuestion.create_user_id) {
      dialogMsg = 'Are you sure you want to delete question \'' + selectedQuestion.QuestionTextExtract.slice(0, 20) + '\' ?';
    } else {
      dialogMsg = "Question \'" + selectedQuestion.QuestionTextExtract.slice(0, 20) + "\' was created by \'" + selectedQuestion.create_user + "\'.  Are you sure you want to delete it?";
    }

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { title: 'Confirm Question Delete', message: dialogMsg, yes: 'Delete', no: 'Cancel' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.backendService.deleteQuestion(selectedQuestion.qb_question_id).toPromise().then((result: any) => {
          this.snackBar.showSuccessMsg(result);
          let qData = this.questionDataSource.data;
          qData.splice(row, 1);
          this.questionDataSource.data = qData;
        }).catch( (error) => {
          this.snackBar.showErrorMsg(error);
        });
      }
    });
  }

  downloadQuestionAttachment(attachmentId, attachmentName) {
    this.backendService
        .downloadAttachment("questionBank", attachmentId)
        .toPromise().then((data) => {
          downloadFile(data, attachmentName, true);
        }).catch((error:any) => {
            this.snackBar.showErrorMsg(error);
            console.log(error);
        });
  }

  inferClass(element) {
    var diff_level_css_class
    switch (element.qb_difficulty_level_id) {
      case DIFFICULTY_LEVEL.EASY:
        diff_level_css_class = 'dl-easy'
        break
      case DIFFICULTY_LEVEL.MEDIUM:
        diff_level_css_class = 'dl-medium'
        break
      case DIFFICULTY_LEVEL.HARD:
        diff_level_css_class = 'dl-hard'
        break
      case DIFFICULTY_LEVEL.NOT_SPECIFIED:
        diff_level_css_class = ''
        break
    }

    var q_type_css_class

    switch (element.qb_question_type_id) {
      case QUESTION_TYPE.VERY_SHORT_QUESTION:
        q_type_css_class = 'qt-veryshort'
        break
      case QUESTION_TYPE.SHORT_QUESTION:
        q_type_css_class = 'qt-short'
        break
      case QUESTION_TYPE.LONG_QUESTION:
        q_type_css_class = 'qt-long'
        break
      case QUESTION_TYPE.SINGLE_SELECT_MCQ:
        q_type_css_class = 'qt-singleselect'
        break
      case QUESTION_TYPE.MULTI_SELECT_MCQ:
        q_type_css_class = 'qt-multiselect'
        break
      case QUESTION_TYPE.FILL_IN_THE_BLANKS:
        q_type_css_class = 'qt-fillblank'
        break
      case QUESTION_TYPE.MULTI_QUESTION_GROUP:
        q_type_css_class = 'qt-multiquestion'
        break
    }

    return diff_level_css_class + ' ' + q_type_css_class
  }

  report(selectedQuestion: Question) {
    const dialogRef = this.dialog.open(ReportIssueComponent, {
      width: '350px',
      disableClose: true,
      data: { title: 'Report', yes: 'Report', no: 'Cancel' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log(result.data);
      }
    });
  }

  expandQuestion(element, row)
  {
    this.expandedQuestion = this.expandedQuestion === element ? null : element;
    // find the array index
    let arIndex = this.paginator.pageIndex * this.paginator.pageSize + row;
    if (this.expandedQuestion)
    {
      (!this.questionDataSource.data[arIndex].Question) // because this cannot be null
      {
        // Assign missing values to the questionDataSource from resultQuestions.
        // This solution is implemented to avoid extreme delay due to mathml rendering.
        this.questionDataSource.data[arIndex].Question = this.resultQuestions[arIndex]['question_text'];
        this.questionDataSource.data[arIndex].question_attachment_file_name = this.resultQuestions[arIndex]['question_attachment_file_name'];
        this.questionDataSource.data[arIndex].objective_answers = this.resultQuestions[arIndex]['objective_answers'];
        this.questionDataSource.data[arIndex].subjective_answer = this.resultQuestions[arIndex]['subjective_answer'];
        this.questionDataSource.data[arIndex].question_attachment = JSON.parse(this.resultQuestions[arIndex]['question_attachment']);
        this.questionDataSource.data[arIndex].answer_attachment = JSON.parse(this.resultQuestions[arIndex]['answer_attachment']);
      }
    }
  }

  clearFilter(){
    this.filter.reset();
    this.questionDataSource.data = [];
  }

  openImage(event): void {
    if (event.target && event.target.tagName == 'IMG') {
      if (event.target.src) {
        let albums = [];
        const album = {
          src: event.target.src,
        };
        albums.push(album);
        this.lightbox.open(albums, 0, { fitImageInViewPort: true, centerVertically: true, disableScrolling: true, showZoom: true });
      }
    }
  }

}
