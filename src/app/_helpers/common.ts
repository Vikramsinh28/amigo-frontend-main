import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export function getMIMEType(extention: String) {
    switch (extention.toLowerCase()) {
        case "txt":
            return "text/plain";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "doc":
            return "application/mswoxrd";
        case "pdf":
            return "application/pdf";
        case "xls":
            return "application/vnd.ms-excel";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "png":
            return "image/png";
        case "jpg":
            return "image/jpeg";
        case "jpeg":
            return "image/jpeg";
        default:
            return "";
    }
}

export function downloadFile(file: any, fileName: string, saved: boolean) {
    let downloadedFile: any;
    if (saved) {
        downloadedFile = new Blob([file]);
    } else {
        downloadedFile = new Blob([file.file]);
    }
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = fileName;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
}

export function extractTextFromHtml(html: String) {
    // let extractedText = $('<p>' + html + '</p>').text();
    // return extractedText;

    let div: any = document.createElement("div");
    div.innerHTML = html;
    var length = div.getElementsByTagName("math").length;
    for (let i = 0; i < length; i++) {
        div.getElementsByTagName("math")[i].textContent = '';
    }

    var figure = div.getElementsByTagName("figure").length;
    for (let i = 0; i < figure; i++) {
        div.getElementsByTagName("figure")[i].textContent = '';
    }

    let text = div.textContent || div.innerText || "";
    return text;
}

export function validateRTEContent() {
    var largeImg = {
        imageCount: 0,
        imagePosition: 0
    };
    var imgList = [];
    var figure = document.getElementsByTagName("figure");
    for (let i = 0; i < figure.length; i++){
        if(figure[i].getElementsByTagName("img")[0])
        {
            imgList.push(figure[i].getElementsByTagName("img")[0]);
        }
    }

    if (imgList.length > 2) {
        largeImg.imageCount = imgList.length;
        return largeImg;
    }

    // check for the size of the image.. it should not exceed beyond 15Kb
    if (imgList.length) {
        for (let i = 0; i < imgList.length; i++) {
            var src = imgList[i].src;
            var binary = atob(src.split(',')[1]);
            let mime = src.match(/:(.*?);/)[1];
            var array = [];
            for (var j = 0; j < binary.length; j++) {
                array.push(binary.charCodeAt(j));
            }
            var file = new Blob([new Uint8Array(array)], { type: mime });
            if (formatBytes(file.size) > 15) {
                imgList[i].style.border = '2px solid red';
                largeImg.imageCount++;
                largeImg.imagePosition = i + 1;
            }
        }
    }
    return largeImg;
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    //const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    //const i = Math.floor(Math.log(bytes) / Math.log(k));
    const i = 1;

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
}

export function fetchClientInternalNameFromURL() {
    var clientInternalName = environment.staticClient
    if (clientInternalName == "") {
        clientInternalName = location.hostname.split(".")[0]
    }
    return clientInternalName
}

export function validateForm(controlForm): boolean {
    Object.keys(controlForm.controls).forEach((key) => {
        controlForm.get(key).updateValueAndValidity();
      if (!controlForm.get(key).valid) {
        controlForm.get(key).markAllAsTouched();
      }
    });
    return controlForm.valid
  }


@Injectable({
    providedIn: 'root'
  })
  export class CommonService
  {
    constructor(private snackbar: MatSnackBar) { }
    showErrorMsg(message, action = "", duration = 4000) {
        return this.snackbar.open(message, action, {
            duration: duration,
            panelClass: ['warning-message'],
            verticalPosition: 'top',
        });
    }
​
    showSuccessMsg(message, action = "", duration = 4000) {
        return this.snackbar.open(message, action,{
            duration: duration,
            panelClass: ['success-message'],
            verticalPosition: 'top',
        });
    }
  }