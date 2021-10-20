import { Observable } from 'rxjs';
import { Component, forwardRef, Input, OnInit, ViewChild, AfterViewInit, ElementRef, Optional } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NgForm, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { BlurEvent, ChangeEvent, CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditor),
      multi: true,
    },
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})

export class RichTextEditor implements OnInit, AfterViewInit, ControlValueAccessor, Validator  {

  public Editor =  ClassicEditor;
  @Input() id: String ;
  @Input() editorData: String;

  onChange: Function = (value:any) => {};
  onTouched: Function = () => {};


  @ViewChild(CKEditorComponent) editorComponent: CKEditorComponent;
  isReady: boolean = false;

  public editorConfig = {
    placeholder: 'Type the content here!',
  };

  constructor() { }

  validate(control: AbstractControl): ValidationErrors{
    //throw new Error('Method not implemented.');
    return { required: true };
  }

  registerOnValidatorChange?(fn: () => void): void {
    throw new Error('Method not implemented.');
  }

  ngAfterViewInit(): void {
    this.Editor = ClassicEditor;
  }

  ngOnInit() {
  }

  resetEditor()
  {
    this.getEditor().setData('');
    this.editorData = '';
    this.onChange('');
    //this.onTouched();
  }

  getEditor() {
    return this.editorComponent.editorInstance;
  }

  getEditorContent()
  {
    if (this.getEditor())
    {
      return this.getEditor().getData();
    }
    else return '';
  }

  writeValue(value) {
    if (value)
    {
      if (this.isReady)
      {
        this.getEditor().setData(value);
        this.editorData = value;
      }
      else
      {
        setTimeout(() => {
          this.getEditor().setData(value);
          this.editorData = value;
        }, 3000);
      }
    }
    this.onChange(value);
    this.onTouched();
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function)
  {
    this.onTouched = fn;
  }

  get value() {
    return this.getEditorContent();
  }

  set value(val:any) {
    if (val)
    {
      if (this.isReady)
      {
        this.getEditor().setData(val);
        this.editorData = val;
      }
      else
      {
        setTimeout(() => {
          this.getEditor().setData(val);
          this.editorData = val;
        }, 3000);
      }
    }
    this.onChange(val);
    this.onTouched();
  }

  change({ editor }: ChangeEvent) {
    //To be implemented in case it is required
    if (editor)
    {
      this.editorData = editor.getData();
    }
    this.onChange(this.editorData);
    this.onTouched();
  }

  blur({ editor }: BlurEvent)
  {
    // To be implemented in case it is required
    // this.editorData = editor.getData();
    // this.onChange(this.editorData);
    // this.onTouched();
  }
  readyEditor(event)
  {
    this.isReady = true;

  }

}
