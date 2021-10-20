import { downloadFile } from 'src/app/_helpers/common';
import { FormControl, Validator, Validators } from '@angular/forms';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FrontendService } from 'src/app/_services/frontend.service';
import { BackendService } from 'src/app/backend';
import { FileAttachment } from 'src/app/_components/file-upload/file-upload/file-upload.component';

@Component({
  selector: 'app-communication-content',
  templateUrl: './communication-content.component.html',
  styleUrls: ['./communication-content.component.scss']
})
export class CommunicationContentComponent implements OnInit {

  commContentForm: FormGroup;

  @Input() communicationType: String;

  @Input() contentLabel = "Homework Detail"

  testPapers = []
  dateLabel = "Due Date"
  minDate :any;
  maxDate :any;
  attachmentFile: FileAttachment[] = [];
  userIdentity: any;

  constructor(
    private frontendService: FrontendService,
    private backendService: BackendService) { }

  ngOnInit(): void
  {
    this.commContentForm = new FormGroup({
      headline: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
      isImportant: new FormControl(''),
      shareWithStudents: new FormControl(''),
      worksheet: new FormControl(''),
      dueImpDate: new FormControl(''),
      attachment: new FormControl(''),
      remarkType:  new FormControl(''),
    });

    if (this.communicationType == 'UEvent')
    {
      this.dateLabel = "Event Date"
      this.contentLabel = "Event Detail"
      this.commContentForm.controls.dueImpDate.setValidators(Validators.required);
    }
    else if (this.communicationType == "Notice")
    {
      this.contentLabel = "Notice Detail"
    }
    else if (this.communicationType == "Remark")
    {
      this.contentLabel = "Remark Detail";
      this.commContentForm.controls.remarkType.setValidators(Validators.required);
      this.commContentForm.controls.remarkType.setValue('0');
    }

    this.setMinMaxDate(new Date());
    this.userIdentity = this.frontendService.getJWTUserIdentity();
  }

  setMinMaxDate(minValDate)
  {
    this.minDate = new Date(minValDate) < new Date() ? new Date(minValDate) : new Date();
    this.maxDate = new Date(
      this.minDate.getFullYear() + 1,
      this.minDate.getMonth(),
      this.minDate.getDate()
    );
  }
  validateForm() : boolean
  {
    Object.keys(this.commContentForm.controls).forEach((key) => {
      this.commContentForm.get(key).updateValueAndValidity();
      if (!this.commContentForm.get(key).valid)
      {
        this.commContentForm.get(key).markAllAsTouched();
      }
    });
    return this.commContentForm.valid
  }

  fillTestPaper(data) {
    this.backendService
      .getClientTestPaper(
        this.userIdentity.clientId,
        data.grade,
        data.subject
      )
      .toPromise()
      .then((result: any) => {
        this.testPapers = result;
      }).catch((error:any) => {
                    console.log(error);
                });
  }

  clearDate(event){
    event.stopPropagation();
    this.commContentForm.controls.dueImpDate.setValue(null);
  }

  downloadFile(file){
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

  get value()
  {
    return this.commContentForm.value;
  }
  set value(value)
  {
    this.assignValues(value);
  }
  assignValues(value)
  {
    if (value.headline)
      this.commContentForm.controls.headline.setValue(value.headline);

    if (value.message)
      this.commContentForm.controls.message.setValue(value.message);

    if (value.isImportant)
      this.commContentForm.controls.isImportant.setValue(value.isImportant);

    if (value.shareWithStudents)
      this.commContentForm.controls.shareWithStudents.setValue(value.shareWithStudents);

    if (value.worksheet)
      this.commContentForm.controls.worksheet.setValue(value.worksheet);

    if (value.dueImpDate)
      this.setMinMaxDate(value.dueImpDate);
      this.commContentForm.controls.dueImpDate.setValue(value.dueImpDate);

    if (value.attachment)
    {
      let attach: FileAttachment = {};
      attach.file = new File([''], value.attachment);
      attach.delete = false;
      attach.saved = true;
      this.attachmentFile.push(attach);
      this.commContentForm.controls.attachment.setValue(this.attachmentFile);
    }

    if (String(value.remarkType))
    {
      this.commContentForm.controls.remarkType.setValue(String(value.remarkType));
    }
  }

  reset()
  {
    this.commContentForm.reset();
    this.commContentForm.controls.remarkType.setValue('0');
    this.attachmentFile = [];
    this.testPapers = []
  }
}
