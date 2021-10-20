import { Paper } from './../entities/paper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { PaperListComponent } from './paper-list/paper-list.component';
import { PaperSetupComponent } from './paper-setup/paper-setup.component';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class PaperComponent implements OnInit {
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild (PaperListComponent) paperGrid : PaperListComponent
  @ViewChild (PaperSetupComponent) paperSetup : PaperSetupComponent

  testPaper4Edit: Paper;
  tab1Label = "Paper List"
  tab2Label = "Set New Paper"
  clickedIndex = -1

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    //console.log(this.tabGroup.selectedIndex);
  }

  onSelectedForEdit(testPaper: any) {
    this.tabGroup.selectedIndex = 1
    this.tab2Label = testPaper.isFrozen ? "View Paper" : "Update Paper"
    this.testPaper4Edit = testPaper
    this.tabGroup._tabs.toArray()[0].disabled = true;
    this.paperSetup.onEditPaper(testPaper);
  }

  onUpdateDone(testPaper: any)
  {
    this.tabGroup.selectedIndex = 0
    this.tab2Label = "Set New Paper"
    this.tabGroup._tabs.toArray()[0].disabled = false;
    this.paperGrid.loadPapers();
  }

}
