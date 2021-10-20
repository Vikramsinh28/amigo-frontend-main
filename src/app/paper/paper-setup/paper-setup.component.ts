import { Paper } from './../../entities/paper';
import { BackendService } from 'src/app/backend';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Question, PaperQuestion } from 'src/app/entities';
import { trigger, state, style, transition, animate, } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { QUESTION_TYPE, DIFFICULTY_LEVEL } from '../../entities';
import { FrontendService } from 'src/app/_services/frontend.service';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonService, extractTextFromHtml } from 'src/app/_helpers/common';
import { ReportIssueComponent } from 'src/app/question-bank/report-issue/report-issue.component';
import { CommonGradeSubjectComponent, CommonGradeSubjectConfiguration } from 'src/app/_components/common-grade-subject/common-grade-subject.component';
import { PaperSetupChartDisplayComponent } from 'src/app/visualizations/paper-setup-chart-display/paper-setup-chart-display.component';
import { Lightbox } from 'ngx-lightbox';

export  interface pieEntity{
  name ?: String;
  percentage ?: String;
}
export interface multiLevelDonutDs
{
  chapter ?: pieEntity;
  topic ?: multiLevelDonutDs[];
}

@Component({
  selector: 'app-paper-setup',
  templateUrl: './paper-setup.component.html',
  styleUrls: ['./paper-setup.component.scss'],
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



export class PaperSetupComponent implements OnInit, AfterViewInit {
  @ViewChild(CommonGradeSubjectComponent) filter: CommonGradeSubjectComponent;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('paginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) tableOneSort: MatSort;
  @ViewChild('TableTwoSort', { static: true }) tableTwoSort: MatSort;
  @ViewChild('testNameCnt') testNameCnt: ElementRef;
  @Input('testPaper4Edit') testPaper4Edit: Paper;
  @Output() updationDone = new EventEmitter();

  config: CommonGradeSubjectConfiguration = new CommonGradeSubjectConfiguration();

  questions: Array<Question> = [];
  dsQuestions: Array<any> = [];

  questionDataSource = new MatTableDataSource<Question>(this.questions);
  selectedQuestionDataSource = new MatTableDataSource<Question>();

  dsSelectedQuestions: any[] = [];
  selectedQuestions: any[] = [];

  total_actual_marks: number = 0;
  testPaperId: number = 0;
  isFrozenOrNot: boolean = false;
  activeNode = 0;

  multiLevelDonutData: multiLevelDonutDs[] = [];

  perviewButtonLabel: string = "Save & Preview";
  questionColumnsToDisplay = [
    'order',
    'question_type_name',
    'question_text',
    'Skill Assesed',
    'indicative_marks',
    'add',
    'action',
    'expand_icon',
  ];
  selectedquestionsColumnsToDisplay = [
    'order',
    'question_type_name',
    'question_text',
    'Skill Assesed',
    'actual_marks',
    'delete',
    'action',
    'expand_icon',
  ];

  userIdentity: any;
  testName: string = '';

  disableSelect: boolean = false;
  disableFreeze: boolean = false;
  disableButton: boolean = false;
  disablePreviewButton: boolean = true;
  isAllQuestionDeleteAble: boolean = true; // Question added inside grid will only delete in draft and new paper setup mode.
  isSpecialCharacterPress: boolean = false;
  expandedQuestion: Question | null;
  expandedQuestion_2: Question | null;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackBar: CommonService,
    public dialog: MatDialog,
    private lightbox: Lightbox
  ) { }

  ngAfterViewInit(): void {
    this.paginator.pageSize = 5;
    this.paginator2.pageSize = 10;
  }

  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();

    this.config.isGradeRequired = true;
    this.config.isSubjectVisible = true;
    this.config.isSubjectRequired = true;
    this.config.isChapterVisible = true;
    this.config.isChapterRequired = true;
    this.config.isTopicVisible = true;
    this.config.isQTypeVisible = true;

    this.questionDataSource.paginator = this.paginator;
    this.selectedQuestionDataSource.paginator = this.paginator2;

    this.questionDataSource.sort = this.tableOneSort;
    this.selectedQuestionDataSource.sort = this.tableTwoSort;
  }


  async onEditPaper(testPaper: any) {
    this.testPaper4Edit = testPaper;
    if (this.testPaper4Edit) {
      let filterData = {
        grade: this.testPaper4Edit.grade,
        subject: this.testPaper4Edit.subjectId
      }
      this.filter.value = filterData;

      this.disablePreviewButton = false;
      await this.backendService
        .getTestPaperQuestions(
          this.testPaper4Edit.testPaperId,
          this.testPaper4Edit.isFrozen
        )
        .toPromise()
        .then((data: string) => {
          this.selectedQuestions = JSON.parse(data);

          this.selectedQuestions.forEach(question => {
            var cacheQuestion: any = {'qb_question_id' : question.qb_question_id,
                                'question_text' : question['question_text'],
                                'subjective_answer': question.subjective_answer,
                                'objective_answers' : question.objective_answers }

            this.dsSelectedQuestions.push(cacheQuestion);
            question.QuestionTextExtract = extractTextFromHtml(question.question_text).slice(0, 40) + '..';
            question['quesTypeCssClass'] = this.inferQuesTypeClass(question.qb_question_type_id),
            question['difficultyCssClass'] = this.inferDifficultyClass(question.qb_difficulty_level_id)
            question.question_text = '';
            question.subjective_answer = '';
            question.objective_answers = '';
          });
          this.selectedQuestionDataSource.data = this.selectedQuestions;
          this.reCalculateTotalMarks();
          this.checkAndDisableFilters();
          this.checkAndDisableButtons();
        }).catch((error:any) => {
                    console.log(error);
                });

      this.testName = this.testPaper4Edit.paperName;
      this.testPaperId = this.testPaper4Edit.testPaperId;

      if (this.testPaper4Edit.isFrozen) {
        this.isFrozenOrNot = true;
        this.changePreviewButtonText("Preview");
        this.columsToShowOnFreeze();
        this.filter.disableAllControls();
      } else {
        this.isFrozenOrNot = false;
        this.changePreviewButtonText("Save & Preview");
        this.isAllQuestionDeleteAble = false;
        this.filter.disableControl('grade');
        this.filter.disableControl('subject');
      }
    }

  }

  onCancel() {
    this.clearForm();

    this.updationDone.emit(null);
    this.testPaper4Edit = null;
    this.disableButton = false;
    this.disableSelect = false;
    this.disablePreviewButton = true;
    this.isFrozenOrNot = false;
    this.isAllQuestionDeleteAble = true;
    this.filter.reset();
    this.filter.enableAllControls();
      }

  clearForm() {
    this.testPaperId = null;
    this.testName = '';
    this.questions = []
    this.dsQuestions = []
    this.selectedQuestions = []
    this.dsSelectedQuestions = []
    this.questionDataSource.data = []
    this.selectedQuestionDataSource.data = []
    this.total_actual_marks = 0;
    this.selectedquestionsColumnsToDisplay = [
      'order',
      'question_type_name',
      'question_text',
      'actual_marks',
      'delete',
      'action',
      'expand_icon',
    ];
    this.questionColumnsToDisplay = [
      'order',
      'question_type_name',
      'question_text',
      'indicative_marks',
      'add',
      'action',
      'expand_icon',
    ];
    this.changePreviewButtonText("Save & Preview");
  }

  onRowAddClick(row: Question, element) {
    element.preventDefault();
    element.stopPropagation();
    let index = this.findIndex(this.selectedQuestions, row.qb_question_id);
    if (index < 0) {
      row = this.questions.filter((q) => q.qb_question_id == row.qb_question_id)[0]
      row.position = this.selectedQuestions.length + 1;
      row['quesTypeCssClass'] = this.inferQuesTypeClass(row.qb_question_type_id);
      row['difficultyCssClass'] = this.inferDifficultyClass(row.qb_difficulty_level_id);

      if (!row['question_text']) {
        let qCache = this.dsQuestions.filter((q) => q.qb_question_id == row.qb_question_id)[0];
        this.dsSelectedQuestions.push(qCache);
      }
      else {
        let cacheQuestion: any = {
          'qb_question_id': row.qb_question_id,
          'question_text': row['question_text'],
          'subjective_answer': row.subjective_answer,
          'objective_answers': row.objective_answers
        }
        this.dsSelectedQuestions.push(cacheQuestion);
      }
      row['question_text'] = '';
      row['subjective_answer'] = '';
      row['objective_answers'] = '';

      this.selectedQuestions.push(row);

      this.selectedQuestionDataSource.data = this.selectedQuestions;

      this.checkAndDisableFilters();
      this.reCalculateTotalMarks();

      if (this.selectedQuestionDataSource.data.length > 0) {
        this.enableDisableButton(false);
      }
    } else {
      this.snackBar.showErrorMsg('You have already added this question.');
    }
  }

  onRowDeleteClick(row: Question, element) {
    if (this.isAllQuestionDeleteAble == false) {
      //If in draft mode then minimum one question is required.
      if (this.selectedQuestionDataSource.data.length > 1) {
        element.preventDefault();
        element.stopPropagation();
        let index = -1;
        index = this.findIndex(
          this.selectedQuestionDataSource.data,
          row.qb_question_id
        );
        this.selectedQuestions.splice(index, 1);
        this.selectedQuestionDataSource.data = this.selectedQuestions;
        this.reArrangePositions();
        this.reCalculateTotalMarks();
        this.checkAndDisableFilters();
      } else {
        this.snackBar.showErrorMsg('After savedraft, atleast one question has to be added to the paper. You cannot remove all the questions');
      }
    } else {
      // If question is new then user can delete all question.
      element.preventDefault();
      element.stopPropagation();
      let index = -1;
      index = this.findIndex(
        this.selectedQuestionDataSource.data,
        row.qb_question_id
      );
      this.selectedQuestions = this.selectedQuestionDataSource.data;
      this.selectedQuestions.splice(index, 1);
      this.selectedQuestionDataSource.data = this.selectedQuestions;
      this.reArrangePositions();
      this.reCalculateTotalMarks();
      this.checkAndDisableFilters();
    }
  }

  findIndex(array, id) {
    let index = -1;
    array.forEach((element, i) => {
      if (element.qb_question_id === id) index = i;
      return;
    });
    return index;
  }

  reArrangePositions() {
    let questions: Array<Question> = this.selectedQuestionDataSource.data;
    questions.forEach((q, index) => {
      q.position = index + 1;
    });
    this.selectedQuestionDataSource.data = questions;
  }

  reCalculateTotalMarks() {
    this.total_actual_marks = 0;
    let questions: Array<Question> = this.selectedQuestionDataSource.data;
    questions.forEach((q, index) => {
      this.total_actual_marks =
        Number(this.total_actual_marks) + Number(q.actual_marks);
    });
  }

  async loadQuestions() {
    this.questions = [];
    this.questionDataSource.data = [];

    if (this.filter.validateForm()) {
      let filterValues = this.filter.value;
      await this.backendService.getQuestion(
        filterValues.grade,
        filterValues.subject,
        filterValues.chapter,
        filterValues.topic,
        filterValues.qtype).toPromise().then((result: string) => {
          this.questions = JSON.parse(result);
          this.questions.forEach((q: any) =>
          {
            q.actual_marks = q.indicative_marks;
            q.grade = filterValues.grade;
            q.subject = filterValues.subject;
            q.QuestionTextExtract = extractTextFromHtml(q.question_text).slice(0, 40) + '..';
            q['quesTypeCssClass'] = this.inferQuesTypeClass(q.qb_question_type_id);
            q['difficultyCssClass'] = this.inferDifficultyClass(q.qb_difficulty_level_id);


            var cacheQuestion: any = {'qb_question_id' : q.qb_question_id,
                                'question_text' : q['question_text'],
                                'subjective_answer': q.subjective_answer,
                                'objective_answers' : q.objective_answers }

            this.dsQuestions.push(cacheQuestion);
            q['question_text'] = '';
            q.subjective_answer = '';
            q.objective_answers = '';
          },(error:any) => {
                    console.log(error);
                });

        });
        this.questionDataSource.data = this.questions;
    }
  }

  savePaper(isFrozen, isForPreview) {
    let questions: Array<PaperQuestion> = this.selectedQuestionDataSource.data.map(
      function (q) {
        return {
          qb_question_id: q.qb_question_id,
          position: q.position,
          actual_marks: q.actual_marks,
        };
      }
    );
    if (this.validateForm(questions)) {
      let testPaper = <Paper>{};
      if (this.testPaperId > 0) testPaper.testPaperId = this.testPaperId;
      let filterValues = this.filter.value;
      testPaper.paperName = this.testName;
      testPaper.grade = filterValues.grade;
      testPaper.subject = filterValues.subject;
      testPaper.questions = questions;
      testPaper.isFrozen = isFrozen;
      testPaper.clientId = this.userIdentity.clientId;
      testPaper.createdUser = this.userIdentity.userId;

      this.backendService
        .TestPaperSaveDraft(JSON.stringify(testPaper))
        .toPromise()
        .then((data: string) => {
          this.testPaperId = Number(data);
          this.disablePreviewButton = false;
          this.isFrozenOrNot = false;
          this.checkAndDisableFilters();
          if (testPaper.isFrozen == 1) {
            this.setControlStatusForFrozen();
            this.snackBar.showSuccessMsg('Paper \'' + testPaper.paperName + '\' is now frozen and cannot be modified');
          } else {
            if (isForPreview) {
              this.displayPreview();
            }
            this.snackBar.showSuccessMsg('Paper \'' + testPaper.paperName + '\' is saved');
            this.isAllQuestionDeleteAble = false;
          }
        }).catch((e) => {
          this.snackBar.showErrorMsg(e.error)
        });
    }
  }

  validateForm(selectedQuestions) {
    let isMarksGreaterThanZero: boolean = true;
    if (this.testName.trim().length <= 0) {
      this.snackBar.showErrorMsg('Please enter papername');
      this.testNameCnt.nativeElement.focus();
      return false;
    }

    if (this.selectedQuestionDataSource.data.length === 0) {
      this.snackBar.showErrorMsg('Please add atleast one question to save the paper');
      return false;
    }

    selectedQuestions.forEach(element => {
      if (element.actual_marks <= 0 || element.actual_marks == null) {
        this.snackBar.showErrorMsg('Actual marks must be greater than 0');
        isMarksGreaterThanZero = false;
      }
    });

    if (isMarksGreaterThanZero) {
      return true;
    } else {
      return false
    }
  }

  getTotalMarks(event) {
    let sum: number = Number(this.total_actual_marks);
    sum = Number(sum) + Number(event.target.value);
    this.total_actual_marks = sum;
  }

  checkAndDisableFilters() {
    if (this.selectedQuestionDataSource.data.length > 0)
      this.disableSelect = true;
    else this.disableSelect = false;
  }

  checkAndDisableButtons() {
    if (this.testPaper4Edit)
      this.disableButton = this.testPaper4Edit.isFrozen == 1 ? true : false;
  }

  inferQuesTypeClass(questionTypeId?) {
    var q_type_css_class;
    switch (questionTypeId) {
      case QUESTION_TYPE.VERY_SHORT_QUESTION:
        q_type_css_class = 'qt-veryshort';
        break;
      case QUESTION_TYPE.SHORT_QUESTION:
        q_type_css_class = 'qt-short';
        break;
      case QUESTION_TYPE.LONG_QUESTION:
        q_type_css_class = 'qt-long';
        break;
      case QUESTION_TYPE.SINGLE_SELECT_MCQ:
        q_type_css_class = 'qt-singleselect';
        break;
      case QUESTION_TYPE.MULTI_SELECT_MCQ:
        q_type_css_class = 'qt-multiselect';
        break;
      case QUESTION_TYPE.FILL_IN_THE_BLANKS:
        q_type_css_class = 'qt-fillblank';
        break;
      case QUESTION_TYPE.MULTI_QUESTION_GROUP:
        q_type_css_class = 'qt-multiquestion';
        break;
    }
    return q_type_css_class;
  }

  inferDifficultyClass(difficultyLevelId?) {
    var diff_level_css_class;
    switch (difficultyLevelId) {
      case DIFFICULTY_LEVEL.EASY:
        diff_level_css_class = 'dl-easy';
        break;
      case DIFFICULTY_LEVEL.MEDIUM:
        diff_level_css_class = 'dl-medium';
        break;
      case DIFFICULTY_LEVEL.HARD:
        diff_level_css_class = 'dl-hard';
        break;
      case DIFFICULTY_LEVEL.NOT_SPECIFIED:
        diff_level_css_class = '';
        break;
    }

    return diff_level_css_class;
  }

  // First will check is paper frozen or draft.
  // If draft then will save paper on successfull save will display paper.
  // If frozen will display paper directly.
  checkPaperIsFrozenOrDraft() {
    if (!this.isFrozenOrNot) {
      this.savePaper(false, true)
    } else {
      this.displayPreview();
    }
  }

  setControlStatusForFrozen()
  {
    this.columsToShowOnFreeze();
    this.changePreviewButtonText("Preview");
    this.isFrozenOrNot = true;
    this.disablePreviewButton = false;
    this.disableButton = true;
    this.disableSelect = true;
    this.filter.resetControl('chapter');
    this.filter.resetControl('topic');
    this.filter.resetControl('qtype');
    this.filter.disableAllControls();
    this.questionDataSource.data = []
  }
  // Display paper
  displayPreview() {

    let filterValue = this.filter.value;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      testPaperId: this.testPaperId,
      attachmentFileName: this.testName,
      withAnswerKey: true,
      isFrozen: this.isFrozenOrNot,
      withMarks: true,
      grade: filterValue.grade,
      subject: filterValue.subjectName
    };
    const dialogRef = this.dialog.open(
      PaperPreviewDialogBoxComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => { });
  }

  columsToShowOnFreeze() {
    this.questionColumnsToDisplay = [
      'question_type_name',
      'question_text',
      'indicative_marks',
      'expand_icon',
    ];
    this.selectedquestionsColumnsToDisplay = [
      'order',
      'question_type_name',
      'question_text',
      'actual_marks',
      'expand_icon',
    ];
  }

  enableDisableButton(status) {
    this.disablePreviewButton = status;
    this.disableButton = status;
  }

  changePreviewButtonText(labelText) {
    this.perviewButtonLabel = labelText
  }

  // Check for special character press.
  onKeyPress(event) {
    let regexStr = '^[a-zA-Z0-9-._ ]*$';
    if (event.length == 0) {
      return false;
    } else {
      if (new RegExp(regexStr).test(event.key)) {
        this.isSpecialCharacterPress = false;
      } else {
        this.isSpecialCharacterPress = true;
      }
    }
  }

  // Check is input marks greater than zero.
  checkIsGreaterThanZero(marks, row: number) {
    if (marks > 0) {
      this.selectedQuestionDataSource.data[row - 1].actual_marks = Number(parseFloat(marks).toFixed(2));// Round off value after three decimal place.
      this.reCalculateTotalMarks();
    } else {
      this.snackBar.showErrorMsg('Actual marks must be greater than 0');
    }
  }

  confirmFreeze() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { title: 'Confirm', message: 'You will not be able to modify frozen paper. Are you sure you want to freeze it?', yes: 'Yes', no: 'No' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savePaper(true, false)
      }
    });
  }

  report(selectedQuestion: Question) {
    const dialogRef = this.dialog.open(ReportIssueComponent, {
      width: '350px',
      disableClose: true,
      data: { title: 'Report', yes: 'Report', no: 'Cancel' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result.data);
      }
    });
  }

  onSelectedQuestionToggle(element, rowIndex) {
    this.expandedQuestion_2 = this.expandedQuestion_2 === element ? null : element;
    let arIndex = this.paginator2.pageIndex * this.paginator2.pageSize + rowIndex;

    if (!this.selectedQuestions[arIndex]['question_text']) {
      let cacheQue = this.dsSelectedQuestions.filter((q) => q.qb_question_id == element.qb_question_id);
      if (cacheQue) {
        this.selectedQuestions[arIndex]['question_text'] = cacheQue[0]['question_text'];
        this.selectedQuestions[arIndex]['subjective_answer'] = cacheQue[0]['subjective_answer'];
        this.selectedQuestions[arIndex]['objective_answers'] = cacheQue[0]['objective_answers'];
        this.selectedQuestionDataSource.data = this.selectedQuestions;
      }

    }

  }

  onQuestionToggle(element, rowIndex) {
    this.expandedQuestion = this.expandedQuestion === element ? null : element;
    let arIndex = this.paginator.pageIndex * this.paginator.pageSize + rowIndex;

    if (!this.questions[arIndex]['question_text']) {
      let cacheQue = this.dsQuestions.filter((q) => q.qb_question_id == element.qb_question_id);
      if (cacheQue)
      {
        this.questions[arIndex]['question_text'] = cacheQue[0]['question_text'];
        this.questions[arIndex]['subjective_answer'] = cacheQue[0]['subjective_answer'];
        this.questions[arIndex]['objective_answers'] = cacheQue[0]['objective_answers'];
      }
    }
      this.questionDataSource.data = this.questions;
  }

  displayQuestionTypeChart()
  {

    if(this.selectedQuestions.length==0)
    {
      this.snackBar.showErrorMsg('You haven\'t added a question.');
    }
    else
    {
        let data = [
      {"Question_type": "Single select", "Number":0},
      {"Question_type": "Multi select", "Number": 0},
      {"Question_type": "Very Short", "Number": 0},
      {"Question_type": "Short", "Number": 0},
      {"Question_type": "Long", "Number": 0},
      {"Question_type": "Fill-in", "Number":0}
       ];
    data[0].Number=this.selectedQuestions.filter(qb=>qb.qb_question_type_id==2).length;
    data[1].Number=this.selectedQuestions.filter(qb=>qb.qb_question_type_id==3).length;
    data[2].Number=this.selectedQuestions.filter(qb=>qb.qb_question_type_id==4).length;
    data[3].Number=this.selectedQuestions.filter(qb=>qb.qb_question_type_id==5).length;
    data[4].Number=this.selectedQuestions.filter(qb=>qb.qb_question_type_id==6).length;
    data[5].Number=this.selectedQuestions.filter(qb=>qb.qb_question_type_id==7).length;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    let chartData={data:data,chartType:"Question Type Chart"}
    dialogConfig.data = chartData;

   const dialogRef= this.dialog.open(PaperSetupChartDisplayComponent,dialogConfig);
   dialogRef.afterClosed().subscribe((result) => { });
    }

  }

  displayCTWeightageChart()
  {
    this.multiLevelDonutData=[];
    if(this.selectedQuestions.length==0)
    {
      this.snackBar.showErrorMsg('You haven\'t added a question.');
    }
    else
    {
    let chapterIds=[];
    let totalActualMarks=0;
    this.selectedQuestions.forEach(q => {
      chapterIds.push(q.chapter_id);
      totalActualMarks += Number(q.actual_marks);
    });

    chapterIds=Array.from(new Set(chapterIds)); 

    
    let topicsIds = [];
    chapterIds.forEach(c => {
      let donutDataObj:multiLevelDonutDs={};
      let chapters = this.selectedQuestions.filter(q => q.chapter_id == c);
      let topics = [];
      let chapterTotal = 0;
      let chapterObj : pieEntity={};
      chapters.forEach(c => {
        chapterTotal += Number(c.actual_marks);
        chapterObj.name = c.chapter_text;
        topics.push(c.topic_id);
      });
      let chapterPercentage = Math.round((chapterTotal*100)/totalActualMarks).toFixed(2);
      chapterObj.percentage=chapterPercentage;


      let topicObjs:multiLevelDonutDs[]=[];
      topics=Array.from(new Set(topics));      
      topics.forEach(t => {
        let donutDataSubObj : multiLevelDonutDs={};
        let topicObj : pieEntity={};
        let topic=chapters.filter( c => c.topic_id == t);
        let topicTotal=0;
        topic.forEach(t => {
          topicTotal += Number(t.actual_marks);
          topicObj.name = t.topic_text; 
        })
        let topicPercentage = Math.round((topicTotal*100)/totalActualMarks).toFixed(2);
        topicObj.percentage = topicPercentage;
        donutDataSubObj.chapter=topicObj;
        topicObjs.push(donutDataSubObj);

      })
      donutDataObj.chapter=chapterObj;
      donutDataObj.topic=topicObjs;
      this.multiLevelDonutData.push(donutDataObj);
    })
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    let chartData={data:this.multiLevelDonutData,chartType:"Chapter Topic Weightage Chart"}
    dialogConfig.data = chartData;

   const dialogRef= this.dialog.open(PaperSetupChartDisplayComponent,dialogConfig);
   dialogRef.afterClosed().subscribe((result) => { });

    }

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
