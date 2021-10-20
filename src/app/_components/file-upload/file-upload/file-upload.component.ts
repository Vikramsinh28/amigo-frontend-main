import { environment } from './../../../../environments/environment.prod';
import {
  Component,
  Input,
  ElementRef,
  HostListener,
  forwardRef,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { ControlContainer, NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxImageCompressService } from 'ngx-image-compress';
import { v4 as uuid } from 'uuid';
import { CommonService } from 'src/app/_helpers/common';

export class FileAttachment {
  file?: File;
  delete?: boolean = false;
  uid?: string;
  saved?: boolean = false;
  info?: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      //useExisting: FileUploadComponent,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class FileUploadComponent implements OnInit{
  @Input() id;
  onChange: Function = (value: any) => { };
  @Input() files: FileAttachment[];
  public limit = 0;
  @Input() MAX_FILE_COUNT: number = 0;
  @Input() VALID_FILE_EXT: string = '';
  @Input() MAX_FILE_SIZE: number = 0;
  @Output() downloadFileEvent = new EventEmitter();
  localCompressedURl: any;
  localUrl: any;
  onTouched: Function = () => { };
  validFiles: string = null;

  constructor(private host: ElementRef<HTMLInputElement>,
    private imageCompress: NgxImageCompressService,
    private snackBar: CommonService) {
  }
  ngOnInit(): void {
    var files: any = this.VALID_FILE_EXT.length > 0 ? this.VALID_FILE_EXT.split(',') : '';
    this.validFiles = files.join(", ");
  }

  @HostListener('change', ['$event']) async emitFiles(uevent: any) {

    let target = uevent.target;
    //fileList is generated from fileUpload HTML component.. from files selected by the user
    let fileList: FileList = target.files;



    if (fileList) {

      this.limit = fileList.length;
      let activeFileLen = this.files.filter(f => f.delete === false).length;

      let totalFilesCount = activeFileLen + fileList.length;

      if (this.MAX_FILE_COUNT > 0 && this.MAX_FILE_COUNT < totalFilesCount) {
        this.snackBar.showErrorMsg('Maximum ' + String(this.MAX_FILE_COUNT) + ' file can be uploaded');
        uevent.target.value = '';
      }
      else {
        if (this.CheckValidFileExtentions(fileList) && this.CheckMaximumFileSize(fileList)) {
          //await this.compressAllFiles(fileList)
          for (let i = 0; i < fileList.item.length; i++) {

            let attachment: FileAttachment = {};
            attachment.file = fileList[i]
            attachment.delete = false;
            attachment.uid = uuid();
            this.files.push(attachment);
          }

          this.files = this.files.filter((f) => f.file !== null);
          uevent.target.value = '';
          try {
            this.onChange(this.files);
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
  }


  CheckValidFileExtentions(files) {
    const allowedExts =
      this.VALID_FILE_EXT.length > 0 ? this.VALID_FILE_EXT.toLowerCase().split(',') : environment.allowedDocumentUploadExtentions + ',' + environment.allowedImageUploadExtentions;
    if (allowedExts.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const extension = '.' + files.item(i).name.split('.')[1].toLowerCase();
        const index = allowedExts.indexOf(extension.toLowerCase())
        if (index < 0) {
          this.snackBar.showErrorMsg(this.VALID_FILE_EXT + " files are allowed to be uploaded");
          return false;
        }
      }
    }
    return true;
  }

  CheckMaximumFileSize(files) {
    const allowedSize = this.MAX_FILE_SIZE;
    if (allowedSize <= 0)
      return true;
    else {
      for (let i = 0; i < files.length; i++) {
        const fileSize = Math.round((files.item(i).size / 1024))

        if (fileSize > allowedSize) {
          this.snackBar.showErrorMsg("File \'" + files.item(i).name + "\' is too big. Please attach a smaller file");
          return false;
        }
      }
      return true;
    }
  }

  filterFiles(): any[] {
    return this.files.filter(f => f.delete === false);
  }

  assignFiles(files) {
    this.files = files;
  }
  deleteDocument(file) {
    if (file.uid) {
      let findex = this.files.findIndex(function (f) {
        return f.uid == file.uid
      });

      this.files[findex].delete = true;
    }
    else {
      this.files.forEach((f) => {
        if (f.file.name == file.file.name && f.file.lastModified == file.file.lastModified) {
          f.delete = true;
        }
      });
    }

    this.onChange(this.files);
    this.onTouched();
  }

  reset(event) {
    event.target.value = '';
  }

  downloadFile(f) {
    this.downloadFileEvent.emit(f);
  }

  writeValue(value: null) {
    // clear file input
    this.host.nativeElement.value = '';
    this.files = [];
    if (value) {
      this.files = value;
      this.onChange(value);
      this.onTouched();
    }
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  get value() {
    return this.files;
  }

  set value(val) {
    this.files = val;
    this.onChange(val);
    this.onTouched();
  }

  async compressAllFiles(fileList) {
    for (let i = 0; i < this.limit; i++) {
      let origFile = fileList.item(i);
      let fileName = origFile.name;
      var reader = new FileReader();
      reader.onload = async (event: any) => {
        this.localUrl = event.target.result;
        let result = await this.compressFile(this.localUrl, fileName)
      }
      reader.readAsDataURL(origFile);

    }
  }



  compressFile(image, fileName): Promise<File> {
    var orientation = -1;
    try {
      this.imageCompress.compressFile(image, orientation, 60, 50).then(
        imgResultAfterCompress => {
          let sizeOFCompressedImage = this.imageCompress.byteCount(imgResultAfterCompress) / (1024 * 1024)
          console.warn('Size in bytes after compression:', sizeOFCompressedImage);
          this.localCompressedURl = imgResultAfterCompress;

          const imageName = fileName;
          const imageBlob = this.dataURItoBlob(imgResultAfterCompress.split(',')[1]);
          let newFile = new File([imageBlob], imageName);
          let attachment: FileAttachment = {};
          attachment.file = newFile
          attachment.delete = false;
          attachment.uid = uuid();
          //attachment.saved = false;
          this.files.push(attachment);
          return newFile
        });
    } catch (error) { }
    finally {
      return null
    }
  }


  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }


}
