import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend';
import { Student } from '../entities/student';
import { Subject } from '../entities';
import { COMBINED_SUBJECT } from '../entities';
import { StudentSearchComponent } from '../student-search';
import { Exam } from '../entities/exam';
import { FrontendService } from '../_services/frontend.service';
import { PdfgenerationService } from '../_services/pdf-generation.service';

declare var Bokeh: any;

@Component({
    selector: 'app-student-performance',
    templateUrl: './student-performance.component.html',
    styleUrls: ['./student-performance.component.scss']
})
export class StudentPerformanceComponent implements OnInit {
    type: string;
    form: FormGroup;
    subjects: Subject[] = [];
    selectedSubjects: FormControl = new FormControl();
    selectedStudent: Student = null;
    @ViewChild(StudentSearchComponent) studentSearchChild: StudentSearchComponent;
    panelOpenState = false
    userRole: string;
    loading: boolean = false
    graphLoaded: boolean = false;
    exams: Exam[] = [];
    exam_types: any[]
    exam_terms: any[]
    selectedExamType: string = 'all';
    selectedExamTerm: string = 'Yearly';
    userIdentity: any;

    constructor(private formBuilder: FormBuilder,
        public router: Router,
        private backendService: BackendService,
        private activatedRoute: ActivatedRoute,
        private frontendService: FrontendService,
        public pdfservice: PdfgenerationService) {
        this.userIdentity = this.frontendService.getJWTUserIdentity();
        this.userRole = this.userIdentity.loginRoleName;
    }

    ngOnInit() {
        this.graphLoaded = false;
        this.activatedRoute.paramMap.subscribe(paramMap => {
            this.cleanup_target()
            this.subjects = null
            this.selectedStudent = null
            this.form = this.formBuilder.group({
                period: ['Yearly',],
                exam: ['all',],
                selectedSubjects: [,]
            });
            this.type = paramMap.get('type');
            if (this.studentSearchChild)
                this.studentSearchChild.ngOnInit();

            this.userRole = this.userIdentity.loginRoleName
            if (this.userRole == 'Student') {
                var student: Student = {
                    studentId: this.userIdentity.studentId,
                    studentGradeId: this.userIdentity.studentGradeId,
                    firstName: this.userIdentity.firstName,
                    lastName: this.userIdentity.lastName
                }
                this.onStudentSelection(student)

            }
        });
        // load Exam Types and Terms on load as they are static
        this.loadExamTerms();
        this.loadExamTypes();
    }

    onStudentSelection(event) {
        let student;
        if (this.userRole == 'Student')
            student = event;
        else student = event.student;

        this.selectedStudent = null;
        this.selectedSubjects = null;
        if (student) {
            var id: number
            var entity: string
            if (this.type == 'yearly') {
                id = student.studentId
                entity = 'student'
            } else if (this.type == 'termly') {
                id = student.studentGradeId
                entity = 'studentGrade'
            } else if (this.type == 'percentile') {
                id = student.studentId
                entity = 'student'
            }


            if (this.userIdentity.loginRoleName == 'Student') {
                this.backendService.getStudentSubjects(id, entity).toPromise().then((data: string) => {
                    this.subjects = JSON.parse(data)
                    this.subjects = [COMBINED_SUBJECT].concat(this.subjects)
                    this.selectedSubjects = new FormControl(this.subjects)
                    this.selectedSubjects.setValue(this.subjects.slice(0, 1))
                    this.selectedExamTerm = 'Yearly'
                    this.selectedExamType = 'all'
                    this.renderGraph(student)
                },(error:any) => {
                    console.log(error);
                })
            }
            else {
                let subjects: any[] = event.subjects
                subjects = subjects.map((s) => { return { 'subjectId': s.id, 'subjectName': s.name, 'selected': false }; })
                this.subjects = subjects;
                this.subjects = [COMBINED_SUBJECT].concat(this.subjects)
                this.selectedSubjects = new FormControl(this.subjects)
                this.selectedSubjects.setValue(this.subjects.slice(0, 1))
                this.selectedExamTerm = 'Yearly'
                this.selectedExamType = 'all'
                this.renderGraph(student)
            }

        }
    }

    loadExamTypes() {
        this.exam_types = []
        var userIdentity = this.frontendService.getJWTUserIdentity();
        this.backendService.getExamTypes(userIdentity.clientId).toPromise().then((data: string) => {
            let typedata = JSON.parse(data)
            this.exam_types = typedata.map(({ exam_type }) => exam_type);
        }).catch((error:any) => {
                    console.log(error);
                })
    }

    loadExamTerms() {
        this.exam_terms = []
        var userIdentity = this.frontendService.getJWTUserIdentity();
        this.backendService.getExamTerms(userIdentity.clientId).toPromise().then((data: string) => {
            let termsdata = JSON.parse(data)
            this.exam_terms = termsdata.map(({ exam_term }) => exam_term);
            this.exam_terms = this.exam_terms.filter(this.onlyUnique);
        }).catch((error:any) => {
                    console.log(error);
                })

    }
    onSubjectSelection() {
        this.renderGraph(this.selectedStudent)
    }

    renderGraph(student: Student) {
        this.cleanup_target();
        this.loading = true;
        if (this.selectedSubjects.value.length > 0) {
            var subs = ''
            this.selectedSubjects.value.forEach((subject: Subject) => {
                subs += subject.subjectId + ','
            });
            subs = subs.slice(0, -1)
            var id: number

            if (this.type == 'yearly') {
                id = student.studentId
            } else if (this.type == 'termly') {
                id = student.studentGradeId
            } else if (this.type == 'percentile') {
                id = student.studentId
            }
            this.backendService.getStudentPerformanceSubjectWise(id, subs, this.type, this.selectedExamTerm, this.selectedExamType).toPromise().then((data: string) => {
                data = JSON.parse(data)
                Bokeh.embed.embed_item(data, 'target')
                this.selectedStudent = student
                this.loading = false
                this.graphLoaded = true;
            }).catch((error:any) => {
                this.handleError()
            })
        } else {
            this.handleError()
        }
    }

    handleError() {
        document.querySelector('section#target').innerHTML = "Sorry, no records are available.";
        this.loading = false
    }
    cleanup_target() {
        this.graphLoaded = false;
        document.querySelector('section#target').innerHTML = "";
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    onDownload() {
        var canvas = document.getElementsByClassName("bk-canvas");
        this.pdfservice.downloadGraph(canvas, 2);
    }
}
