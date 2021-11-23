import { Directive, ElementRef, HostListener } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { FormattedTelPipe } from '../pipes/formatted-tel.pipe';
import { IsTelPipe } from '../pipes/is-tel.pipe';
import { numeroEspecial } from '../pipes/helpers';
import { replacePattern } from '../pipes/replace-pattern/replace-pattern.pipe';
import { PatternEnum } from '../pipes/match-pattern/pattern.enum';

@Directive({
  selector: '[appTelephone]',
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: TelephoneDirective,
    },
  ],
})
export class TelephoneDirective implements Validator {
  private formattedTel = new FormattedTelPipe();
  private isTel = new IsTelPipe();

  constructor(private element: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event | any): void {
    if (event.inputType !== 'deleteContentBackward') {
      this.tel(event.target.value);
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      if (
        (numeroEspecial(control.value) && replacePattern(control.value, PatternEnum.onlyNumbers, '', 'g')) ||
        this.isTel.transform(control.value)
      ) {
        return null;
      } else {
        return { telefone: true };
      }
    }
    return null;
  }

  private tel(value: string): void {
    this.element.nativeElement.value = this.formattedTel.transform(value);
  }
}
