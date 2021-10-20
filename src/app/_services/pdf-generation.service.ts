import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import pdfmake from 'pdfmake/build/pdfmake';
import pdfFonts from '../../assets/Fonts/vfs_fonts.js';
import {fonts} from '../../assets/Fonts/pdfFonts';
import { Columns, Options, TextLine, File } from 'src/app/entities/questionPdf';
pdfmake.vfs = pdfFonts.pdfMake.vfs;
pdfmake.fonts = fonts;
import { saveAs } from 'file-saver';
import { FrontendService } from './frontend.service';
import htmlToPdfmake from 'html-to-pdfmake';

@Injectable({
  providedIn: 'root'
})
export class PdfgenerationService {

  contentObj : Array<TextLine>=[];
  header1 : Array<TextLine>=[];
  header2 : Array<TextLine>=[];
  header3 : Array<TextLine>=[];
  questions: any[] = [];
  image:any={};
  height:any={};
  zipFiles: Array<File>;
  schoolName: string;
  language: string = 'Poppins';
  fontSize: number = 11;
  icons={
    radio_false:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"/></svg>',
    radio_true:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 6c-3.313 0-6 2.687-6 6s2.687 6 6 6c3.314 0 6-2.687 6-6s-2.686-6-6-6z"/></svg>',
    check_false:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path d="M5 2c-1.654 0-3 1.346-3 3v14c0 1.654 1.346 3 3 3h14c1.654 0 3-1.346 3-3v-14c0-1.654-1.346-3-3-3h-14zm19 3v14c0 2.761-2.238 5-5 5h-14c-2.762 0-5-2.239-5-5v-14c0-2.761 2.238-5 5-5h14c2.762 0 5 2.239 5 5z"/></svg>',
    check_true:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path d="M19 0h-14c-2.762 0-5 2.239-5 5v14c0 2.761 2.238 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-8.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"/></svg>'
  }

  constructor(private frontendService: FrontendService) {
    this.schoolName=this.frontendService.getJWTUserIdentity().clientName;
  }

  testPaperPdfGeneration(question, data, answerKey:boolean){
    this.selectLanguage(data.language);
    this.questions=question;
    this.contentObj=[];
    let l : TextLine={};
    let option : Options;
    let column : Columns;
    let i=1;
    this.image={};
    this.image['logo']=this.frontendService.getClientLogo();
    let k=0;
    this.zipFiles=[];
    let file : File;
    if(data.instruction)
    {
      l={};
      l.columns=[];
      column={};
      column.text = 'Instructions: ';
      column.width="17%";
      column.style='subheader';
      l.columns.push(column);
      column={};
      column.text = data.instruction;
      column.width="83%";
      l.columns.push(column);
      this.contentObj.push(l);
      this.contentObj.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]});
    }

    this.questions.forEach(question=>{
      // Adding images to image Array
      if(question.questionAttachment)
      {
        if(question.questionAttachment[0].type == 'image')
        {
          this.image[k]=question.questionAttachment[0].data.changingThisBreaksApplicationSecurity;
          k++;
        }
        else{
          // Creating the non-image file to add to zip
          file={};
          file.url=question.questionAttachment[0].data.changingThisBreaksApplicationSecurity;
          file.fileName='Que'+i+'_'+question.questionAttachment[0].fileName;
          this.zipFiles.push(file);
        }
      }
      if(question.answerAttachment && answerKey==true)
      {
        for(let j=0;j<question.answerAttachment.length;j++)
        {
          if(question.answerAttachment[j].type == 'image')
          {
            this.image[k]=question.answerAttachment[j].data.changingThisBreaksApplicationSecurity;
            k++;
          }
          else{
            // Creating the non-image file to add to zip
            file={};
            file.url=question.answerAttachment[j].data.changingThisBreaksApplicationSecurity;
            file.fileName='Ans'+i+'_'+question.answerAttachment[j].fileName;
            this.zipFiles.push(file);
          }
        }
      }
      i++;
    })
    k=0;
    i=1;
    this.questions.forEach(question=>{
      l={};
      l.columns=[];
      column={};
      column.text = i+')\t';
      column.style='top';
      column.width='5%';
      l.columns.push(column);
      column={};
      column.text = htmlToPdfmake(question.questionText);
      column.style='top';
      column.width='80%';
      l.columns.push(column);
      column={};
      column.text = '['+question.actualMarks+' marks]';
      column.width='15%';
      column.style="markText";
      l.columns.push(column);
      l.style='textMargin';
      this.contentObj.push(l);
      if(question.questionAttachment)
      {
        // Question Images are given index to access from image Array
        if(question.questionAttachment[0].type == 'image')
        {
          l={};
          l.image=k.toString();
          l.style='Image';
          l.width=400;
          this.contentObj.push(l);
          k++;
        }
        else
        {
          this.contentObj.push({text:'Attachment:',style:'Image'});
          l={};
          l.text='1) '+question.questionAttachment[0].fileName+' **';
          l.style="Document";
          this.contentObj.push(l);
        }
      }
      if(question.subjectiveAnswer && answerKey==true)
      {
        l={};
        l.columns=[];
        column = {};
        column.text = '';
        column.width = '5%';
        l.columns.push(column);
        column = {};
        column.text=htmlToPdfmake('Answer : \n\n'+ question.subjectiveAnswer +'\n\n');
        column.width='80%';
        l.columns.push(column);
        this.contentObj.push(l);
      }
      else if(question.objectiveAnswer)
      {
        // Fill in the blanks answer
        if(question.questionTypeId==7 && answerKey==true)
        {
          l={};
          l.ul=[];
          for(let i=0;i<question.objectiveAnswer.length;i++)
          {
            option={};
            option.text='Answer ('+(i+1)+'): '+question.objectiveAnswer[i]+'\n\n';
            l.ul.push(option);
          }
          l.style='LeftMargin';
          this.contentObj.push(l);
        }
        // Choose the correct option
        if(question.questionTypeId!=7)
        {
          for(let i=0;i<question.objectiveAnswer.length;i++)
          {
            l={}
            l.columns=[];
            column = {};
            column.text = '';
            column.width = '5%';
            l.columns.push(column);
            column={};
            if(question.objectiveAnswerIsCorrect[i]  && answerKey==true)
            {
              if(question.questionTypeId==2)
              {
                column.svg = this.icons.radio_true;
              }
              if(question.questionTypeId==3)
              {
                column.svg = this.icons.check_true;
              }
            }
            else
            {
              if(question.questionTypeId==2)
              {
                column.svg = this.icons.radio_false;
              }
              if(question.questionTypeId==3)
              {
                column.svg = this.icons.check_false;
              }
            }
            l.columns.push(column);
            column={};
            column.text=question.objectiveAnswer[i]+'\n\n';
            column.width='76%';
            l.columns.push(column);
            l.columns.push({width:'15%',text:''});
            this.contentObj.push(l);
          }
        }
      }
      // Answer Images are given index to access from image Array
      if(question.answerAttachment && answerKey==true)
      {
        this.contentObj.push({text:'Attachment(s):',style:'Image'});
        let x=1;
        for(let j=0;j<question.answerAttachment.length;j++)
        {
          if(question.answerAttachment[j].type == 'image')
          {
            l={};
            l.image=k.toString();
            l.width=400;
            l.style="Image";
            this.contentObj.push(l);
            k++;
          }
          else{
            l={};
            l.text=x+') '+question.answerAttachment[j].fileName+' **';
            l.style="Document";
            x++;
            this.contentObj.push(l);
          }
        }
      }
      i++;
    })
    this.contentObj.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]});
    if(this.zipFiles.length)
    {
      this.contentObj.push({text:'**- Please check downloaded zip for the attachment', style:'note'});
    }

    l={};
    l.columns=[];
    this.header1=[];
    column={};
    column.text='Grade: '+data.grade;
    column.style='subheader';
    l.columns.push(column)
    if(data.date)
    {
      column={};
      column.text='Date: '+data.date;
      column.style='subheader';
      column.alignment='right';
      l.columns.push(column)
    }
    l.margin=[ 0, 35, 5, 10 ];
    this.header1.push(l);

    l={};
    l.columns=[];
    this.header2=[];
    column={};
    column.text='Subject: '+data.subject;
    column.style='subheader';
    l.columns.push(column)
    if(data.totalmarks)
    {
      column={};
      column.text='Total Marks: '+parseFloat(data.totalmarks);
      column.style='subheader';
      column.alignment='right';
      l.columns.push(column)
    }
    l.margin=[ 0, 5, 5, 5 ];
    this.header2.push(l);

    this.header3=[];
    if(data.duration)
    {
      l={};
      l.text='Duration: '+data.duration+' mins';
      l.style='subheader';
      l.margin=[0,10,5,5];
      l.alignment='right';
      this.header3.push(l);
    }

    const documentDefinition: any = {
      footer: function (currentPage, pageCount) {
        var columns = [
          {
            text: data.footerText,
            alignment:'center',
            margin:[0,15,0,0]
          },
          {
            text:  'Page ' + currentPage.toString() + ' of ' + pageCount,
            width: 'auto',
            alignment: 'right',
            margin:[0,-15,20,0]
          }
          ]
        return columns;
      },
      content:[
        {
          columns:[{
            image:'logo',
            width:60,
            height:60
          },
          [
            {
              text: this.schoolName,
              style: 'schoolName'
            },
            {
              text: data.attachmentFileName,
              style: 'header'
            }
          ]],
        },
        this.header1,
        this.header2,
        this.header3,
        {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]},
        this.contentObj
      ],
      images:this.image,
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          color:'blue',
          alignment:'center',
          margin:[-20,10,0,0]
        },
        schoolName: {
          fontSize: 18,
          bold: true,
          alignment:'center',
          margin:[-20,10,0,0],
          decoration:'underline'
        },
        subheader: {
          fontSize: 12,
          bold: true
        },
        questionText:{
          bold:true
        },
        markText:{
          bold:false,
          alignment:'center',
          margin:[0,4,0,0]
        },
        textMargin:{
          margin:[0,10,0,10]
        },
        LeftMargin:{
          bold:false,
          margin:[30,0,0,0]
        },
        Image:{
          margin:[30,10,0,10]
        },
        top:{
          margin:[0,4,0,0]
        },
        correct:{
          color:'green',
          bold:true
        },
        Document:{
          color:'#070c70',
          margin:[30,0,0,10]
        },
        note:{
          color:'red'
        }
      },
      defaultStyle: {
        font: this.language,
        fontSize: this.fontSize
      }
    };

    this.zipAndDownload(documentDefinition, this.zipFiles, data.attachmentFileName);
  }

  zipAndDownload(documentContent, files:File[], name)
  {
    if(files.length)
    {
      var zip = new JSZip();
    //Add all files to zip
      files.forEach(file=>{
        var idx = file.url.indexOf('base64,') + 'base64,'.length;
        var content = file.url.substring(idx);
        zip.file(file.fileName, content, {base64:true});
      })

      // Adding generated pdf to the zip and downloading the zip
      pdfmake.createPdf(documentContent).getBlob(data=>{
          zip.file(name+'.pdf', data);
          zip.generateAsync({type:"blob"}).then(function(content) {
          saveAs(content, name+'.zip');
        });
      });
    }
    else
    {
      pdfmake.createPdf(documentContent).download(name);
    }
  }

  downloadGraph(canvas : HTMLCollectionOf<Element>, split: number)
  {
    this.contentObj=[];
    this.image=[];
    this.height=[];
    let x : number;
    let y : number;
    let l : TextLine={};

    for(let i=0;i<canvas.length;i++)
    {
      var img = canvas[i] as HTMLCanvasElement;
      this.image[i] = img.toDataURL("image/jpeg");
      this.height[i] = (img.height) / split;
    }

    for(let i=0;i<canvas.length;i++)
    {
      x = 0;
      y = this.height[i];
      l={};
      while(y>0)
      {
        l={};
        l.image=i.toString();
        l.height = this.height[i];
        l.width = 500;
        l.margin =[ 0, -x, 0, 0];
        if(y>840)
        {
          l.pageBreak = 'after';
        }
        this.contentObj.push(l);
        x = x + 840;
        y = y - 840;
      }
      this.contentObj.push({text:"\n\n\n"});
    }

    var docDefinition = {
      content: [
        this.contentObj
      ],
      images: this.image,
      defaultStyle: {
        font: 'Roboto',
        fontSize: this.fontSize
      }
    };
    pdfmake.createPdf(docDefinition).download('graph.pdf');
  }

  selectLanguage(language){
    if(language == 'Tamil' || language == 'Kannada' || language == 'Gujarati')
    {
      this.language = language;
    }
    else if(language == 'Hindi' || language == 'German' || language == 'French' || language == 'Spanish'
              || language == 'Sanskrit' || language == 'Marathi')
    {
      this.language = 'Poppins';
    }
  }
}
