import { MatSelect } from '@angular/material/select';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend';
import { Student } from '../entities';
import { ClassSearchComponent } from '../class-search';
import { Exam } from '../entities/exam';
import { SelectionModel } from '@angular/cdk/collections'
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FrontendService } from '../_services/frontend.service';
import { PdfgenerationService } from '../_services/pdf-generation.service';
import { CommonGradeDivisionComponent, CommonGradeDivisionConfiguration } from '../_components/common-grade-division/common-grade-division.component';

declare var Bokeh: any;

@Component({
    selector: 'app-grade-performance',
    templateUrl: './grade-performance.component.html',
    styleUrls: ['./grade-performance.component.scss']
})
export class GradePerformanceComponent implements OnInit {
    exams: Exam[] = [];
    exam_types: any[]
    exam_labels: any[]

    @ViewChild(ClassSearchComponent) classSearchChild: ClassSearchComponent;
    @ViewChild('exam_label') examLabel: MatSelect;
    @ViewChild('exam_type') examType: MatSelect;
    panelOpenState = false
    displayedColumns: string[] = ['srNo', 'regNo', 'firstName', 'lastName', 'percentage'];
    dataSource = new MatTableDataSource<Student>();
    selection = new SelectionModel<Student>(false, []);
    graphLoaded: boolean = false;
    userIdentity: any;
    userRole: any;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
    @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;

    constructor(private backendService: BackendService,
        private frontendService: FrontendService,
        public pdfservice: PdfgenerationService) {
        this.userIdentity = this.frontendService.getJWTUserIdentity();
        this.userRole = this.userIdentity.loginRoleName;
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this.graphLoaded = false;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Student>(false, []);

        if (this.userRole == 'Management')
        {
            this.config.isBypassAcl = true;
            this.config.isBypassAclShowAllYears = true;
        }
        this.config.isYearRequired = true;
        this.config.isGradeRequired = true;
        this.config.isMultiGrade = false;
        this.config.isDivisionRequired = true;
        this.config.isDivisionAutoSelect = true;
        this.config.isSubjectRequired = true;
        this.config.isMultiSubject = true;
        this.config.isSubjectCombined = true;
    }

    async onGradeSelection(values) {
        this.exam_types = []
        this.exam_labels = []

        this.setDefaultExamTypeAndExamLabel();

        await this.backendService.getGradeExamTypeAndExamLabel(this.userIdentity.clientId, values.year, values.grade).toPromise().then((data: string) => {
            this.exams = JSON.parse(data)
            this.exam_labels = this.exams.map(({ examLabel }) => examLabel);
            this.exam_types = this.exams.map(({ examType }) => examType);
            this.exam_labels = this.exam_labels.filter(this.onlyUnique);
            this.exam_types = this.exam_types.filter(this.onlyUnique);
        })
        .catch((error:any) => {
                    console.log(error);
                });
    }

    renderGraph() {
        if (!this.filter.validateForm()) return;
        this.cleanup_target();

        let filterValues = this.filter.value;
        let period = this.examLabel.value;
        let exam = this.examType.value;

        this.backendService.getGradePerformance(this.userIdentity.clientId, filterValues.year, filterValues.grade, filterValues.division, period, exam, filterValues.subject)
            .toPromise().then((data: string) => {
                data = JSON.parse(data)
                Bokeh.embed.embed_item(data, 'target')
                this.graphLoaded = true;
            }).catch((e) => {
                document.querySelector('section#target').innerHTML = e.error;
            })
    }

    cleanup_target() {
        this.graphLoaded = false;
        // this.dataSource.data = [];
        // this.paginator.pageIndex = 0;
        document.querySelector('section#target').innerHTML = "";
    }

    onPieSelection(event) {
        var detail = event.detail

        this.backendService.getGradeStudentsInPercentageRange(this.userIdentity.clientId, detail.year, detail.grade, detail.division,
            detail.period, detail.exam, detail.subjectId, detail.percentage_range).toPromise().then((data: string) => {
                this.dataSource.data = [];
                this.paginator.pageIndex = 0;
                this.dataSource.data = JSON.parse(data)
            }).catch((error:any) => {
                    console.log(error);
                })
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    setDefaultExamTypeAndExamLabel() {
        this.examLabel.value = 'Yearly';
        this.examType.value = 'all';
    }

    onDownload() {
        var canvas = document.getElementsByClassName("bk-canvas");
        this.pdfservice.downloadGraph(canvas, 2);
    }
}
