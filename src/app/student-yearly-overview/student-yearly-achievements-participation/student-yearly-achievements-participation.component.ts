import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FrontendService } from 'src/app/_services/frontend.service';
import { BackendService } from 'src/app/backend';
import { MatTableDataSource } from '@angular/material/table';
import { Test, Student, Accomplishment } from 'src/app/entities';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-student-yearly-achievements-participation',
  templateUrl: './student-yearly-achievements-participation.component.html',
  styleUrls: ['./student-yearly-achievements-participation.component.scss'],
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


export class StudentYearlyAchievementsParticipationComponent implements OnInit {

  dataSource = new MatTableDataSource<Accomplishment>();
  displayedColumns: string[] = [
    'type',
    'year',
    'month',
    'level',
    'title',
    'expand_icon'
  ];

  expandedAccomplishment: Accomplishment | null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
  ) {}

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadAccomplishments(studentId, clientYearId) {
    this.reset();
    this.backendService
      .getYearlyStudentAccomplishments(studentId, clientYearId)
      .toPromise()
      .then((result: any) => {
        this.dataSource.data = result;
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  reset() {
    this.dataSource.data = [];
  }

}
