import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arredondamento',
})
export class ArredondamentoPipe implements PipeTransform {
  transform(value: number, casasDecimais = 2): number {
    return arredondamento(value, casasDecimais);
  }
}

export function arredondamento(value: number, casasDecimais = 2): number {
  return parseFloat(value.toFixed(casasDecimais));
}
