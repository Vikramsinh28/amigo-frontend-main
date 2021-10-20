import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {ClientManagementAddEditComponent} from '../client-management-add-edit/client-management-add-edit.component';

export interface PeriodicElement {
  clientID: number;
  clientName: string;
  displayName: string;
  createDate: string;
  updatedDate: string;
  active: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {clientID: 1, clientName: 'Abc High School', displayName: 'ABC', createDate: '14-09-2020', updatedDate: '14-09-2020', active:'No'},
  {clientID: 2, clientName: 'XYZ International School', displayName: 'XYZ', createDate: '14-09-2020', updatedDate: '14-09-2020', active:'Yes'},
];

@Component({
  selector: 'app-client-management-list',
  templateUrl: './client-management-list.component.html',
  styleUrls: ['./client-management-list.component.scss']
})
export class ClientManagementListComponent implements AfterViewInit {

  displayedColumns: string[] = ['clientID', 'clientName', 'displayName', 'clientLogo', 'createDate', 'updatedDate', 'active', 'edit', 'delete'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog) {}
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
   }

   clientManagementAddEdit() {
    const dialogRef = this.dialog.open(ClientManagementAddEditComponent);

    dialogRef.afterClosed().subscribe(result => {
      //
    });
  }

}
