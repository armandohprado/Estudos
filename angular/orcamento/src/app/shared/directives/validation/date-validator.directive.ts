import { Directive, HostListener } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { isValid } from 'date-fns';

@Directive({
  selector: '[appDateValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DateValidatorDirective,
      multi: true,
    },
  ],
})
export class DateValidatorDirective implements Validator {
  private onchangeValidate: () => void;

  constructor() {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    if (isValid(new Date(control.value))) {
      return null;
    }
    return { invalidDate: true };
  }

  @HostListener('change')
  onChange(): void {
    if (this.onchangeValidate) {
      this.onchangeValidate();
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onchangeValidate = fn;
  }
}
