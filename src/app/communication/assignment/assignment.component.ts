import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { MatTabGroup } from '@angular/material/tabs';
import { CommunicationAddEditComponent } from './../communication-add-edit/communication-add-edit.component';
import { CommonGradeDivisionConfiguration } from './../../_components/common-grade-division/common-grade-division.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FrontendService } from 'src/app/_services/frontend.service';
@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss']
})
export class AssignmentComponent implements OnInit {

  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();

  @ViewChild (CommunicationAddEditComponent) commAddEdit: CommunicationAddEditComponent;
  @ViewChild (AssignmentListComponent) assignmentList: AssignmentListComponent;
  @ViewChild (MatTabGroup) tab : MatTabGroup;
  userIdentity: any;
  userRole: string;
  tab1LabelName: string = "New Homework";

  constructor( private frontendService: FrontendService) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
   }

  ngOnInit(): void {
    this.config.isMultiGrade = false;
    //this.config.isMultiSubject = false;
  }

  onUpdateDone(event)
  {
    this.tab.selectedIndex = 0;
    this.tab1LabelName = "New Homework";
    this.assignmentList.searchAssignments();
  }

  editAssignment(data)
  {
    this.tab.selectedIndex = 1;
    this.tab1LabelName = "Update Homework";
    this.commAddEdit.onCommunicationEdit(data);
  }

}
