import { UpcomingEventsListComponent } from './upcoming-event-list/upcoming-event-list.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { CommonGradeDivisionConfiguration } from 'src/app/_components/common-grade-division/common-grade-division.component';
import { FrontendService } from 'src/app/_services/frontend.service';
import { CommunicationAddEditComponent } from '../communication-add-edit/communication-add-edit.component';

@Component({
  selector: 'app-upcoming-event',
  templateUrl: './upcoming-event.component.html',
  styleUrls: ['./upcoming-event.component.scss']
})
export class UpcomingEventsComponent implements OnInit {

  config: CommonGradeDivisionConfiguration = new CommonGradeDivisionConfiguration();
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild (CommunicationAddEditComponent) commAddEdit: CommunicationAddEditComponent;
  @ViewChild (UpcomingEventsListComponent) UpList: UpcomingEventsListComponent;

  userIdentity: any;
  userRole: string;
  tab1LabelName: string = "New Event";

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
    this.tab1LabelName = "New Event";
    this.UpList.searchUEvents();
  }

  editUEvent(data)
  {
    this.tabGroup.selectedIndex = 1;
    this.tab1LabelName = "Update Event";
    this.commAddEdit.onCommunicationEdit(data);
  }
}
