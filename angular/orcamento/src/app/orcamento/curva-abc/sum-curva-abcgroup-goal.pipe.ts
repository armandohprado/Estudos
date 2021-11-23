import { Pipe, PipeTransform } from '@angular/core';
import { CurvaAbcGrupo } from '../../models';
import { getEstimatedValue, getTotalGoalValue } from './helper';

export function sumCurvaABCGroupGoal(grupos: CurvaAbcGrupo[]): { totalGoalValue: number; totalEstimatedValue: number } {
  return (grupos ?? []).reduce(
    (accum, grupo) => {
      accum.totalGoalValue += getTotalGoalValue(grupo);
      accum.totalEstimatedValue += getEstimatedValue(grupo);
      return accum;
    },
    { totalGoalValue: 0, totalEstimatedValue: 0 }
  );
}

@Pipe({ name: 'sumCurvaABCGroupGoal' })
export class SumCurvaABCGroupGoalPipe implements PipeTransform {
  transform(groups: CurvaAbcGrupo[]): { totalGoalValue: number; totalEstimatedValue: number } {
    return sumCurvaABCGroupGoal(groups);
  }
}
