import { AfterContentInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[autoFocus]'
})
export class AutoFocusDirective  implements AfterContentInit {

  public constructor(private el: ElementRef) {}

  public ngAfterContentInit() {
    //setTimeout(() => {
        this.el.nativeElement.focus();
    //}, 500);
}
}
