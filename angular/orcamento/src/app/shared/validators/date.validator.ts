import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isValid } from 'date-fns';

export function dateValidator(control: AbstractControl): ValidationErrors {
  if (!control.value) {
    return null;
  }
  if (isValid(control.value)) {
    return null;
  }
  return { invalidDate: true };
}
