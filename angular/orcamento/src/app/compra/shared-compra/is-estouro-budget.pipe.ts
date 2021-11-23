import { Pipe, PipeTransform } from '@angular/core';
import { isEstouroBudgetFromValue } from './util';

@Pipe({ name: 'isEstouroBudget' })
export class IsEstouroBudgetPipe implements PipeTransform {
  transform(valorUtilizado: number, valorSelecionado: number): boolean {
    return isEstouroBudgetFromValue(valorUtilizado, valorSelecionado);
  }
}
