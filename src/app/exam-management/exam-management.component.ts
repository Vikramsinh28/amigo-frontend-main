import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

export interface PeriodicElement {
  term ?: string;
  grade?: string;
  examName ?: string;
  subject ?: string;
  examMethod ?: string;
  totalMarks ?: number;
  examDate ?: string;
}


@Component({
  selector: 'app-exam-management',
  templateUrl: './exam-management.component.html',
  styleUrls: ['./exam-management.component.scss']
})
export class ExamManagementComponent implements AfterViewInit {

  ELEMENT_DATA: PeriodicElement[] = [
    {term: 'Term-1', grade:'8', examName: 'Exam Name', subject:'Science', examMethod:'Theory', totalMarks:80, examDate: '28-10-2020'},
    {term: 'Term-2', grade:'9', examName: 'Exam Name', subject:'English', examMethod:'Practical', totalMarks:100, examDate: '28-10-2020'},
  ];

  displayedColumns: string[] = ['term', 'grade', 'examName', 'subject', 'examMethod', 'totalMarks', 'examDate', 'edit', 'delete'];
  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);
  termList = ['Term-1', 'Term-2'];
  gradeList = ['8', '9', '10'];
  subjectList= ['Science', 'English', 'Maths'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog) {}
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
   }

   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onFocusOutEvent(event: any) {
    // to be reviewed
  }

  addRow() {
    let p: PeriodicElement = {};
    this.ELEMENT_DATA.push(p);
    this.dataSource.data = this.ELEMENT_DATA;
  }

  delete(index, element) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: true,
      data: {title:'Confirm',message:'Are you sure you want to delete \''+element.examName+'\' ?',yes:'Delete',no:'Cancel'}
    });
    dialogRef.afterClosed().subscribe(result=>{
      if(result){
        let AllRecords = this.ELEMENT_DATA;
        AllRecords.splice(index, 1);
        this.dataSource.data = AllRecords;
        this.ELEMENT_DATA = AllRecords;
      }
    })
  }

}
