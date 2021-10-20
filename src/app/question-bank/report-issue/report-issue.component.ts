import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-report-issue',
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.scss']
})
export class ReportIssueComponent implements OnInit {

  report: string = '';

  constructor(public dialogRef: MatDialogRef<ReportIssueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  onClick(send): void {
    if(send)
    {
      this.dialogRef.close({data: this.report});
    }
    else{
      this.dialogRef.close();
    }
    
  }

}
