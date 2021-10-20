import { Component, Output, OnInit, ViewChild, EventEmitter, Input } from '@angular/core';
import { BackendService } from '../backend';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GradeDivision } from '../entities/gradeDivision';
import { MatSelect } from '@angular/material/select';
import { FrontendService } from '../_services/frontend.service';

@Component({
    selector: 'app-class-search',
    templateUrl: './class-search.component.html',
    styleUrls: ['./class-search.component.scss']
})
export class ClassSearchComponent implements OnInit {

    form: FormGroup;
    @Output() selected  = new EventEmitter()

    public cachedGradeDivisionData: GradeDivision[];

    public years: any[]
    public grades: any[]
    public divisions: any[]

    public selectedYear : any
    public selectedGrade: any

    constructor(private backendService: BackendService, private frontendService: FrontendService) { }

    ngOnInit() {
        this.form = new FormGroup({
            academicYear: new FormControl(),
            grade: new FormControl(),
            division: new FormControl()
        });
        var userIdentity = this.frontendService.getJWTUserIdentity();
        this.loadGradeDivisions(userIdentity.clientId);
    }

    loadGradeDivisions(clientId)
    {
        this.backendService.getGradeDivision(clientId).toPromise().then((data: string) => {
            this.cachedGradeDivisionData = JSON.parse(data);
            this.filterYears();
        })
        .catch((error:any) => {
                    console.log(error);
                });

    }

    filterYears() {
            this.years= this.cachedGradeDivisionData.map(({ year }) => year);
            this.years = this.years.filter(this.onlyUnique);
            this.clearGradeAndDivision();
    }

    filterGrades(event)
    {
        this.selectedYear = event.value;
        this.clearGradeAndDivision();
        this.grades = this.cachedGradeDivisionData.filter(gradedivision => gradedivision.year === this.selectedYear )
        this.grades = this.grades.map(({grade}) => grade)
        this.grades = this.grades.filter(this.onlyUnique);
    }

    filterDivisions(event)
    {
        this.selectedGrade = event.value;
        this.divisions = this.cachedGradeDivisionData.filter(gradedivision => gradedivision.grade === this.selectedGrade && gradedivision.year === this.selectedYear)
        this.divisions = this.divisions.map(({division}) => division)
        this.divisions = this.divisions.filter(this.onlyUnique);
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    clearGradeAndDivision()
    {
        this.form.controls.division.reset();
        this.form.controls.grade.reset();
        this.divisions = [,]
        this.grades = [,]
    }

    searchClass(searchDetails) {
        //TODO: Add validations
        this.selected.emit(searchDetails);
    }

}