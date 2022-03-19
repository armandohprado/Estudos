import { Pipe, PipeTransform } from '@angular/core';
import { CnMigracaoBudgetGrupo } from '../../../../../../../../models/cn-migracao-budget-grupo';

@Pipe({ name: 'cnMigracaoBudgetGruposInvalid' })
export class CnMigracaoBudgetGruposInvalidPipe implements PipeTransform {
  transform(grupos: CnMigracaoBudgetGrupo[]): boolean {
    return !grupos?.some(grupo => grupo.transferencia);
  }
}
