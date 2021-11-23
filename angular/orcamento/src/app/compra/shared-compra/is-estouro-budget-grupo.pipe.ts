import { Pipe, PipeTransform } from '@angular/core';
import { CnGrupo } from '../models/cn-grupo';
import { isEstouroBudgetFromValue } from './util';

@Pipe({ name: 'isEstouroBudgetGrupo' })
export class IsEstouroBudgetGrupoPipe implements PipeTransform {
  transform(grupo: CnGrupo): boolean {
    return (
      !!grupo.grupoOrcamento && isEstouroBudgetFromValue(grupo.valorUtilizado, grupo.grupoOrcamento.valorSelecionado)
    );
  }
}
