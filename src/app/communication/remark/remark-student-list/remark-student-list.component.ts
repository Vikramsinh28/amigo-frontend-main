import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/backend';


export interface StudentDetail {
  rollNo: any;
  firstName: any;
  lastName: any;
}

@Component({
  selector: 'app-remark-student-list',
  templateUrl: './remark-student-list.component.html',
  styleUrls: ['./remark-student-list.component.scss']
})
export class RemarkStudentListComponent implements OnInit {

  studentDetailDataSource = new MatTableDataSource<StudentDetail>()
  studentDetail: StudentDetail[];
  communicationId: any;
  columnsToDisplay: String[] = ['rollNo', 'firstName', 'lastName'];

  constructor(
    public dialogRef: MatDialogRef<RemarkStudentListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private backendService: BackendService
  )
  {
    this.communicationId = data.communicationId;
  }

  ngOnInit(): void {
    this.backendService.getCommunicationStudentDetail(this.communicationId).toPromise().then((result: any) => {
      this.studentDetail = result;
      this.studentDetailDataSource.data = this.studentDetail;
    })
    .catch((error:any) => {
                    console.log(error);
                })
  }

}
