import { downloadFile } from 'src/app/_helpers/common';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { AccomplishmentComponent } from './accomplishment.component'
import { BackendService } from '../backend';
import { FrontendService } from '../_services/frontend.service';
import { Accomplishment, MODE_AP, MONTHS } from '../entities'
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-accomplishment-list',
    templateUrl: './accomplishment-list.component.html',
    styleUrls: ['./accomplishment-list.component.scss'],
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
export class AccomplishmentListComponent implements OnInit {

    @Input('mode') mode : MODE_AP = MODE_AP.STUDENT;
    @Input('studentId') studentId : number;
    m : typeof MODE_AP = MODE_AP
    dataSource = new MatTableDataSource<Accomplishment>();
    displayedColumns: string[];
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    idx_month_map: Map<number, string> = new Map();
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    expandedAccomplishment: Accomplishment | null;

    constructor(public dialog: MatDialog, private backendService: BackendService, private activatedRoute: ActivatedRoute,
        private frontendService: FrontendService) {
        var idx = 0
        MONTHS.forEach(month => {
            this.idx_month_map.set(idx, month)
            idx += 1
        });
     }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.activatedRoute.paramMap.subscribe(paramMap => {
            var type = paramMap.get('type');
            if (type == null || type == 'student') {
                switch (this.mode) {
                    case MODE_AP.STUDENT: {
                        this.displayedColumns = ['type', 'year', 'month', 'level', 'title', 'edit', 'delete', 'expand_icon'];
                        break;
                    }
                    case MODE_AP.STUDENT_PROFILE: {
                        this.displayedColumns = ['type', 'year', 'month', 'level', 'title', 'expand_icon'];
                        break;
                    }
                }
            } else {
                this.displayedColumns = ['type', 'regNo', 'name', 'year', 'month', 'level', 'title', 'expand_icon'];
                this.mode = MODE_AP.TEACHER
            }
            this.reloadTable()
        });
    }

    ngOnChanges() {
        this.reloadTable()
    }

    addAccomplishment(): void {
        const dialogRef = this.dialog.open(AccomplishmentComponent, {
            data: null
        });

        dialogRef.afterClosed().subscribe(result => {
            this.reloadTable()
        });
    }

    editAccomplishment(accomplishment: Accomplishment): void {
        this.backendService.getAccomplishment(accomplishment.accomplishmentId).toPromise().then((result: string) => {

            var accomplishment: Accomplishment = JSON.parse(result)
            const dialogRef = this.dialog.open(AccomplishmentComponent, {
                data: accomplishment
            });

            dialogRef.afterClosed().subscribe(result => {
                this.reloadTable()
            });

        }).catch((error:any) => {
                    console.log(error);
                });
    }

    deleteAccomplishment(accomplishment: Accomplishment): void {
        this.backendService.removeAccomplishment(accomplishment.accomplishmentId).toPromise().then(
            result => {
                this.reloadTable()
            }).catch((error:any) => {
                    console.log(error);
                }
        )
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    reloadTable() {
        var studentId = null
        var userIdentity = this.frontendService.getJWTUserIdentity()
        switch (this.mode) {
            case MODE_AP.STUDENT:
            case MODE_AP.STUDENT_PROFILE: {
                studentId = this.studentId ? this.studentId : userIdentity.studentId
                break;
            }
        }
        this.backendService.getAccomplishments(studentId, userIdentity.clientId).toPromise().then((data: string) => {
            this.dataSource.data = JSON.parse(data);
        }).catch((error:any) => {
                    console.log(error);
                })
    }

    downloadFile(document) {
        this.backendService
            .downloadAttachment("accomplishment", document["accomplishment_document_id"])
            .toPromise().then((data) => {
                downloadFile(data, document["file_name"], true);
            }).catch((error: any) => {
                console.log(error);
            });
    }
}