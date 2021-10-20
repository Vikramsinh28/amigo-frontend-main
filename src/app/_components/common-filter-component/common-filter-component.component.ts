import { Component, OnInit } from '@angular/core';
import { ClientDivision } from 'src/app/entities/clientDivision';
import { ClientGrade } from 'src/app/entities/clientGrade';
import { ClientSubject } from 'src/app/entities/clientSubject';
import { ClientYear } from 'src/app/entities/clientYear';
import { StudentPromotion } from 'src/app/entities/student-promotion';
import { CommonService } from 'src/app/_helpers/common';

@Component({
  selector: 'app-common-filter-component',
  templateUrl: './common-filter-component.component.html',
  styleUrls: ['./common-filter-component.component.scss']
})
export class CommonFilterComponentComponent implements OnInit {

  // List of filter
  clientYearList: ClientYear[];
  clientGradeList: ClientGrade[];
  clientDivisionList: ClientDivision[];
  clientSubjectList: ClientSubject[];
  clientStudentList: StudentPromotion[];

  // Selected filter
  selectedYear: any;
  selectedGrade: any;
  selectedDivision: any;
  selectedSubject: any;
  selectedStudent: any;

  // List of filter
  filterList: any[];






  constructor(private snackBar: CommonService) { }

  ngOnInit(): void {
  }


  validateData() {
    this.filterList.forEach((type) => {
      if (type === 'Y' || type === 'Y_M') {
        if (this.selectedYear == null) {
          this.showErrMsg("Please select Year")
          return false;
        }
      } else if (type === 'G' || type === 'G_M') {
        if (this.selectedGrade == null || this.selectedGrade.length === 0) {
          this.showErrMsg("Please select Grade")
          return false;
        }
      } else if (type === 'D' || type === 'D_M') {
        if (this.selectedDivision == null || this.selectedDivision.length === 0) {
          this.showErrMsg("Please select Division")
          return false;
        }
      } else if (type === 'Sub') {
        if (this.selectedSubject == null) {
          this.showErrMsg("Please select subject")
          return false;
        }
      } else if (type === 'Std') {

      }
    })
  }

  resetData(resetFilterType: any) {
    resetFilterType.forEach(element => {
      if (element === 'Y' || element === 'Y_M') {
        this.selectedYear = null;
      } else if (element === 'G' || element === 'G_M') {
        this.selectedGrade = null;
      } else if (element === 'D' || element === 'D_M') {
        this.selectedDivision = null;
      } else if (element === 'Sub') {
        this.selectedSubject = null;
      } else if (element === 'Std') {
        this.selectedStudent = null;
      }
    });
  }

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

}
