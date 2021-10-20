import { Component, OnInit, OnChanges, Input, SimpleChanges, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { BackendService } from '../../backend';
import { Grade, Subject, QuestionType, ChapterTopic, DifficultyLevel, Question } from '../../entities'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { QUESTION_TYPE } from '../../entities'
import { FrontendService } from 'src/app/_services/frontend.service';
import { FileAttachment } from 'src/app/_components/file-upload/file-upload/file-upload.component';
import { CommonService, downloadFile } from 'src/app/_helpers/common';
import { RichTextEditor } from 'src/app/_components/rich-text-editor/rich-text-editor.component';
import { validateRTEContent } from 'src/app/_helpers/common';
import { CommonGradeSubjectComponent, CommonGradeSubjectConfiguration } from 'src/app/_components/common-grade-subject/common-grade-subject.component';
export interface FileUploadModel {
  id: number;
  fileName: string;
  data?: File;
  delete: boolean;
}

export interface AnswerOption {
  optionText: string;
  isCorrect: boolean;
  optionEdit: boolean;
}

@Component({
  selector: 'app-question-bank-add-edit',
  templateUrl: './question-bank-add-edit.component.html',
  styleUrls: ['./question-bank-add-edit.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionBankAddEditComponent implements OnInit {
  @Input('question4Edit') question4Edit: Question
  form: FormGroup;
  userIdentity: any
  grades: Grade[]

  subjects: Subject[];

  qtypes: QuestionType[]
  selectedQtypeId: any
  selectedQtype: any;
  optionalQtypes = [QUESTION_TYPE.FILL_IN_THE_BLANKS, QUESTION_TYPE.MULTI_SELECT_MCQ, QUESTION_TYPE.SINGLE_SELECT_MCQ];
  subjectiveQtypes = [QUESTION_TYPE.VERY_SHORT_QUESTION, QUESTION_TYPE.SHORT_QUESTION, QUESTION_TYPE.LONG_QUESTION];

  chapterTopic: ChapterTopic[]
  chapters: ChapterTopic[] = []

  filteredChapters: Observable<ChapterTopic[]>;

  topics: ChapterTopic[] = []
  filteredTopics: Observable<ChapterTopic[]>;

  displayedAnswerOptionColumns: string[];

  optionText: string;
  spanCheck: boolean = false;
  minimumOptions: boolean = false;
  minimumMessage;
  chipCheck = false;

  //==== Keyword Chips ====//
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  keywords: string[] = []
  //==== Keyword Chips ====//

  skills: Array<string> = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating']

  difficultyLevels: DifficultyLevel[]

  answerOptions = new MatTableDataSource<AnswerOption>();
  isOptionInEdit: boolean = false;

  @Output() updationDone = new EventEmitter()

  submitBtnLabel = "Save & Return"
  questionAttachmentFile: FileAttachment[] = [];
  answerAttachmentFile: FileAttachment[] = [];
  @ViewChild("qtEditor") editor: RichTextEditor;
  @ViewChild("qtAnsEditor") answerEditor: RichTextEditor;
  config: CommonGradeSubjectConfiguration = new CommonGradeSubjectConfiguration();
  @ViewChild(CommonGradeSubjectComponent) filter: CommonGradeSubjectComponent;

  constructor(
    private backendService: BackendService,
    private snackBar: CommonService,
    public dialog: MatDialog,
    private frontendService: FrontendService
  ) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
  }

  ngOnInit(): void {
    this.backendService.getDifficultyLevels().toPromise().then((result: string) => {
      this.difficultyLevels = JSON.parse(result)
    }).catch((error:any) => {
                    console.log(error);
                })

    this.form = new FormGroup({
      filter: new FormControl(null),
      questionText: new FormControl(null, Validators.required),
      answerText: new FormControl(null),
      indicativeMarks: new FormControl(null, [Validators.max(1000), Validators.min(0.1)]),
      difficultyLevel: new FormControl(4),
      skills: new FormControl(null),
      timeInMinsToSolve: new FormControl(null, [Validators.max(1000), Validators.min(0)]),
      questionImage: new FormControl(this.questionAttachmentFile),
      answerImage: new FormControl(this.answerAttachmentFile)
    });

    this.config.isGradeRequired = true;
    this.config.isSubjectVisible = true;
    this.config.isSubjectRequired = true;
    this.config.isChapterVisible = true;
    this.config.isChapterRequired = true;
    this.config.isTopicVisible = true;
    this.config.isTopicRequired = true;
    this.config.isQTypeVisible = true;
    this.config.isQTypeRequired = true;

  }


  onEditQuestion(data) {
    var question4Edit: Question = data
    if (question4Edit) {
      //this.resetForm();
      this.submitBtnLabel = "Update";
      // this.form.controls.qtype.disable();
      this.filter.disableControl('qtype');
      this.config.isQTypeDisabled = true;
      let filterData = {
        grade: question4Edit.grade,
        subject: question4Edit.subject,
        chapter: question4Edit.chapter_id,
        topic: question4Edit.topic_id,
        qtype: question4Edit.qb_question_type_id
      }
      this.filter.value = filterData;

      if (question4Edit.answer_attachment != null) {
        let answ_data = question4Edit.answer_attachment;
        if (answ_data) {
          answ_data.forEach(file => {
            let answ_attach: FileAttachment = {};
            answ_attach.file = new File([''], file.fileName);
            answ_attach.info = file.id;
            answ_attach.delete = false;
            answ_attach.saved = true;
            this.answerAttachmentFile.push(answ_attach);
          });
        }
        this.form.controls.answerImage.setValue(this.answerAttachmentFile);
      }

      if (question4Edit.question_attachment != null) {
        let data = question4Edit.question_attachment;
        if (data) {
          data.forEach(file => {
            let attach: FileAttachment = {};
            attach.file = new File([''], file.fileName);
            attach.info = file.id;
            attach.delete = false;
            attach.saved = true;
            this.questionAttachmentFile.push(attach);
          });
        }
        this.form.controls.questionImage.setValue(this.questionAttachmentFile);
      }

      this.answerOptions.data = <any>question4Edit.objective_answers
      this.answerOptions.filter = '';

      if (question4Edit.keywords)
        this.keywords = question4Edit.keywords.split(',');

      this.form.controls.difficultyLevel.setValue(question4Edit.qb_difficulty_level_id);
      //this.editor.value = question4Edit.Question;
      this.form.controls.questionText.setValue(question4Edit.Question);
      this.form.controls.answerText.setValue(question4Edit.subjective_answer);
      this.form.controls.indicativeMarks.setValue(question4Edit.indicative_marks);
      this.form.controls.skills.setValue(question4Edit.skill);
      this.form.controls.timeInMinsToSolve.setValue(question4Edit.average_minutes);
    }
  }

  onQuestionTypeSelection() {
    if (this.selectedQtype == 1) {
      if (this.selectedQtypeId == QUESTION_TYPE.FILL_IN_THE_BLANKS) {
        this.displayedAnswerOptionColumns = ['optiontext', 'edit', 'delete'];
        this.spanCheck = false;
        this.minimumMessage = 'Question should have minimum one option.';
      } else {
        this.displayedAnswerOptionColumns = ['optiontext', 'iscorrect', 'edit', 'delete'];
        this.spanCheck = false;
        this.minimumOptions = false;
        this.minimumMessage = 'Question should have minimum two options.';
      }
    }
    else {
      this.spanCheck = false;
      this.minimumOptions = false;
    }
  }

  private resetForm(excludedFields = []) {
    excludedFields.push(...['questionText', 'answerText']);
    for (const field in this.form.controls) {
      const control = this.form.get(field);
      if (excludedFields) {
        if (excludedFields.indexOf(field) == -1) {
          this.resetControl(control, field)
        }
      } else {
        this.resetControl(control, field)
      }
    }
    this.questionAttachmentFile = [];
    this.keywords = []
    this.answerAttachmentFile = []
    this.answerOptions.data = []
    this.editor.resetEditor();
    if(this.answerEditor) this.answerEditor.resetEditor();
    this.filter.reset();
  }

  private resetControl(control, field) {
    if (field == 'difficultyLevel') {
      control.reset(4)
    } else {
      control.reset()
    }
  }

  onQuestionTypeChanged(value) {
    if (this.optionalQtypes.indexOf(value.qtype) > -1) {
      this.selectedQtype = 1;
      this.selectedQtypeId = value.qtype;
      this.minimumOption();
    }
    if (this.subjectiveQtypes.indexOf(value.qtype) > -1) this.selectedQtype = 2;
    this.onQuestionTypeSelection();
  }

  getSubjectiveAnswerCSS() {
    var css = ""
    var selectedQtype = this.form.controls.filter.value ? this.form.controls.filter.value.qtype : null;
    if (selectedQtype) {
      switch (selectedQtype.qb_question_type_id) {
        case QUESTION_TYPE.VERY_SHORT_QUESTION: {
          css = "vshort-answer-box"
          break
        }
        case QUESTION_TYPE.SHORT_QUESTION: {
          css = "short-answer-box"
          break
        }
        case QUESTION_TYPE.LONG_QUESTION: {
          css = "long-answer-box"
          break
        }
      }
      return css
    }
  }

  getSubjectiveAnswerRows() {
    var rows = 1
    var selectedQtype = this.form.controls.filter.value ? this.form.controls.filter.value.qtype : null;
    if (selectedQtype) {
      switch (selectedQtype.qb_question_type_id) {
        case QUESTION_TYPE.VERY_SHORT_QUESTION: {
          rows = 2
          break
        }
        case QUESTION_TYPE.SHORT_QUESTION: {
          rows = 5
          break
        }
        case QUESTION_TYPE.LONG_QUESTION: {
          rows = 15
          break
        }
      }
      return rows
    }
  }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      var found = false
      this.keywords.forEach(keyword => {
        if (keyword.toUpperCase() === value.toUpperCase()) {
          found = true;
        }
      });
      if (!found) {
        this.keywords.push(value.trim());
        if (this.keywords.length == 10) {
          this.chipCheck = true;
        }
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeKeyword(keyword: string): void {
    const index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
    this.chipCheck = false;
  }

  // Check whether to display the error message for option is checked or not
  spanDisplay() {
    if (this.selectedQtypeId == QUESTION_TYPE.FILL_IN_THE_BLANKS) {
      this.spanCheck = false;
    }
    else {
      this.spanCheck = true;
    }
    this.answerOptions.data.forEach(e => {
      if (e.isCorrect) {
        this.spanCheck = false;
      }
    })
  }

  // Check whether to display the error message for minimum options in objective questions
  minimumOption() {
    if (this.selectedQtypeId == QUESTION_TYPE.FILL_IN_THE_BLANKS) {
      if (this.answerOptions.data.length < 1) {
        this.minimumOptions = true;
      }
      else {
        this.minimumOptions = false;
      }
    }
    else {
      if (this.answerOptions.data.length < 2) {
        this.minimumOptions = true;
      }
      else {
        this.minimumOptions = false;
      }
    }
  }

  deleteAnswerOption(element: AnswerOption) {
    this.isOptionInEdit = false;
    const index = this.answerOptions.data.indexOf(element)
    if (index > -1) {
      this.answerOptions.data.splice(index, 1);
      this.answerOptions.filter = '';
    }
    this.spanDisplay();
    this.minimumOption();
  }

  editAnswerOption(element: AnswerOption) {
    this.answerOptions.data.forEach(e => {
      if (e.optionEdit) {
        this.saveOption(e);
      }
    })
    if (!this.checkIsOptionInEdit()) {
      this.isOptionInEdit = true;
      this.optionText = element.optionText.trim();
      element.optionEdit = true;
    } else {
      this.snackBar.showErrorMsg('Please save previous option to edit another option');
    }
  }

  saveOption(element: AnswerOption) {
    if (this.optionText.trim().length > 0) {
      this.isOptionInEdit = false;
      element.optionText = this.optionText;
      element.optionEdit = false;
      this.minimumOption();
    } else {
      this.isOptionInEdit = true;
    }
  }

  addAnswerOption(): void {
    this.answerOptions.data.forEach(e => {
      if (e.optionEdit) {
        this.saveOption(e);
      }
    })
    this.optionText = '';
    this.isOptionInEdit = true;
    if (this.selectedQtypeId == QUESTION_TYPE.FILL_IN_THE_BLANKS) {
      if (!this.checkIsOptionInEdit()) {
        this.answerOptions.data.push({ optionText: this.optionText, isCorrect: true, optionEdit: true })
      } else {
        this.snackBar.showErrorMsg('Please save previous option to add another option');
      }
    }
    else {
      // this.answerOptions.data.push({ optionText: this.optionText, isCorrect: false, optionEdit: true })
      if (!this.checkIsOptionInEdit()) {
        this.answerOptions.data.push({ optionText: this.optionText, isCorrect: false, optionEdit: true })
      } else {
        this.snackBar.showErrorMsg('Please save previous option to add another option');
      }
    }
    this.answerOptions.filter = '';
    this.spanDisplay();
  }

  onAnswerOptionIsCorrectChange(element, isCorrect) {
    this.spanCheck = false;
    switch (this.selectedQtypeId) {
      case QUESTION_TYPE.SINGLE_SELECT_MCQ:
        this.answerOptions.data = this.answerOptions.data.map(function (answerOption) {
          if (answerOption.optionText == element.optionText) {
            answerOption.isCorrect = true
          } else {
            answerOption.isCorrect = false
          }
          return answerOption
        })
        break
      case QUESTION_TYPE.MULTI_SELECT_MCQ:
        this.answerOptions.data = this.answerOptions.data.map(function (answerOption) {
          if (answerOption.optionText == element.optionText) {
            answerOption.isCorrect = isCorrect
          }
          return answerOption
        })
        this.spanDisplay();
        break
    }
  }

  onSubmit(form, nextAction) {

    var question_Validate = validateRTEContent();

    if (question_Validate.imageCount > 2) {
      this.snackBar.showErrorMsg('Only two images are allowed in the question text');
    }
    else if (question_Validate.imageCount == 1) {
      this.snackBar.showErrorMsg("Image " + question_Validate.imagePosition + " is exceeding 15Kb.");
    }
    else if (question_Validate.imageCount == 2) {
      this.snackBar.showErrorMsg('Both images are exceeding 15Kb.');
    }
    else {
      if (!this.checkIsOptionInEdit()) {
        const fd = new FormData();

        if (this.question4Edit)
          fd.append("qb_question_id", this.question4Edit.qb_question_id.toString())

        let filterData = this.form.controls.filter.value;

        fd.append("client_id", this.userIdentity.clientId)
        fd.append("grade", filterData.grade)
        fd.append("subject_id", filterData.subject)
        fd.append("qb_question_type_id", filterData.qtype)

        var selectedChapter = filterData.chapter;
        if (selectedChapter) {
          fd.append("chapter_id", filterData.chapter + '')
          fd.append("chapter_text", filterData.chapterName + '')
        } else {
          fd.append("chapter_text", filterData.chapterName)
        }

        var selectedTopic = filterData.topic;
        if (selectedTopic) {
          fd.append("topic_id", filterData.topic + '')
          fd.append("topic_text", filterData.topicName + '')
        } else {
          fd.append("topic_text", filterData.topicName)
        }

        fd.append("question_text", this.form.value.questionText)

        if (this.answerOptions && this.answerOptions.data) {
          fd.append("options", this.answerOptions.data.length > 0 ? JSON.stringify(this.answerOptions.data) : '')
        }


        var deleteQuestionAttachments = []
        var addQuestionAttachments = []
        if (this.form.controls.questionImage.value != null &&
          this.form.controls.questionImage != undefined) {
          this.form.controls.questionImage.value.forEach(file => {
            if (file.delete && file.saved) {
              deleteQuestionAttachments.push({ id: file.info })
            } else if (!file.saved && !file.delete) {
              var id = file.uid + "_question_doc"
              fd.append(id, file.file);
              addQuestionAttachments.push({ id: id, fileName: file.file.name })
            }
          });
        }
        fd.append('question_add_docs', JSON.stringify(addQuestionAttachments))
        fd.append('question_remove_docs', JSON.stringify(deleteQuestionAttachments))

        fd.append("keywords", this.keywords.toString())

        var answerText = this.form.value.answerText
        answerText = answerText === null ? '' : answerText
        fd.append("answer_text", answerText)

        var deleteAnswerAttachments = []
        var addAnswerAttachments = []
        if (this.form.controls.answerImage.value != null &&
          this.form.controls.answerImage != undefined) {
          this.form.controls.answerImage.value.forEach(file => {
            if (file.delete && file.saved) {
              deleteAnswerAttachments.push({ id: file.info })
            }
            else if (!file.saved && !file.delete) {
              var id = file.uid + "_subjective_answer_doc"
              fd.append(id, file.file);
              addAnswerAttachments.push({ id: id, fileName: file.file.name })
            }
          });
        }
        fd.append('subjective_answer_add_docs', JSON.stringify(addAnswerAttachments))
        fd.append('subjective_answer_remove_docs', JSON.stringify(deleteAnswerAttachments))

        var indicativeMarks = this.form.controls.indicativeMarks.value
        indicativeMarks = indicativeMarks === null ? '' : indicativeMarks
        fd.append('indicative_marks', indicativeMarks)

        var difficultyLevel = this.form.controls.difficultyLevel.value
        difficultyLevel = difficultyLevel === null ? '' : difficultyLevel
        fd.append('qb_difficulty_level_id', difficultyLevel)

        var skills = this.form.controls.skills.value
        skills = skills === null ? '' : skills
        fd.append('skill', skills)

        var timeInMinsToSolve = this.form.controls.timeInMinsToSolve.value
        timeInMinsToSolve = timeInMinsToSolve == null ? '' : timeInMinsToSolve
        fd.append('average_minutes', timeInMinsToSolve)

        fd.append("user_id", this.userIdentity.userId)

        this.backendService.addOrUpdateQuestion(fd).toPromise().then(
          (result: string) => {
            var question_id = JSON.parse(result)
            if (nextAction == "Return") {
              this.snackBar.showSuccessMsg('Question updated !');
              this.updationDone.emit(this.question4Edit);
              this.submitBtnLabel = "Save & Return"
              //this.form.controls.qtype.enable();
              this.filter.enableControl('qtype');
              this.question4Edit = null
              this.resetForm()
            }
            else {
              this.snackBar.showSuccessMsg("New question created !");
              var excludedFields = ['grade', 'subject', 'chapter', 'topic']
              this.resetForm(excludedFields)
            }
          }).catch((error:any) => {
                    console.log(error);
                }),
          (err: string) => {
            this.snackBar.showErrorMsg("Some problem occured creating question.");
          }
      } else {
        this.snackBar.showErrorMsg("Please save option");
      }
    }
  }

  downloadFile(file) {
    if (file.saved) {
      this.backendService
        .downloadAttachment("questionBank", file.info)
        .toPromise().then((data) => {
          downloadFile(data, file.file.name, true);
        }).catch((error:any) => {
                    console.log(error);
                });
    } else {
      downloadFile(file, file.file.name, false);
    }
  }


  onCancel() {
    if (this.answerOptions.data) {
      this.answerOptions.data.forEach(e => {
        if (e.optionEdit) {
          this.deleteAnswerOption(e)
        }
      })
    }
    this.resetForm();
    this.updationDone.emit(null);
    this.question4Edit = null;
    this.submitBtnLabel = "Save & Return";
    //this.form.controls.qtype.enable();
    this.filter.enableControl('qtype');
    this.filter.reset();
  }

  onReset() {
    this.resetForm();
    this.filter.reset();
  }

  // Checks Whether Any Option Is In Edit Mode.
  checkIsOptionInEdit() {
    if (this.selectedQtype == 1) {
      if (this.answerOptions.data.length > 0) {
        this.answerOptions.data.forEach(e => {
          if (e.optionEdit) {
            this.saveOption(e);
          }
        })
        let option: boolean = false;
        this.answerOptions.data.forEach(e => {
          if (e.optionEdit) {
            this.saveOption(e);
            if (e.optionText.length == 0 || e.optionEdit) {
              option = true;
            }
          }
        })
        if (option) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }

  }

  undoOption(data) {
    if (data.optionText.trim().length > 0) {
      this.optionText = data.optionText.trim();
    } else {
      this.optionText = '';
    }
  }
}
