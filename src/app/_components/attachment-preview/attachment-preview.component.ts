import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BackendService } from 'src/app/backend';
import { getMIMEType } from 'src/app/_helpers/common';
import { FrontendService } from 'src/app/_services/frontend.service';
import { environment } from './../../../environments/environment';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-attachment-preview',
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent implements OnInit {
  @Input() selectedTestPaperId: any;
  @Input() selectedTestPaperName: any;
  @Input() withAnswers: boolean;
  @Input() isFrozen: boolean;
  @Input() withMarks: boolean;
  @Input() grade: string;
  @Input() subject: string;
  @Input() totalMarks: string;
  userIdentity: any;
  withAnswerKey: boolean;
  questions: any[] = [];
  nonImageFileList: any[];
  marksToShow: boolean;
  isAllDataFetch: boolean = false;
  _albums = [];
  clientLogo: any;
  schoolName: string;


  constructor(
    private backendService: BackendService,
    private frontendService: FrontendService,
    private sanitizer: DomSanitizer,
    private _lightbox: Lightbox
  ) { }


  ngOnInit(): void {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.loadData();
    this.clientLogo = this.sanitizer.bypassSecurityTrustUrl(JSON.parse(localStorage.getItem('clientLogo')).changingThisBreaksApplicationSecurity);
    this.schoolName = this.frontendService.getJWTUserIdentity().clientName;
  }
  loadData() {
    this.backendService
      .getTestPaperPreview(this.selectedTestPaperId, this.isFrozen)
      .toPromise().then((result: any) => {
        this.questions = result;
        this.nonImageFileList = [];
        this.withAnswerKey = this.withAnswers;
        this.marksToShow = this.withMarks;
        this.prepareWorksheetData();
        if (this.questions.length > 0) {
          this.isAllDataFetch = true;
        }
      }).catch((error:any) => {
                    console.log(error);
                });

  }

  prepareWorksheetData() {
    this.questions.forEach((question) => {
      //Prepare for keywords
      if (question.keyWords !== null && question.keyWords !== undefined) {
        question.keyWords = question.keyWords.split(',');
      }

      //Prepare images of Questions
      if (
        question.questionAttachment !== null &&
        question.questionAttachment !== undefined
      ) {
        var fExt = question.questionAttachment[0].fileName.split('.').pop();
        const index = environment.allowedImageUploadExtentions
          .toLowerCase()
          .indexOf(fExt.toLowerCase());

        if (index >= 0) question.questionAttachment[0].type = 'image';
        else question.questionAttachment[0].type = 'doc';

        var strMIME = getMIMEType(fExt);
        var objectURL =
          'data:' + strMIME + ';base64,' + question.questionAttachment[0].data;

        question.questionAttachment[0].data = this.sanitizer.bypassSecurityTrustUrl(
          objectURL
        );

        if (question.questionAttachment[0].type == 'doc') {
          // Add link to collection
          this.nonImageFileList.push(question.questionAttachment[0]);
        }
      }

      if (question.answerAttachment != null) {
        question.answerAttachment.forEach((attach) => {
          var fExt = attach.fileName.split('.').pop();
          const index = environment.allowedImageUploadExtentions
            .toLowerCase()
            .indexOf(fExt.toLowerCase());

          if (index >= 0) attach.type = 'image';
          else attach.type = 'doc';

          var strMIME = getMIMEType(fExt);
          var objectURL = 'data:' + strMIME + ';base64,' + attach.data;

          attach.data = this.sanitizer.bypassSecurityTrustUrl(objectURL);

          if (attach.type == 'doc') {
            // Add link to collection
            this.nonImageFileList.push(attach);
          }
        });
      }
    });
  }

  downloadNonImageFile() {
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    this.nonImageFileList.forEach((file) => {
      a.setAttribute('style', 'display:none;');
      a.setAttribute('download', file.fileName);
      a.setAttribute('href', file.data.changingThisBreaksApplicationSecurity);
      a.target = '_self';
      a.click();
    });
  }

  open(src): void {
    this._albums = [];
    const album = {
      src: src,
    };
    this._albums.push(album);
    this._lightbox.open(this._albums, 0, { fitImageInViewPort: true, centerVertically: true, disableScrolling: true, showZoom: true });
  }

  openImage(event): void {
    if (event.target && event.target.tagName == 'IMG') {
      if (event.target.src) {
        let albums = [];
        const album = {
          src: event.target.src,
        };
        albums.push(album);
        this._lightbox.open(albums, 0, { fitImageInViewPort: true, centerVertically: true, disableScrolling: true, showZoom: true });
      }
    }
  }

}