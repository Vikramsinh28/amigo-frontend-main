import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Accomplishment, MONTHS } from '../entities'
import { FrontendService } from '../_services/frontend.service';
import { FileAttachment } from '../_components/file-upload/file-upload/file-upload.component';
import { downloadFile } from '../_helpers/common';

@Component({
    selector: 'app-accomplishment',
    templateUrl: './accomplishment.component.html',
    styleUrls: ['./accomplishment.component.scss']
})
export class AccomplishmentComponent implements OnInit {

    dataSource = new MatTableDataSource<FileUploadModel>();
    displayedColumns: string[] = ['fileName', 'download', 'actions'];

    types = ['Achievement', 'Participation']
    years = this.yearRange(20)
    month_idx_map: any[] = [];

    tags = ['#Academic', '#Arts', '#Communication & Presentation', '#Leadership', '#Mental Sports',
        '#Physical Sports', '#Science and Technology', '#Others']

    levels = ['International', 'National', 'State', 'District', 'City', 'School', 'Grade', 'Others']

    form: FormGroup;
    accomplishmentId = null

    accomplishmentFile: FileAttachment[] = [];

    constructor(private backendService: BackendService,
        public dialogRef: MatDialogRef<AccomplishmentComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Accomplishment,
        private frontendService: FrontendService) {
        dialogRef.disableClose = true
        var idx = 0
        MONTHS.forEach(month => {
            this.month_idx_map.push({ 'label': month, 'value': idx })
            idx += 1
        });
    }

    ngOnInit() {
        if (this.data != null) {
            this.accomplishmentId = this.data.accomplishmentId
            this.form = new FormGroup({
                type: new FormControl(this.data.type),
                year: new FormControl(this.data.year),
                month: new FormControl(this.data.month),
                tag: new FormControl(this.data.tag),
                level: new FormControl(this.data.level),
                title: new FormControl(this.data.title),
                description: new FormControl(this.data.description),
                accomplishmentImages: new FormControl(this.accomplishmentFile)
            });
            if (this.data.documents != null && this.data.documents.length > 0) {
                this.data.documents.forEach(file => {
                    let documents: FileAttachment = {};
                    documents.file = new File([''], file.file_name);
                    documents.info = file.accomplishment_document_id;
                    documents.delete = false;
                    documents.saved = true;
                    this.accomplishmentFile.push(documents);
                });
                this.form.controls.accomplishmentImages.setValue(this.accomplishmentFile);
            }
        } else {
            this.form = new FormGroup({
                type: new FormControl(this.types[0]),
                year: new FormControl(this.years[0]),
                month: new FormControl(this.month_idx_map[0].value),
                tag: new FormControl(this.tags[0]),
                level: new FormControl(this.levels[5]),
                title: new FormControl('',[Validators.required]),
                description: new FormControl('',[Validators.required]),
                accomplishmentImages: new FormControl(this.accomplishmentFile)
            });
        }
    }

    yearRange(size, endAt = new Date().getFullYear()) {
        return [...Array(size).keys()].map(i => endAt - i);
    }

    onSubmit(frm) {
        const fd = new FormData();
        var deleteDocument = []
        var addDocument = []
        if (this.form.controls.accomplishmentImages.value != null &&
            this.form.controls.accomplishmentImages != undefined) {
            this.form.controls.accomplishmentImages.value.forEach(file => {
                if (file.delete && file.saved) {
                    deleteDocument.push({ id: file.info })
                }
                else if (!file.saved && !file.delete) {
                    var id = file.uid + ''
                    fd.append(id, file.file);
                    addDocument.push({ id: id, fileName: file.file.name, documentName: file.file.name })
                }
            });
        }
        fd.append('addDocuments', JSON.stringify(addDocument))
        fd.append('removeDocuments', JSON.stringify(deleteDocument))

        var userIdentity = this.frontendService.getJWTUserIdentity();
        fd.append("accomplishmentId", this.accomplishmentId)
        fd.append('studentId', userIdentity.studentId)
        fd.append("type", frm.controls.type.value)
        fd.append("year", frm.controls.year.value)
        fd.append("month", frm.controls.month.value)
        fd.append("tag", frm.controls.tag.value)
        fd.append("level", frm.controls.level.value)
        fd.append("title", frm.controls.title.value)
        fd.append("description", frm.controls.description.value)
        this.backendService.updateAccomplishment(fd).toPromise().then(
            (result: string) => {
                var accomplishmentDetails = JSON.parse(result)
                this.dialogRef.close(accomplishmentDetails.accomplishmentId);
            }).
            catch((error: any) => {
                console.log(error);
            })
    }


    downloadFile(file) {
        if (file.saved) {
            this.backendService
                .downloadAttachment("accomplishment", file.info)
                .toPromise().then((data) => {
                    downloadFile(data, file.file.name, true);
                }).catch((error:any) => {
                    console.log(error);
                });
        } else {
            downloadFile(file, file.file.name, false);
        }
    }
}

export class FileUploadModel {
    id: number;
    fileName: string;
    documentName: string;
    data?: File;
    delete: boolean;
}