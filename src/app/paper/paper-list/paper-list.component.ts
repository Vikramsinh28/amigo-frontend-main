import { Paper } from './../../entities/';
import { BackendService } from 'src/app/backend';
import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Grade } from '../../entities/grade';
import { Subject, Question, PaperQuestion } from 'src/app/entities';
import { FrontendService } from 'src/app/_services/frontend.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PaperPreviewDialogBoxComponent } from 'src/app/_components/paper-preview-dialog-box/paper-preview-dialog-box.component';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PaperPdfCustomizeComponent } from 'src/app/_components/paper-pdf-customize/paper-pdf-customize.component';
import { CommonGradeSubjectComponent, CommonGradeSubjectConfiguration } from 'src/app/_components/common-grade-subject/common-grade-subject.component';

@Component({
  selector: 'app-paper-list',
  templateUrl: './paper-list.component.html',
  styleUrls: ['./paper-list.component.scss']
})
export class PaperListComponent implements OnInit {

  subjects: Subject[] = [];
  grades: Grade[] = [];
  selectedSubject: Subject;
  selectedGrade: Grade;
  papers: Array<Paper> = [];
  paperDataSource = new MatTableDataSource<Paper>(this.papers);
  userIdentity: any;
  @Output() selected4Edit = new EventEmitter()
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  config: CommonGradeSubjectConfiguration = new CommonGradeSubjectConfiguration();
  @ViewChild(CommonGradeSubjectComponent) filter: CommonGradeSubjectComponent;

  columnsToDisplay = ['paperName', 'chapters', 'topics', 'isFrozen', 'modifiedDate', 'modifiedUser', 'action'];
  dateFormat: string;
  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    public dialog: MatDialog) { }

  ngOnInit(): void {

    this.paperDataSource.sort = this.sort;
    this.paperDataSource.paginator = this.paginator;
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.dateFormat = this.userIdentity.dateFormat;

    this.config.isGradeRequired = true;
    this.config.isSubjectVisible = true;
    this.config.isSubjectRequired = true;
    this.config.isChapterVisible = false;
    this.config.isTopicVisible = false;
    this.config.isQTypeVisible = false;
  }

  loadPapers() {
    if (this.filter.validateForm()) {
      let filterValue = this.filter.value;

      this.backendService.getPapers(this.userIdentity.clientId,
        filterValue.subject,
        filterValue.grade).toPromise().then((result: string) => {
        var papers = JSON.parse(result);

        this.paperDataSource.data = papers.map(function (q) {
          return {
            'grade': q.grade,
            'subject': q.subject_name,
            'testPaperId': q.testpaperid,
            'paperName': q.testpapername,
            'subjectId': q.subjectid,
            'subjectName': q.subject,
            'isFrozen': q.isfrozen,
            'totalMarks': q.totalmarks,
            'chapters': q.chapters,
            'topics': q.topics,
            'modifiedDate': q.modifieddate,
            'modifiedUser': q.modifieduser
          }
        })
      }).catch((error:any) => {
                    console.log(error);
                });
    }
  }

  editQuestion(selectedQuestion: Question) {
    this.selected4Edit.emit(selectedQuestion)
  }

  deleteQuestion(selectedQuestion: Question, paperName: string) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: true,
      data: { title: 'Confirm', message: 'Are you sure you want to delete paper \'' + paperName + '\' ?', yes: 'Delete', no: 'Cancel' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("Yet to be Implemented !");
      }
    })
  }

  // Display Paper
  displayPaperPreview(data) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      testPaperId: data.testPaperId,
      attachmentFileName: data.paperName,
      withAnswerKey: true,
      isFrozen: data.isFrozen,
      withMarks: true,
      grade: data.grade,
      subject: data.subject,
      totalmarks: data.totalMarks
    };
    const dialogRef = this.dialog.open(
      PaperPreviewDialogBoxComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => { });
  }

  customizePdfDownload(data) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.data = {
      testPaperId: data.testPaperId,
      attachmentFileName: data.paperName,
      withAnswerKey: true,
      isFrozen: data.isFrozen,
      withMarks: true,
      grade: data.grade,
      subject: data.subject,
      totalmarks: data.totalMarks
    };
    const dialogRef = this.dialog.open(
      PaperPdfCustomizeComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => { });
  }

  clearFilter(){
    this.filter.reset();
    this.paperDataSource.data = [];
  }
}
