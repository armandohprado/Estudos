import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector:
    ':not(input[type="checkbox"]):not(input[type="radio"])input[dateMask]',
})
export class DateFormatDirective {
  @Input() timeFormat: boolean;

  @HostBinding('attr.maxlength')
  get maxLength(): number {
    return this.timeFormat ? 19 : 11;
  }

  private keyPressEvent: string;

  constructor() {}

  @HostListener('input', ['$event'])
  onInputChange({ target }): void {
    if (!this.keyPressEvent || this.keyPressEvent !== 'Backspace') {
      const numChars = target.value.length;
      if (numChars === 2 || numChars === 5) {
        target.value += '/';
      }

      if (numChars === 11 && this.timeFormat) {
        target.value += ' às ';
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    this.keyPressEvent = event.key;
  }
}
