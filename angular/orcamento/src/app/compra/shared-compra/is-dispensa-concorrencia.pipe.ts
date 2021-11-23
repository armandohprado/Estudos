import { Pipe, PipeTransform } from '@angular/core';
import { CnGrupo } from '../models/cn-grupo';
import { isDispensaConcorrencia } from './util';

@Pipe({ name: 'isDispensaConcorrencia' })
export class IsDispensaConcorrenciaPipe implements PipeTransform {
  transform(grupo: CnGrupo): boolean {
    return isDispensaConcorrencia(grupo);
  }
}
