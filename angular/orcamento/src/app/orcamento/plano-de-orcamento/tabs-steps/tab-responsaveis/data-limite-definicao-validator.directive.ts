import { Directive, ElementRef, HostListener } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { isBefore, isValid } from 'date-fns';

@Directive({
  selector: '[appDataLimiteDefinicaoValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DataLimiteDefinicaoValidatorDirective,
      multi: true,
    },
  ],
})
export class DataLimiteDefinicaoValidatorDirective implements Validator {
  private onchangeValidate: () => void;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('change')
  onChange(): void {
    if (this.onchangeValidate) {
      this.onchangeValidate();
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onchangeValidate = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const idGroup = this.el.nativeElement.id.split('_').pop();
    if (
      control.value &&
      isValid(control.value) &&
      control.parent &&
      control.parent.controls[`dataLimiteRecebimento_${idGroup}`] &&
      control.parent.controls[`dataLimiteRecebimento_${idGroup}`].value &&
      isBefore(control.parent.controls[`dataLimiteRecebimento_${idGroup}`].value, control.value)
    ) {
      return { maxDateLimiteRecebimento: true };
    } else if (control.value && !isValid(control.value)) {
      return { invalidDate: true };
    }

    return null;
  }
}
