import { OnInit } from '@angular/core';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { YearsTermsAddEditComponent } from './../years-terms-add-edit/years-terms-add-edit.component';

export interface PeriodicElement {
  year?: string;
  termName?: string;
  startDate?: Date;
  endDate?: Date;
  minEndDate?: Date;
  maxEndDate?: Date;
}

@Component({
  selector: 'app-years-terms-list',
  templateUrl: './years-terms-list.component.html',
  styleUrls: ['./years-terms-list.component.scss'],
})
export class YearsTermsListComponent implements OnInit, AfterViewInit {
  ELEMENT_DATA: PeriodicElement[] = [
    {
      year: '2018-19',
      termName: 'Term-1',
      startDate: new Date(2020, 10, 11),
      endDate: new Date(2020, 10, 21),
    },
    {
      year: '2019-20',
      termName: 'Term-2',
      startDate: new Date(2020, 11, 11),
      endDate: new Date(2020, 11, 21),
    },
  ];

  displayedColumns: string[] = [
    'year',
    'termName',
    'startDate',
    'endDate',
    'save',
    'delete',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);
  yearList = ['2018-19', '2019-20'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  startDateMinDate: Date;
  startDateMaxDate: Date;
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.startDateMinDate = new Date();
    var currentYear = this.startDateMinDate.getFullYear() + 1;
    this.startDateMaxDate = new Date(
      currentYear,
      this.startDateMinDate.getMonth(),
      this.startDateMinDate.getDate()
    );
    this.ELEMENT_DATA.forEach((data) => {
      data.minEndDate = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate() + 1
      );
      data.maxEndDate = new Date(
        data.startDate.getFullYear() + 2,
        data.startDate.getMonth(),
        data.startDate.getDate()
      );
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  yearTermAddEdit() {
    const dialogRef = this.dialog.open(YearsTermsAddEditComponent);

    dialogRef.afterClosed().subscribe((result) => {
      // To be reviewed
    });
  }

  onFocusOutEvent(event: any) {
    // To be reviewed
  }

  addRow() {
    let p: PeriodicElement = {};
    this.ELEMENT_DATA.push(p);
    this.dataSource.data = this.ELEMENT_DATA;
  }

  delete(index,element) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: true,
      data: {title:'Confirm',message:'Are you sure you want to delete \''+element.termName+'\' ?',yes:'Delete',no:'Cancel'}
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

  onStartDateChange(startDate, rowNo) {
    this.ELEMENT_DATA[rowNo].endDate = null;
    this.ELEMENT_DATA[rowNo].startDate = new Date(
      startDate.value._i.year,
      startDate.value._i.month,
      startDate.value._i.date
    );
    this.ELEMENT_DATA[rowNo].minEndDate = new Date(
      startDate.value._i.year,
      startDate.value._i.month,
      startDate.value._i.date + 1
    );
    this.ELEMENT_DATA[rowNo].maxEndDate = new Date(
      startDate.value._i.year + 2,
      startDate.value._i.month,
      startDate.value._i.date
    );
  }
  onEndDateChange(endDate, rowNo) {
    this.ELEMENT_DATA[rowNo].endDate = new Date(
      endDate.value._i.year,
      endDate.value._i.month,
      endDate.value._i.date
    );
  }
}
