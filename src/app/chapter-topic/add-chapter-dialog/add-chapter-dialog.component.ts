import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export class DialogData {

  title: string;
  isChapterOrTopic: string;
  component: string;
  topicName: string;

}


@Component({
  selector: 'app-add-chapter-dialog',
  templateUrl: './add-chapter-dialog.component.html',
  styleUrls: ['./add-chapter-dialog.component.scss']
})
export class AddChapterDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AddChapterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  

  onNoClick(): void {
    this.dialogRef.close();
  }

}
