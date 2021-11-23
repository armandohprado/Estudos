import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PlanilhaClienteFiltro,
  PlanilhaClienteItem,
  PlanilhaClienteOrcamentoGrupoItemPayload,
  PlanilhaClienteOrcamentoGrupoItemResponse,
} from '@aw-models/planilha-cliente';
import { AwHttpParams } from '@aw-utils/http-params';
import { auditTime, map, tap } from 'rxjs/operators';
import { IdDescricao } from '@aw-models/id-descricao';

@Injectable({ providedIn: 'root' })
export class PlanilhaClienteService {
  constructor(private http: HttpClient) {}

  private _target = environment.AwApiUrl + 'planilha-cliente';

  private _selecionados$ = new BehaviorSubject<Map<number, PlanilhaClienteItem | null>>(new Map());
  private _refreshComponents$ = new Subject<void>();
  private _urlPlanilhaClienteLegado = `${environment.centralizacao}Projetos/Web/AdministracaoPlanilhaCliente?idOrcamento=`;

  refreshComponent$ = this._refreshComponents$.pipe(auditTime(250));

  getUrlPlanilhaClienteLegado(idOrcamento: number): string {
    return `${this._urlPlanilhaClienteLegado}${idOrcamento}`;
  }

  refresh(): void {
    this._refreshComponents$.next();
  }

  selectSelecionado(idOrcamentoGrupoItem: number): Observable<PlanilhaClienteItem | null> {
    return this._selecionados$.pipe(map(selecionados => selecionados.get(idOrcamentoGrupoItem) ?? null));
  }

  buscarItens(
    idOrcamento: number,
    idOrcamentoGrupoItem: number,
    nivel: number,
    termo: string
  ): Observable<PlanilhaClienteItem[]> {
    const params = new AwHttpParams({ nivel, termo, idOrcamentoGrupoItem, totalPorPagina: 100 }, true);
    return this.http.get<PlanilhaClienteItem[]>(`${this._target}/orcamento/${idOrcamento}`, { params });
  }

  associarOrcamentoGrupoItem(
    item: PlanilhaClienteItem,
    idOrcamento: number,
    payload: PlanilhaClienteOrcamentoGrupoItemPayload
  ): Observable<PlanilhaClienteOrcamentoGrupoItemResponse> {
    return this.http
      .post<PlanilhaClienteOrcamentoGrupoItemResponse>(`${this._target}/orcamento/${idOrcamento}`, payload)
      .pipe(
        tap(({ idPlanilhaClienteItemOrcamentoGrupoItem }) => {
          this._selecionados$.next(
            this._selecionados$.value.set(payload.idOrcamentoGrupoItem, {
              ...item,
              idPlanilhaClienteItemOrcamentoGrupoItem,
            })
          );
        })
      );
  }

  buscarFiltros(idOrcamento: number): Observable<PlanilhaClienteFiltro[]> {
    return this.http
      .get<PlanilhaClienteFiltro[]>(`${this._target}/orcamento/${idOrcamento}/filtro`)
      .pipe(map(filtros => filtros.map((filtro, index) => ({ ...filtro, selecionado: !index }))));
  }

  buscarItemAssociadoOrcamentoGrupoItem(idOrcamentoGrupoItem: number): Observable<PlanilhaClienteItem> {
    return this.http
      .get<PlanilhaClienteItem>(`${this._target}/orcamento-grupo-item/${idOrcamentoGrupoItem}/item-selecionado`)
      .pipe(
        tap(planilhaClienteItem => {
          this._selecionados$.next(this._selecionados$.value.set(idOrcamentoGrupoItem, planilhaClienteItem));
        })
      );
  }

  deletarPlanilhaClienteItemOrcamentoGrupoItem(
    idPlanilhaClienteItemOrcamentoGrupoItem: number,
    idOrcamentoGrupoItem?: number
  ): Observable<void> {
    return this.http.delete<void>(`${this._target}/${idPlanilhaClienteItemOrcamentoGrupoItem}`).pipe(
      tap(() => {
        if (idOrcamentoGrupoItem) {
          this._selecionados$.next(this._selecionados$.value.set(idOrcamentoGrupoItem, null));
        }
      })
    );
  }

  getPavimentos(idOrcamento: number, idOrcamentoGrupoItem: number): Observable<number[]> {
    return this.http
      .get<IdDescricao[]>(`${this._target}/orcamento/${idOrcamento}/grupo-item/${idOrcamentoGrupoItem}/pavimentos`)
      .pipe(map(pavimentos => pavimentos.map(pavimento => pavimento.id)));
  }
}
