import { TrackByFunction } from '@angular/core';

export interface CheckListCor {
  id: number;
  cor: string;
  descricao: string;
}

export const CheckListCorLinha = new Map<number, string>([
  [1, '#a7b3bd'],
  [2, '#a8c6e6'],
  [3, '#ffd966'],
]);

export const trackByCheckListCor: TrackByFunction<CheckListCor> = (_, element) => element.id;
