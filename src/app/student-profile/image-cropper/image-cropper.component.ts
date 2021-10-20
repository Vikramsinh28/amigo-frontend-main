import { Component, OnInit } from '@angular/core';
import { ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendService } from '../../backend';
import { FrontendService } from 'src/app/_services/frontend.service';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {

  constructor(private backendService: BackendService,
    public dialogRef: MatDialogRef<ImageCropperComponent>,
    private frontendService: FrontendService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.autoSave = data.autoSave;
  }
  ngOnInit(): void { }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  cropCompleted = false;
  autoSave: any;

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  loadImageFailed() {
    console.error('Image Crop: Image failed to load');
  }

  onSubmit() {
    if (this.autoSave) {
      let img_data = this.croppedImage.replace('data:image/png;base64,', '');
      const fd = new FormData();
      fd.append("picture", img_data);
      fd.append("user_id", this.frontendService.getJWTUserIdentity().userId);
      this.backendService.updateProfilePicture(fd).toPromise().then(
        (result: string) => {
          this.cropCompleted = true;
          this.dialogRef.close(this.croppedImage);
        }).
        catch((err: any) => {
          console.log(err)
        }
      );
    } else {
      this.dialogRef.close(this.croppedImage);
    }
  }
}
