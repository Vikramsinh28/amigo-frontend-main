import {
    Component,
    Output,
    OnInit,
    EventEmitter,
    Input,
    ViewChild,
} from '@angular/core';
import { Student } from '../entities';
import { BackendService } from '../backend';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FrontendService } from '../_services/frontend.service';
import {
    CommonGradeDivisionComponent,
    CommonGradeDivisionConfiguration,
} from '../_components/common-grade-division/common-grade-division.component';

@Component({
    selector: 'app-student-search',
    templateUrl: './student.search.component.html',
    styleUrls: ['./student.search.component.scss'],
})
export class StudentSearchComponent implements OnInit {
    @Input('mode') mode = 'student';
    @Input('userRole') userRole = '';
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    form: FormGroup;
    userIdentity: any;
    displayedColumns: string[] = [
        'regNo',
        'firstName',
        'lastName',
        'select',
    ];
    dataSource = new MatTableDataSource<Student>();
    @Output() selectedStudentChanged = new EventEmitter();
    noDataFound = false;

    initialSelection = [];
    @Input() allowMultiSelect = false;
    selection = new SelectionModel<Student>(
        this.allowMultiSelect,
        this.initialSelection
    );
    clientSubjects: any[] = [];
    config: CommonGradeDivisionConfiguration =
        new CommonGradeDivisionConfiguration();
    @ViewChild(CommonGradeDivisionComponent) filter: CommonGradeDivisionComponent;

    constructor(
        private backendService: BackendService,
        private frontendService: FrontendService
    )
    {
        this.userIdentity = this.frontendService.getJWTUserIdentity();
        this.userRole = this.userIdentity.loginRoleName;
    }

    ngOnInit() {
        this.dataSource = new MatTableDataSource<Student>();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<Student>(
            this.allowMultiSelect,
            this.initialSelection
        );
        this.form = new FormGroup({
            regNo: new FormControl(),
            filter: new FormControl(),
            firstName: new FormControl(),
            lastName: new FormControl(),
        });

        if (this.userRole == 'Management')
        {
            this.config.isBypassAcl = true;
            this.config.isBypassAclShowAllYears = true;
        }
        this.config.isYearRequired = true;
        this.config.isGradeRequired = true;
        this.config.isMultiGrade = false;
        this.config.isDivisionRequired = true;
        this.config.isMultiDivision = false;
        this.config.isSubjectNeeded = true;
        this.config.isSubjectVisible = false;
    }

    onDivisionChanged(values) {
        this.clientSubjects = this.filter.Subjects;
    }

    get Subjects() {
        return this.clientSubjects;
    }

    searchStudents(searchDetails) {
        if (!this.filter.validateForm()) return;

        let regNo = '';
        let year = '';
        let grade = '';
        let division = '';
        let firstName = '';
        let lastName = '';
        let filterValues = this.filter.value;

        if (searchDetails.regNo != null) regNo = searchDetails.regNo;
        if (filterValues.year != null) year = filterValues.year;
        if (filterValues.grade != null) grade = filterValues.grade;
        if (filterValues.division != null) division = filterValues.division;
        if (searchDetails.firstName != null) firstName = searchDetails.firstName;
        if (searchDetails.lastName != null) lastName = searchDetails.lastName;

        this.backendService
            .getStudents(
                this.mode,
                this.userIdentity.clientId,
                regNo,
                year,
                grade,
                division,
                firstName,
                lastName
            )
            .toPromise().then((data: string) => {
                this.dataSource.data = JSON.parse(data);
                this.noDataFound = this.dataSource.data.length == 0 ? true : false;
            }).catch((error:any) => {
                    console.log(error);
                });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach((row) => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: Student): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.regNo
            }`;
    }

    submit(element) {
        var emitValue: any = { student: element, subjects: this.clientSubjects };
        this.selectedStudentChanged.emit(emitValue);
    }
}
