import { AbstractControl, ValidationErrors } from '@angular/forms';

export function maiorZero(control: AbstractControl): ValidationErrors | null {
  if (control.value === 0 || !control.value) {
    return { maiorZero: true };
  }
  return null;
}
