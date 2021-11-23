import { Pipe, PipeTransform } from '@angular/core';
import { CurvaAbcGrupo } from '../../models';
import { getEstimatedValue } from './helper';

@Pipe({ name: 'valorConsideradoGrupo' })
export class ValorConsideradoGrupoPipe implements PipeTransform {
  transform(grupo: CurvaAbcGrupo): number {
    return getEstimatedValue(grupo);
  }
}
