import { RemarkListComponent } from './remark-list/remark-list.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { CommunicationAddEditComponent } from '../communication-add-edit/communication-add-edit.component';

@Component({
  selector: 'app-remark',
  templateUrl: './remark.component.html',
  styleUrls: ['./remark.component.scss']
})
export class RemarkComponent implements OnInit {

  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();

  @ViewChild (CommunicationAddEditComponent) commAddEdit: CommunicationAddEditComponent;
  @ViewChild (RemarkListComponent) remarkList : RemarkListComponent;
  @ViewChild (MatTabGroup) tab : MatTabGroup;
  userIdentity: any;
  userRole: string;
  tab1LabelName: string = "New Remark";

  constructor(private frontendService: FrontendService)
  {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
  }

  ngOnInit(): void {
    this.config.isMultiGrade = false;
    this.config.isMultiDivision = false;
    this.config.isSubjectVisible = false;
    this.config.isStudentVisible = true;
    this.config.isMultiStudent = true;
  }

  onUpdateDone(event)
  {
    this.tab.selectedIndex = 0;
    this.tab1LabelName = "New Remark";
    this.remarkList.searchRemarks();
  }

  editRemark(data)
  {
    this.tab.selectedIndex = 1;
    this.tab1LabelName = "Update Remark";
    this.commAddEdit.onCommunicationEdit(data);
  }
}
