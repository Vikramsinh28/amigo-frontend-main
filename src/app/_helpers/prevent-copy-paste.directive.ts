import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[PreventCopyPaste]'
})
export class PreventCopyPasteDirective {

  constructor() { }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

}
