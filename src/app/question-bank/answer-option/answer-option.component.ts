import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-answer-option',
  templateUrl: './answer-option.component.html',
  styleUrls: ['./answer-option.component.scss']
})
export class AnswerOptionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AnswerOptionComponent>,
    @Inject(MAT_DIALOG_DATA) public optionText: string) { }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.optionText) {
      this.dialogRef.close(this.optionText);
    } else {
      this.dialogRef.close()
    }
  }
}
