import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, OperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Cenario,
  CenarioStatusEnum,
  CenarioStatusPayload,
  OrcamentoCenarioPadrao,
  OrcamentoCenarioSimples,
} from '../../models';
import { environment } from '../../../environments/environment';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { refresh } from '@aw-utils/rxjs/operators';
import { AwRouterQuery } from '../core/router.query';
import { AwHttpParams } from '@aw-utils/http-params';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';

@Injectable({ providedIn: 'root' })
export class CenariosService {
  constructor(private http: HttpClient, private awRouterQuery: AwRouterQuery) {}

  private readonly _cenarioPadrao$ = new BehaviorSubject<OrcamentoCenarioPadrao | null>(null);
  readonly cenarioPadrao$ = this._cenarioPadrao$.asObservable();
  readonly cenarios$ = new BehaviorSubject<Cenario[]>(null);

  getCenarioPadraoSnapshot(): OrcamentoCenarioPadrao | null {
    const cenarioPadrao = this._cenarioPadrao$.value;
    return cenarioPadrao && { ...cenarioPadrao };
  }

  getCenarios(idOrcamento: number, idOrcamentoCenario: number): Observable<Cenario[]> {
    const params = new AwHttpParams({ idOrcamentoCenario });
    return this.http
      .get<Cenario[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/cenarios`, { params })
      .pipe(tap(cenarios => this.cenarios$.next(cenarios)));
  }

  createCenario(idOrcamento: number, cenario: Cenario): Observable<Cenario[]> {
    return this.http
      .post<Cenario[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/cenarios`, cenario)
      .pipe(this.refreshCenarios(idOrcamento));
  }

  duplicateCenario(
    idOrcamento: number,
    idOrcamentoCenario: number,
    nomeOrcamentoCenario: string
  ): Observable<Cenario[]> {
    return this.http
      .put<Cenario[]>(
        `${environment.AwApiUrl}planilha-vendas-hibrida/DuplicarCenario/${idOrcamentoCenario}/${nomeOrcamentoCenario}`,
        { idOrcamentoCenario }
      )
      .pipe(this.refreshCenarios(idOrcamento));
  }

  editCenario(idOrcamento: number, cenario: Cenario): Observable<Cenario[]> {
    return this.http
      .put<Cenario[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/cenarios`, cenario)
      .pipe(this.refreshCenarios(idOrcamento));
  }

  alterarStatus(idOrcamento: number, idOrcamentoCenario: number, idStatus: number): Observable<Cenario[]> {
    const payload = {
      IdOrcamentoCenario: idOrcamentoCenario,
      idCenarioStatus: idStatus,
      data: new Date(),
    };
    return this.http
      .post<Cenario[]>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/cenarios/${idOrcamentoCenario}/atualizar-status`,
        payload
      )
      .pipe(this.refreshCenarios(idOrcamento));
  }

  revisarCenario(
    idOrcamento: number,
    idOrcamentoCenario: number,
    payload: CenarioStatusPayload
  ): Observable<Cenario[]> {
    return this.http
      .post<Cenario[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/cenarios/${idOrcamentoCenario}/revisar`, payload)
      .pipe(this.refreshCenarios(idOrcamento));
  }

  getStatus(idOrcamentoCenario: number): Observable<CenarioStatusEnum> {
    return this.http.get<CenarioStatusEnum>(
      `${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/status-atual`
    );
  }

  private refreshCenarios<T>(idOrcamento: number): OperatorFunction<T, T> {
    const idOrcamentoCenario =
      this.getCenarioPadraoSnapshot()?.idOrcamentoCenarioPadrao ??
      +this.awRouterQuery.getParams(RouteParamEnum.idOrcamentoCenario);
    return refresh(this.getCenarios(idOrcamento, idOrcamentoCenario));
  }

  getRelacionados(idOrcamentoCenario: number): Observable<OrcamentoCenarioSimples[]> {
    return this.http
      .get<OrcamentoCenarioSimples[]>(`${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/relacionados`)
      .pipe(orderByOperator('idOrcamentoCenario'));
  }

  getPadrao(idOrcamentoCenario: number): Observable<OrcamentoCenarioPadrao> {
    return this.http
      .get<OrcamentoCenarioPadrao>(`${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/padrao`)
      .pipe(
        tap(cenarioPadrao => {
          this._cenarioPadrao$.next(cenarioPadrao);
        })
      );
  }
}
