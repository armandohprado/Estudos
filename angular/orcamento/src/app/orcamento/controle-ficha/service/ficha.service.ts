import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs/operators';
import { AwFilterPipeProperties } from '@aw-components/aw-filter/aw-filter.pipe';
import { ControleFichaContrato, ControleFichaGrupo, ControleFicha } from '../models/fichas';
import { HttpClient } from '@angular/common/http';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';

@Injectable({
  providedIn: 'root',
})
export class FichaService {
  constructor(private http: HttpClient) {}

  _body$ = new BehaviorSubject<ControleFicha[]>([]);
  body$ = this._body$.asObservable();

  filtros: AwFilterPipeProperties<ControleFicha> = {};
  loadingFicha = false;
  _contratos$ = new BehaviorSubject<ControleFichaContrato[]>([]);
  contratos$ = this._contratos$.asObservable();

  private target = {
    orcamentoCenario: 'compras-negociacao/orcamento-cenarios',
    orcamentos: 'compras-negociacao/orcamentos',
    fichas: 'fichas',
    contratos: 'contratos',
    grupos: 'grupos',
  };

  getListaFichas(idOrcamentoCenario: number): Observable<ControleFicha[]> {
    this.loadingFicha = true;
    return this.http
      .get<ControleFicha[]>(
        `${environment.AwApiUrl}${this.target.orcamentoCenario}/${idOrcamentoCenario}/${this.target.fichas}`
      )
      .pipe(
        orderByOperator(orderByCodigoWithoutDefinedNumberOfDots<ControleFicha>('codigo')),
        tap(listaFicha => {
          this.setListaFichas(listaFicha);
        })
      );
  }

  getContratos(idOrcamento: number): Observable<ControleFichaContrato[]> {
    return this.http
      .get<ControleFichaContrato[]>(
        `${environment.AwApiUrl}${this.target.orcamentos}/${idOrcamento}/${this.target.fichas}/${this.target.contratos}`
      )
      .pipe(
        tap(contratos => {
          this._contratos$.next(contratos);
        })
      );
  }

  getGrupos(idOrcamentoCenario: number): Observable<ControleFichaGrupo[]> {
    return this.http.get<ControleFichaGrupo[]>(
      `${environment.AwApiUrl}${this.target.orcamentoCenario}/${idOrcamentoCenario}/${this.target.fichas}/${this.target.grupos}
        `
    );
  }

  setListaFichas(listaFicha: ControleFicha[]): void {
    this._body$.next(listaFicha);
    this.loadingFicha = false;
  }
}
