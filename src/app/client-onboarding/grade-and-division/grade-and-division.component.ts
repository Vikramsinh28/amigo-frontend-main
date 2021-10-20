import { Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';


export interface PeriodicElement {
  grade ?: string;
  division ?: string;
}

@Component({
  selector: 'app-grade-and-division',
  templateUrl: './grade-and-division.component.html',
  styleUrls: ['./grade-and-division.component.scss']
})
export class GradeAndDivisionComponent implements OnInit {
 ELEMENT_DATA: PeriodicElement[] = [
    {grade: '9th', division: 'A'},
    {grade: '5th', division: 'B'},
  ];

  displayedColumns: string[] = ['grade', 'division', 'save', 'delete'];
  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog) {}
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
   }

  onFocusOutEvent(event: any) {

  }

  addRow() {
    let p: PeriodicElement = {};
    this.ELEMENT_DATA.push(p);
    this.dataSource.data = this.ELEMENT_DATA;
  }

  delete(elm) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: true,
      data: {title:'Confirm',message:'Are you sure you want to delete ?',yes:'Delete',no:'Cancel'}
    });
    dialogRef.afterClosed().subscribe(result=>{
      if(result){
        this.dataSource.data = this.dataSource.data
      .filter((i) => i !== elm)
      }
    })
  }
}
