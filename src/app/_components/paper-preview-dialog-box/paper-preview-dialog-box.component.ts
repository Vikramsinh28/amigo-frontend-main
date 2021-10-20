import { Inject, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttachmentPreviewComponent } from 'src/app/_components/attachment-preview/attachment-preview.component';

@Component({
  selector: 'app-paper-preview-dialog-box',
  templateUrl: './paper-preview-dialog-box.component.html',
  styleUrls: ['./paper-preview-dialog-box.component.scss'],
})
export class PaperPreviewDialogBoxComponent implements OnInit {
  selectedTestPaperId: any;
  attachmentFileName: string;
  withAnswerKey: boolean;
  isFrozen: boolean;
  withMarks: boolean;
  grade: string;
  subject: string;
  totalmarks: string;
  @ViewChild(AttachmentPreviewComponent)
  attachmentPreview: AttachmentPreviewComponent;
  
  constructor(
    public dialogRef: MatDialogRef<PaperPreviewDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedTestPaperId = data.testPaperId;
    this.attachmentFileName = data.attachmentFileName;
    this.withAnswerKey = data.withAnswerKey;
    this.isFrozen = data.isFrozen;
    this.withMarks = data.withMarks;
    this.grade = data.grade;
    this.subject = data.subject;
    this.totalmarks = data.totalmarks;
  }

  ngOnInit(): void { }
}
