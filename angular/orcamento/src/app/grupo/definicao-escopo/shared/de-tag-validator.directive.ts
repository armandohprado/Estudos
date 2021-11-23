import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { GrupoItem } from '../model/grupo-item';

@Directive({
  selector: '[deTagValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DeTagValidatorDirective,
      multi: true,
    },
  ],
})
export class DeTagValidatorDirective implements Validator {
  constructor() {}

  @Input('deTagValidator')
  idOrcamentoGrupoItem: number;

  @Input()
  gruposItens: GrupoItem[];

  validate({ value }: AbstractControl): ValidationErrors | null {
    if (
      !this.gruposItens ||
      !this.gruposItens.length ||
      !value ||
      !this.idOrcamentoGrupoItem
    ) {
      return null;
    }
    const invalid = this.gruposItens
      .filter(
        ({ ativo, idOrcamentoGrupoItem }) =>
          idOrcamentoGrupoItem !== this.idOrcamentoGrupoItem && ativo
      )
      .some(({ tag }) => tag === value);
    return invalid ? { invalidTag: true } : null;
  }
}
