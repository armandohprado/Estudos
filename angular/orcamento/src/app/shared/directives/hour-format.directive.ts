import { Directive, HostBinding, HostListener } from '@angular/core';

// TODO substituir pelo NgxMask <input mask="00:00">
@Directive({
  selector: '[appHourFormat]',
})
export class HourFormatDirective {
  @HostBinding('attr.maxlength')
  get maxLength(): number {
    return 5;
  }

  private keyPressEvent: string;

  constructor() {}

  @HostListener('input', ['$event'])
  onInputChange({ target }): void {
    if (!this.keyPressEvent || this.keyPressEvent !== 'Backspace') {
      const numChars = target.value.length;
      if (numChars === 2) {
        target.value += ':';
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    this.keyPressEvent = event.key;
  }
}
