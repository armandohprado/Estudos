import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type DadosDashBoard<A, B> = [A, B];

@Injectable({
  providedIn: 'root',
})
export class DadosService {
  readonly dados: DadosDashBoard<string, number>[] = [
    ['Janeiro', 33],
    ['Fevereiro', 68],
    ['Março', 49],
    ['Abril', 25],
    ['Maio', 80],
    ['Junho', 27],
  ];
  constructor() {}

  obterDados(): Observable<any> {
    return of(this.dados);
  }
}
