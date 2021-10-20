import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendService } from 'src/app/backend';
import { PdfgenerationService } from 'src/app/_services/pdf-generation.service';

@Component({
  selector: 'app-paper-pdf-customize',
  templateUrl: './paper-pdf-customize.component.html',
  styleUrls: ['./paper-pdf-customize.component.scss']
})
export class PaperPdfCustomizeComponent implements OnInit {

  questions: any[] = [];
  selectedTestPaperId: any;
  attachmentFileName: string;
  isFrozen: boolean;
  form: FormGroup;
  date: Date;
  languages: Array<string> = ["", "Hindi", "Gujarati", "Sanskrit", "Marathi", "Tamil", "Kannada", "Spanish", "French", "German"];
  constructor(private backendService: BackendService,
    public pdfservice:PdfgenerationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.selectedTestPaperId = data.testPaperId;
      this.attachmentFileName = data.attachmentFileName;
      this.isFrozen = data.isFrozen;
      this.loadData();
     }

  ngOnInit(): void {

    this.form = new FormGroup({
      paper: new FormControl(null, Validators.required),
      examDuration: new FormControl(null),
      paperDate: new FormControl(null),
      testInstructions: new FormControl(null),
      footerText: new FormControl(""),
      language: new FormControl(null)
    });
    this.form.controls.paper.setValue(this.attachmentFileName);
  }

  loadData() {
    this.backendService
      .getTestPaperPreview(this.selectedTestPaperId, this.isFrozen)
      .toPromise().then((result: any) => {
        this.questions = result;
      }).catch((error:any) => {
                    console.log(error);
                });
  }

  onDateChange(dateValue) {
    this.date = new Date(
      dateValue.value._i.year,
      dateValue.value._i.month,
      dateValue.value._i.date
    );
  }

  downloadpdf(answerKey:boolean){
    this.data.date = this.date ? formatDate(this.date, 'dd-MM-yyyy', 'en-US') : null;
    this.data.attachmentFileName = this.form.controls.paper.value;
    this.data.duration = this.form.controls.examDuration.value ? String(this.form.controls.examDuration.value) : null;
    this.data.instruction = this.form.controls.testInstructions.value;
    this.data.footerText = this.form.controls.footerText.value;
    this.data.language = this.form.controls.language.value == null ? "" : this.form.controls.language.value;
    this.pdfservice.testPaperPdfGeneration(this.questions, this.data, answerKey);
  }

}
