import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/backend';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Communication } from 'src/app/entities/communication';

@Component({
  selector: 'app-student-yearly-remarks',
  templateUrl: './student-yearly-remarks.component.html',
  styleUrls: ['./student-yearly-remarks.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})

export class StudentYearlyRemarksComponent implements OnInit {
  
  remarkDataSource = new MatTableDataSource<Communication>();
  expandedNotice: Communication | null;
  dateFormat: string;

  remarkColumnsToDisplay = [
        'isImportant',
        'Shared Date',
        'Remark Type',
        'Headline',
        'isShared',
        'expand_icon',
      ];


  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService
    ) { }

  ngOnInit(): void {
  }


  loadRemarks(studentGradeId,clientYearId)
  {
    this.reset();
    this.backendService
      .getYearlyStudentRemarks(studentGradeId, clientYearId)
      .toPromise()
      .then((result: any) => {
        this.remarkDataSource.data=result;
      })
      .catch((error: any) => {
        console.log(error);
     });
  }
  reset()
  {
    this.remarkDataSource.data=[];
  }

}
