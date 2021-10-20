import { Directive, HostListener, ElementRef, Input } from '@angular/core';
@Directive({
    selector: '[specialCharacter]'
})
export class SpecialCharacter {

    mode1RegexStr = '^[a-zA-Z]*$';
    mode2RegexStr = '^[0-9]*$';
    mode3RegexStr = '^[a-zA-Z0-9 ]*$';
    mode4RegexStr = '^[a-zA-Z0-9-._ ]*$';
    mode5RegexStr = '^[^`~^]*$';
    @Input('specialCharacter') mode: any;

    constructor(private el: ElementRef) { }


    @HostListener('keypress', ['$event']) onKeyPress(event) {
        // Different mode for different use cases.
        switch (this.mode) {
            case 1:
                return new RegExp(this.mode1RegexStr).test(event.key);
            case 2:
                return new RegExp(this.mode2RegexStr).test(event.key);
            case 3:
                return new RegExp(this.mode3RegexStr).test(event.key);
            case 4:
                return new RegExp(this.mode4RegexStr).test(event.key);
            case 5:
                return new RegExp(this.mode5RegexStr).test(event.key);
            default:
                return new RegExp(this.mode4RegexStr).test(event.key);
        }
    }

    @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
        this.validateFields(event);
    }

    validateFields(event) {
        let mode1ReplaceRegexStr: any = /[^a-zA-Z]/g;          // Replace string for this.mode1RegexStr
        let mode2ReplaceRegexStr: any = /[^0-9]/g;             // Replace string for this.mode2RegexStr
        let mode3ReplaceRegexStr: any = /[^a-zA-Z0-9 ]/g;      // Replace string for this.mode3RegexStr
        let mode4ReplaceRegexStr: any = /[^a-zA-Z0-9-._ ]/g;   // Replace string for this.mode4RegexStr
        let mode5ReplaceRegexStr: any = /[`~^]/g;   // Replace string for this.mode5RegexStr

        setTimeout(() => {
            switch (this.mode) {
                case 1:
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(mode1ReplaceRegexStr, '');
                    event.preventDefault();
                    break;
                case 2:
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(mode2ReplaceRegexStr, '');
                    event.preventDefault();
                    break;
                case 3:
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(mode3ReplaceRegexStr, '');
                    event.preventDefault();
                    break;
                case 4:
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(mode4ReplaceRegexStr, '');
                    event.preventDefault();
                    break;
                case 5:
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(mode5ReplaceRegexStr, '');
                    event.preventDefault();
                    break;
                default:
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(mode4ReplaceRegexStr, '');
                    event.preventDefault();
                    break;
            }

        }, 100)
    }

}