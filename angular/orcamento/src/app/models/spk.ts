import { KeyValue } from '@angular/common';

export enum SpkEnum {
  sim = 1,
  simCirculacao,
}

export function spkList(): KeyValue<number, string>[] {
  return [
    { key: 1, value: 'Sim' },
    { key: 2, value: 'Sim - circulação' },
  ];
}
