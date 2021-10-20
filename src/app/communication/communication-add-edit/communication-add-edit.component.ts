import { CommonGradeDivisionComponent } from './../../_components/common-grade-division/common-grade-division.component';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommunicationContentComponent } from '../communication-content/communication-content.component';
import { formatDate } from '@angular/common';
import { BackendService } from 'src/app/backend';
import { CommonService } from 'src/app/_helpers/common';

@Component({
  selector: 'app-communication-add-edit',
  templateUrl: './communication-add-edit.component.html',
  styleUrls: ['./communication-add-edit.component.scss']
})
export class CommunicationAddEditComponent implements OnInit {

  @Input() communicationType = ""
  @Input() filterConfig: CommonGradeDivisionComponent;
  submitBtnLabel = "Save & Return";
  isForEdit: boolean = false;
  editData: any;
  @ViewChild(CommonGradeDivisionComponent) filters : CommonGradeDivisionComponent;
  @ViewChild(CommunicationContentComponent) content: CommunicationContentComponent
  @Output() updationDone = new EventEmitter()

  constructor(
    private snackBar: CommonService,
    private backendService: BackendService) { }

  ngOnInit(): void {
  }

  onCancel(tag) {
    this.filters.reset()
    this.content.reset()
    this.isForEdit = false;
    this.editData = ''
    if(tag == 'Return')
    {
      this.updationDone.emit();
    }
  }

  onCommunicationEdit(data)
  {
    this.isForEdit = true;
    this.submitBtnLabel = "Update";
    this.editData = data;

    let filterData =
    {
      year: data.clientYearId,
      grade: data.gradeId ? data.gradeId : '',
      division: data.gradeDivisionId ? data.gradeDivisionId : '',
      subject: data.subjectId ? data.subjectId : '',
      student: data.studentGradeId ? data.studentGradeId : ''
    }

    let contentData =
    {
      headline: data.headline,
      message: data.communicationText,
      isImportant: data.isImportant,
      shareWithStudents: data.sharedDate ? true : false,
      worksheet: data.attachedPaperId,
      dueImpDate: data.dueDate,
      attachment: data.attachmentFileName,
      remarkType: data.remarkType ? data.remarkType : ''
    }
    this.filters.value = filterData;
    this.content.value = contentData;
  }

  saveCommunicationDetails(nextAction)
  {
    let isFiltersValid =  this.filters.validateForm();
    let isContentValid = this.content.validateForm();

    if ( isFiltersValid && isContentValid)
    {
      let filterData = this.filters.value;
      let contentData = this.content.value

      const fd = new FormData();

      if (this.isForEdit)
      {
        fd.set('communicationId', this.editData.communicationId);
      }

      fd.set('type', this.communicationType);
      fd.set('isImportant', (contentData.isImportant === true) ? '1' : '0');
      fd.set('headline', contentData.headline);
      fd.set('communicationText', contentData.message);
      if (contentData.dueImpDate) {
        fd.set('dueDate', formatDate(contentData.dueImpDate, 'yyyy-MM-dd', 'en-US'));
      } else {
        fd.set('dueDate', "null");
      }

      if (contentData.attachment)
      {
        if (contentData.attachment[0].delete == true)
        {
          fd.set('attachmentDeleteStatus', contentData.attachment[0].delete);
        }
        else
        {
          fd.set('attachment', contentData.attachment[0].file);
          fd.set('attachmentFileName', contentData.attachment[0].file.name);
          fd.set('attachmentDeleteStatus', contentData.attachment[0].delete);
        }
      }

      fd.set('isShared', contentData.shareWithStudents === true ? '1' : '0');

      if (contentData.worksheet)
      {
        fd.append('attachedPaperId', contentData.worksheet);
      } else {
        fd.append('attachedPaperId', "null");
      }

      if (contentData.remarkType)
        fd.append('remarkType', contentData.remarkType);

      if (filterData.subject) {
        fd.set('subjectId', filterData.subject)
      }

      if (this.isForEdit)
      {
        if (filterData.division)
          fd.set('deleteGradeDivisionIdCsv', this.editData.gradeDivisionId);

        if (filterData.student)
          fd.set('deleteStudentGradeIdCsv', this.editData.studentGradeId);
      }

      if (filterData.division)
        fd.set('gradeDivisionIdCsv', filterData.division);

      if (filterData.student)
        fd.set('studentGradeIdCsv', filterData.student);

      if (this.isForEdit)
      {
        this.backendService.putCommunication(fd).toPromise().then(
          () => {
            this.showSuccessMsg("Communication updated successfully");
            this.onCancel(nextAction);
          }).catch((error: any) => {
            this.showErrorMsg(error.error);
          });
      }
      else
      {
        this.backendService.postCommunication(fd).toPromise().then(
          () => {
            this.showSuccessMsg( "Communication created sucessfully");
            this.onCancel(nextAction);
          }).catch( (error: any) => {
            this.showErrorMsg(error.error);
          });
      }

    }
  }

  filterSubjectChanged(event)
  {
      this.content.fillTestPaper(event);
  }

  showErrorMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  showSuccessMsg(msg) {
    this.snackBar.showSuccessMsg(msg);
  }

}
