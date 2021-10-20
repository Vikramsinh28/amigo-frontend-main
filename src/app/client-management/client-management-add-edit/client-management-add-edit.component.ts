import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client-management-add-edit',
  templateUrl: './client-management-add-edit.component.html',
  styleUrls: ['./client-management-add-edit.component.scss']
})
export class ClientManagementAddEditComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  //==== File Upload ====//
  myFiles: string[] = [];
  sMsg: string = '';

  addDocument(e) {
    for (var i = 0; i < e.target.files.length; i++) {
      this.myFiles.push(e.target.files[i]);
    }
  }

}
