import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DegreeAndCertification } from '../entities/degree-and-certification';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { BackendService } from '../backend';
import { FrontendService } from '../_services/frontend.service';

@Component({
  selector: 'app-degree-and-certification',
  templateUrl: './degree-and-certification.component.html',
  styleUrls: ['./degree-and-certification.component.scss']
})
export class DegreeAndCertificationComponent implements OnInit {

  @Input('studentId') studentId : number;
  dataSource = new MatTableDataSource<DegreeAndCertification>();
  tableData: DegreeAndCertification[];
  displayedColumns: string[];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private backendService: BackendService, private frontendService: FrontendService) { }

  ngOnInit(): void {
    //this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.displayedColumns = ['institute_name', 'course_name', 'start_date', 'end_date', 'major_subject', 'result', 'degree_name'];
    this.loadTable();
  }

  ngOnChanges() {
    this.loadTable()
  }

  loadTable()
  {
    var userIdentity = this.frontendService.getJWTUserIdentity();
    let studentId = this.studentId ? this.studentId : userIdentity.studentId
    this.backendService.getStudentDegreeAndCertification(studentId).toPromise().then((data: string) => {
      this.tableData = JSON.parse(data);
      this.dataSource.data = this.tableData;
  }).catch((error:any) => {
                    console.log(error);
                })
  }

}
