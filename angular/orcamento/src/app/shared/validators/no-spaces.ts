import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noSpacesValidator(
  control: AbstractControl
): ValidationErrors | null {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { hasError: true };
}
