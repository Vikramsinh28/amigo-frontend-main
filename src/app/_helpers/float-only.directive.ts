import { Directive, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from './common';

@Directive({
  selector: 'input[floatOnly]'
})
export class FloatOnlyDirective {

  @Input('floatOnly') params: any = {mode: "default", minVal: 0, maxVal: 0, errorMessage:''};  //default, MimMax, MinOnly, MaxOnly
  @Output() afterBlur = new EventEmitter();

  constructor(private _el: ElementRef, private snackBar: CommonService) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    let newValue = initalValue.replace(/[^0-9.]/g, '');

    if (newValue.split('.').length > 2) {
      newValue = newValue.substring(0, newValue.length - 1);
    }

    this._el.nativeElement.value = newValue;
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

  @HostListener("blur", ["$event"])
  onBlur(event) {
    let target = event.target;
    if (!this.checkValueRange(target.value))
    {
      target.value = '';
      if(!this.params.errorMessage)
      {
        this.snackBar.showErrorMsg("Value should be between "+ this.params.minVal + " and " + this.params.maxVal);
      }
      else
      {
        this.snackBar.showErrorMsg(this.params.errorMessage);
      }
    }
    this.afterBlur.emit(event);
  }

  checkValueRange(value : number)
  {
    switch(this.params.mode) {
      case "minMax": {
         return (value >= this.params.minVal && value <= this.params.maxVal)
      }
      case "minOnly": {
        return (value >= this.params.minVal)
     }
     case "maxOnly": {
        return (value <= this.params.maxVal)
   }
      default: {
         return true;
      }
   }
  }

}
