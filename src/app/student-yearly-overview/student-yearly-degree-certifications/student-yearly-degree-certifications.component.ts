import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DegreeAndCertification } from '../../entities/degree-and-certification';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { BackendService } from '../../backend';
import { FrontendService } from '../../_services/frontend.service';

@Component({
  selector: 'app-student-yearly-degree-certifications',
  templateUrl: './student-yearly-degree-certifications.component.html',
  styleUrls: ['./student-yearly-degree-certifications.component.scss']
})
export class StudentYearlyDegreeCertificationsComponent implements OnInit {


  dataSource = new MatTableDataSource<DegreeAndCertification>();
  displayedColumns = 
    ['institute_name', 
    'course_name',
     'start_date', 
     'end_date', 
     'major_subject', 
     'result', 
     'degree_name'
     ];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private backendService: BackendService
    ) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  loadDegreeCertification(studentId)
  {
    this.reset();
    this.backendService.getStudentDegreeAndCertification(studentId)
    .toPromise()
    .then((data: string) => {
      this.dataSource.data = JSON.parse(data);
    })
    .catch((error:any) => {
                    console.log(error);
                })
  }

  reset()
  {
    this.dataSource.data = [];
  }
}
