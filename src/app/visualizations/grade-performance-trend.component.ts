import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend';
import {
    CommonGradeSubjectComponent,
    CommonGradeSubjectConfiguration,
} from '../_components/common-grade-subject/common-grade-subject.component';
import { FrontendService } from '../_services/frontend.service';
import { PdfgenerationService } from '../_services/pdf-generation.service';

declare var Bokeh: any;
@Component({
    selector: 'app-student-performance',
    templateUrl: './grade-performance-trend.component.html',
    styleUrls: ['./grade-performance-trend.component.scss'],
})
export class GradePerformanceTrendComponent implements OnInit {
    type: string;
    panelOpenState = false;
    userRole: string;
    loading: boolean = false;
    clientId: number;
    config: CommonGradeSubjectConfiguration =
        new CommonGradeSubjectConfiguration();
    @ViewChild(CommonGradeSubjectComponent) filter: CommonGradeSubjectComponent;
    graphLoaded: boolean = false;

    constructor(
        public router: Router,
        private backendService: BackendService,
        private frontendService: FrontendService,
        public pdfservice: PdfgenerationService
    ) { }

    ngOnInit() {
        this.config.isGradeRequired = true;
        this.config.isSubjectVisible = true;
        this.config.isSubjectRequired = true;
        this.config.isSubjectMultiple = true;
        this.config.isSubjectCombined = true;
        this.config.isChapterVisible = false;
        this.config.isTopicVisible = false;
        this.config.isQTypeVisible = false;

        this.cleanup_target();

        var userIdentity = this.frontendService.getJWTUserIdentity();
        this.clientId = userIdentity.clientId;
    }

    renderGraph() {
        if (!this.filter.validateForm()) return;

        this.cleanup_target();
        this.loading = true;
        this.graphLoaded = false;

        let filterValue = this.filter.value;
        let subs = filterValue.subject;
        let id = filterValue.grade;
        this.backendService
            .getGradePerformaceTrend(this.clientId, id, subs)
            .toPromise()
            .then((data: string) => {
                data = JSON.parse(data);
                Bokeh.embed.embed_item(data, 'target');
                this.loading = false;
                this.graphLoaded = true;
            })
            .catch((err: any) => {
                document.querySelector('section#target').innerHTML =
                    'Sorry, no records are available.';
                this.loading = false;
            });
    }

    cleanup_target() {
        document.querySelector('section#target').innerHTML = '';
    }

    onDownload() {
        var canvas = document.getElementsByClassName('bk-canvas');
        this.pdfservice.downloadGraph(canvas, 1.5);
    }
}
