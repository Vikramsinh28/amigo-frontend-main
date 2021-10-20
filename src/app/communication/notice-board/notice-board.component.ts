import { NoticeBoardListComponent } from './notice-board-list/notice-board-list.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { CommunicationAddEditComponent } from '../communication-add-edit/communication-add-edit.component';

@Component({
  selector: 'app-notice-board',
  templateUrl: './notice-board.component.html',
  styleUrls: ['./notice-board.component.scss']
})
export class NoticeBoardComponent implements OnInit {

  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  @ViewChild (CommunicationAddEditComponent) commAddEdit: CommunicationAddEditComponent;
  @ViewChild(NoticeBoardListComponent) noticeList: NoticeBoardListComponent;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  userIdentity: any;
  userRole: string;
  tab1LabelName = "New Notice";

  constructor(private frontendService: FrontendService)
  {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.userRole = this.userIdentity.loginRoleName;
  }

  ngOnInit(): void {
    this.config.isMultiGrade = true;
    this.config.isMultiDivision = true;
    this.config.isSubjectVisible = false;
  }

  onUpdateDone(event)
  {
    this.tabGroup.selectedIndex = 0;
    this.tab1LabelName = "New Notice";
    this.noticeList.searchNotices();
  }

  editNotice(data)
  {
    this.tabGroup.selectedIndex = 1;
    this.tab1LabelName = "Update Notice";
    this.commAddEdit.onCommunicationEdit(data);
  }

}
