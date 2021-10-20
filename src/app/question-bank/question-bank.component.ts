import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Question } from '../entities';
import { MatTabGroup } from '@angular/material/tabs';
import { QuestionBankListComponent } from './question-bank-list/question-bank-list.component';
import { QuestionBankAddEditComponent } from './question-bank-add-edit/question-bank-add-edit.component';


@Component({
  selector: 'app-question-bank',
  templateUrl: './question-bank.component.html',
  styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit, AfterViewInit {
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild (QuestionBankListComponent) questionGrid : QuestionBankListComponent
  @ViewChild(QuestionBankAddEditComponent) questionAddEdit : QuestionBankAddEditComponent;

  question4Edit: Question
  tab1Label = "Question List"
  tab2Label = "Add New Question"
  clickedIndex = -1

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit() {
    //console.log(this.tabGroup.selectedIndex);
  }

  onSelectedForEdit(question: any) {
    this.tabGroup.selectedIndex = 1
    this.tab2Label = "Update Question"
    this.question4Edit = question
    this.tabGroup._tabs.toArray()[0].disabled = true;
    this.questionAddEdit.onEditQuestion(question);
  }

  onUpdateDone(question: any)
  {
    this.tabGroup.selectedIndex = 0
    this.tab2Label = "Add New Question"
    this.questionGrid.loadData();
    this.tabGroup._tabs.toArray()[0].disabled = false;
  }
}
