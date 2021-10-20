import { BehaviorSubject } from 'rxjs';
import { QuestionTypesData } from './../../entities/question-types';
import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlContainer, FormControl, FormGroup, NgForm, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { BackendService } from 'src/app/backend';
import { CommonService } from 'src/app/_helpers/common';


export class CommonGradeSubjectConfiguration {
  isGradeRequired: boolean = false
  isGradeDisabled: boolean = false;
  //-------------------------------
  isSubjectVisible: boolean = true
  isSubjectRequired: boolean = false
  isSubjectDisabled: boolean = false;
  isSubjectMultiple: boolean = false;
  isSubjectCombined: boolean = false;
  //------------------------------
  isChapterVisible: boolean = true
  isChapterRequired: boolean = false
  isChapterDisabled: boolean = false;
  //------------------------------
  isTopicVisible: boolean = true
  isTopicRequired: boolean = false
  isTopicDisabled: boolean = false;
  //------------------------------
  isQTypeVisible: boolean = true
  isQTypeRequired: boolean = false
  isQTypeDisabled: boolean = false;
}

@Component({
  selector: 'app-common-grade-subject',
  templateUrl: './common-grade-subject.component.html',
  styleUrls: ['./common-grade-subject.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonGradeSubjectComponent),
      multi: true,
    },
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonGradeSubjectComponent implements OnInit {

  onChange: Function = (value: any) => { };
  onTouched: Function = () => { };
  @Input() config: CommonGradeSubjectConfiguration;
  @Output() gradeSelectionChanged = new EventEmitter();
  @Output() subjectSelectionChanged = new EventEmitter();
  @Output() chapterSelectionChanged = new EventEmitter();
  @Output() topicSelectionChanged = new EventEmitter();
  @Output() qTypeSelectionChanged = new EventEmitter();
  @Input() filterType: string;

  clientGrades: any[] = [];
  clientSubjects: any[] = [];
  clientChapters: any[] = [];
  clientTopics: any[] = []
  clientQTypes: any[] = QuestionTypesData.qTypesData;
  clientQtypeIcon: string[];

  userIdentity: any;
  cachedGradeData: any[] = [];
  cachedChapterData: any[] = [];

  bsSubject = new BehaviorSubject(-1);


  controlForm: FormGroup;
  isGradeReady: boolean = false;

  assignedChapter: any;
  assignedTopic: any;
  assignedQType: any;

  constructor(
    private backendService: BackendService,
    private snackBar: CommonService
  ) { }

  ngOnInit(): void {
    if (!this.config) {
      this.config = new CommonGradeSubjectConfiguration();
    }
    this.createForm();
    this.loadGradeSubject();
    this.observeSubjectChanges();
  }

  loadGradeSubject() {
    this.backendService.getGradeSubject()
      .toPromise().then((result: any) => {
        this.clientGrades = result.map(o => ({ id: o.grade, name: o.grade }))
        this.cachedGradeData = result;
        this.isGradeReady = true;
      }).catch((error:any) => {
                    console.log(error);
                });
  }
  createForm() {
    this.controlForm = new FormGroup({});
    //Grade control
    if (this.config.isGradeRequired)
      this.controlForm.addControl('grade', new FormControl('', Validators.required));
    else
      this.controlForm.addControl('grade', new FormControl(''));

    if (this.config.isGradeDisabled)
      this.controlForm.controls.grade.disable({ onlySelf: true });

    //Subject control
    if (this.config.isSubjectVisible) {
      if (this.config.isSubjectRequired)
        this.controlForm.addControl('subject', new FormControl('', Validators.required));
      else
        this.controlForm.addControl('subject', new FormControl(''));

      if (this.config.isSubjectDisabled)
        this.controlForm.controls.division.disable({ onlySelf: true });
    }

    //Chapter control
    if (this.config.isChapterVisible) {
      if (this.config.isChapterRequired)
        this.controlForm.addControl('chapter', new FormControl('', Validators.required));
      else
        this.controlForm.addControl('chapter', new FormControl(''));

      if (this.config.isChapterDisabled)
        this.controlForm.controls.chapter.disable({ onlySelf: true });
    }

    //Topic Control
    if (this.config.isTopicVisible) {
      if (this.config.isTopicRequired)
        this.controlForm.addControl('topic', new FormControl('', Validators.required));
      else
        this.controlForm.addControl('topic', new FormControl(''));

      if (this.config.isTopicDisabled)
        this.controlForm.controls.topic.disable({ onlySelf: true });
    }

    //QType Control
    if (this.config.isQTypeVisible) {
      if (this.config.isQTypeRequired)
        this.controlForm.addControl('qtype', new FormControl('', Validators.required));
      else
        this.controlForm.addControl('qtype', new FormControl(''));

      if (this.config.isQTypeDisabled)
        this.controlForm.controls.qtype.disable({ onlySelf: true });
    }
  }

  observeSubjectChanges() {
    if (this.config.isChapterVisible) {
      this.bsSubject.subscribe((subVal: any) => {
        let selectedGrade = this.controlForm.controls.grade.value;
        if (subVal && (subVal != -1)) {
          this.backendService.getClientChapterTopics(selectedGrade, subVal)
            .toPromise().then(async (result: any) => {
              this.cachedChapterData = result;
              this.clientChapters = result.map(o => ({ id: o.chapterTopicId, name: o.topicName }));

              // This part typically works for control assignment (not for selection) - chapter
              if (this.assignedChapter) {
                await this.controlForm.controls.chapter.setValue(this.assignedChapter);
              }

              // This part typically works for control assignment (not for selection) - topic
              if (this.config.isTopicVisible && this.assignedChapter) {
                let chapter = this.cachedChapterData.filter((c) => { return c.chapterTopicId == this.assignedChapter });
                this.clientTopics = chapter[0]['topics'].map(t => ({ id: t.chapterTopicId, name: t.topicName }));
                if (this.assignedTopic) {
                  await this.controlForm.controls.topic.setValue(this.assignedTopic);
                }
              }

              if (this.config.isQTypeVisible && this.assignedQType) {
                await this.controlForm.controls.qtype.setValue(this.assignedQType);
                this.onQTypeSelected(this.assignedQType);
              }
              this.assignedChapter = ''
              this.assignedTopic = ''
              this.assignedQType = ''
            }).catch((error:any) => {
                    console.log(error);
                });
        }
      })
    }
  }
  onGradeSelected() {
    if (this.config.isSubjectVisible) {
      let selectedGrade = this.controlForm.controls.grade.value;
      this.controlForm.controls.subject.setValue('');
      this.clientSubjects = [];
      this.clientSubjects = this.cachedGradeData.filter(g => g.grade == selectedGrade)[0].subjects;
      let val = this.extractValues();
      this.onChange(val);
      this.onTouched();
      this.gradeSelectionChanged.emit(val);
    }
  }
  onSubjectSelected() {
    if (this.config.isChapterVisible) {
      this.clientChapters = [];
      this.clientTopics = [];
      this.controlForm.controls.chapter.setValue('');
      this.controlForm.controls.topic.setValue('');
      let selectedSubject = this.controlForm.controls.subject.value;
      this.bsSubject.next(selectedSubject);

    }
    let val = this.extractValues();
    this.onChange(val);
    this.onTouched();
    this.subjectSelectionChanged.emit(val);
  }
  onChapterSelected() {
    // This function is typically useful in the Selection (Not in assignment)
    if (this.config.isTopicVisible && !this.assignedChapter) {
      let selectedChapter = this.controlForm.controls.chapter.value;
      this.controlForm.controls.topic.setValue('');
      let chapter = this.cachedChapterData.filter((c) => { return c.chapterTopicId == selectedChapter });
      if (chapter) {
        this.clientTopics = chapter[0]['topics'].map(t => ({ id: t.chapterTopicId, name: t.topicName }));
      }

    }
    let val = this.extractValues();
    this.onChange(val);
    this.onTouched();
    this.chapterSelectionChanged.emit(val);
  }
  onTopicSelected() {
    let val = this.extractValues();
    this.onChange(val);
    this.onTouched();
    this.topicSelectionChanged.emit(val);
  }
  onQTypeSelected(qtype) {
    let value = this.extractValues()
    this.onChange(value);
    this.onTouched();
    this.qTypeSelectionChanged.emit(value);
  }

  writeValue(value) {
    this.assignValues(value);
  }

  get value() {
    return this.extractValues();
  }

  set value(value) {
    this.assignValues(value);
  }

  extractValues() {
    let gradeName, subjectName, chapterName, topicName, qTypeName;
    let selectedGrade = this.controlForm.controls.grade.value;
    gradeName = selectedGrade;

    let value: any = this.controlForm.value;

    value['gradeName'] = gradeName;
    value['grade'] = gradeName;

    if (this.config.isSubjectVisible) {
      let selectedSubject = this.controlForm.controls.subject.value;
      if (selectedSubject && this.clientSubjects.length > 0) {
        if (!this.config.isSubjectMultiple)
        {
          subjectName = this.clientSubjects.filter(s => s.id == selectedSubject)[0]['name'];
          value['subjectName'] = subjectName;
          value['subject'] = selectedSubject;
        }
        else
        {
          value['subjectName'] = '';
          value['subject'] = selectedSubject;
        }

      }
    }

    if (this.config.isChapterVisible) {
      let selectedChapter = this.controlForm.controls.chapter.value;
      if (selectedChapter && this.clientChapters.length > 0) {
        let chapternames = this.clientChapters.filter(s => s.id == selectedChapter);
        if (chapternames && chapternames.length > 0) {
          chapterName = chapternames[0]['name'];
          value['chapterName'] = chapterName;
          value['chapter'] = selectedChapter;
        }
      }
    }

    if (this.config.isTopicVisible) {
      let selectedTopic = this.controlForm.controls.topic.value;
      if (selectedTopic && this.clientTopics.length > 0) {
        let topicNames = this.clientTopics.filter(s => s.id == selectedTopic);
        if (topicNames && topicNames.length > 0) {
          topicName = topicNames[0]['name'];
          value['topicName'] = topicName;
          value['topic'] = selectedTopic;
        }
      }
    }

    if (this.config.isQTypeVisible) {
      let selectedQtype = this.controlForm.controls.qtype.value;
      if (selectedQtype) {
        qTypeName = this.clientQTypes.filter(s => s.id == selectedQtype)[0]['name'];
        value['qtype'] = selectedQtype;
        value['qTypeName'] = qTypeName;
      }
    }
    return value;
  }
  async assignValues(value) {
    if (value && this.isGradeReady) {
      if (value.grade) {
        this.controlForm.controls.grade.setValue(value.grade);
        this.onGradeSelected();
      }
      if (value.subject) {
        this.assignedChapter = value.chapter
        this.assignedTopic = value.topic
        this.assignedQType = value.qtype
        await this.controlForm.controls.subject.setValue(value.subject);
        this.onSubjectSelected();
      }
    }
    else {
      setTimeout(() => { this.assignValues(value); }, 500);
    }
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  validateForm(): boolean {
    Object.keys(this.controlForm.controls).forEach((key) => {
      this.controlForm.get(key).updateValueAndValidity();
      if (!this.controlForm.get(key).valid) {
        this.controlForm.get(key).markAllAsTouched();
      }
    });
    return this.controlForm.valid
  }

  reset() {
    this.controlForm.reset();
    this.resetVariables();
  }

  resetControl(key)
  {
    this.controlForm.controls[key].reset();
  }

  disableControl(key) {
    this.controlForm.controls[key].disable();
  }

  enableControl(key) {
    this.controlForm.controls[key].enable();
  }

  disableAllControls()
  {
    this.controlForm.disable()
  }

  enableAllControls()
  {
    this.controlForm.enable()
  }

  resetVariables() {
    //this.clientGrades = [];
    this.clientSubjects = [];
    this.clientChapters = [];
    this.clientTopics = [];
    //this.clientQTypes = [];
  }
}
