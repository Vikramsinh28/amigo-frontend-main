import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { CommonService } from '../_helpers/common';
@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {
constructor(private readonly updates: SwUpdate,private snackbar: CommonService) {
    this.updates.available.subscribe(event => {
      
      let snackBarRef = this.snackbar.showSuccessMsg('App Update available', 'Update', null);

      snackBarRef.onAction().subscribe(()=>{
        this.updates.activateUpdate().then(() => document.location.reload());
      });
    });
  }
}