import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { mapFromFamiliaGruposToFamiliasAlt, mapGrupoAlt } from '@aw-services/orcamento-alt/orcamento-alt-utils';
import { FamiliaAlt, FamiliaAltTotal } from '@aw-models/familia-alt';
import { PaginacaoComRange } from '@aw-models/paginacao';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AwHttpParams } from '@aw-utils/http-params';
import { GrupoAltSimples } from '@aw-models/grupo-alt-simples';
import { FamiliaGrupoAlt } from '@aw-models/familia-grupo-alt';
import { GrupoAlt } from '@aw-models/grupo-alt';
import { GrupoItemOrdem } from '../../grupo/definicao-escopo/shared/grupo-item-ordem';
import { GrupoItemFiltroEnum } from '../../grupo/definicao-escopo/shared/de-grupo-item-filtro.pipe';

@Injectable({ providedIn: 'root' })
export class OrcamentoAltService {
  constructor(private http: HttpClient) {}

  private readonly _gruposMap$ = new BehaviorSubject<Map<number, GrupoAlt>>(new Map());
  readonly gruposMap$ = this._gruposMap$.asObservable();

  private _updateGrupo(idOrcamentoGrupo: number, partial: Partial<GrupoAlt>): void {
    const gruposMap = this._gruposMap$.value;
    const grupo = gruposMap.get(idOrcamentoGrupo);
    if (!grupo) {
      return;
    }
    this._gruposMap$.next(gruposMap.set(idOrcamentoGrupo, { ...grupo, ...partial }));
  }

  selectGrupo(idOrcamentoGrupo: number): Observable<GrupoAlt | undefined> {
    return this.gruposMap$.pipe(map(gruposMap => gruposMap.get(idOrcamentoGrupo)));
  }

  upsertGrupo(familiaGrupo: FamiliaGrupoAlt): void {
    const gruposMap = this._gruposMap$.value;
    const grupo = gruposMap.get(familiaGrupo.idOrcamentoGrupo);
    this._gruposMap$.next(gruposMap.set(familiaGrupo.idOrcamentoGrupo, { ...grupo, ...familiaGrupo }));
  }

  getFamiliasPaginacao(
    idOrcamento: number,
    idOrcamentoCenario: number,
    paginaAtual: number,
    totalPorPagina: number
  ): Observable<PaginacaoComRange<FamiliaAlt>> {
    const params = new AwHttpParams({ paginaAtual, totalPorPagina });
    return this.http
      .get<PaginacaoComRange<FamiliaGrupoAlt>>(
        `${environment.AwApiUrl}orcamento/${idOrcamento}/orcamento-cenarios/${idOrcamentoCenario}/orcamento-grupos`,
        { params }
      )
      .pipe(
        map(paginacao => ({
          ...paginacao,
          retorno: mapFromFamiliaGruposToFamiliasAlt(paginacao.retorno, idOrcamentoCenario),
          range: paginacao.range.map((range, index) => ({ ...range, pagina: index + 1 })),
        }))
      );
  }

  getFamilias(idOrcamento: number, idOrcamentoCenario: number): Observable<FamiliaAlt[]> {
    return this.getFamiliasPaginacao(idOrcamento, idOrcamentoCenario, 1, 999_999_999).pipe(pluck('retorno'));
  }

  getGrupo(idOrcamento: number, idOrcamentoCenario: number, idOrcamentoGrupo: number): Observable<GrupoAlt> {
    return this.http
      .get<GrupoAlt>(
        `${environment.AwApiUrl}orcamento/${idOrcamento}/orcamento-cenarios/${idOrcamentoCenario}/orcamento-grupos/${idOrcamentoGrupo}`
      )
      .pipe(
        map(grupo => mapGrupoAlt(grupo, idOrcamentoCenario)),
        tap(grupo => {
          this.upsertGrupo(grupo);
        })
      );
  }

  getGrupos(idOrcamento: number, idOrcamentoCenario: number): Observable<GrupoAltSimples[]> {
    return this.http.get<GrupoAltSimples[]>(
      `${environment.AwApiUrl}orcamento/${idOrcamento}/orcamento-cenarios/${idOrcamentoCenario}/grupos`
    );
  }

  getGruposFiltro(
    idOrcamento: number,
    idOrcamentoCenario: number,
    idOrcamentoGrupos: number[]
  ): Observable<FamiliaAlt[]> {
    const params = new AwHttpParams({ idOrcamentoGrupo: idOrcamentoGrupos });
    return this.http
      .get<FamiliaGrupoAlt[]>(
        `${environment.AwApiUrl}orcamento/${idOrcamento}/orcamento-cenarios/${idOrcamentoCenario}/orcamento-grupos/filtro`,
        { params }
      )
      .pipe(map(familias => mapFromFamiliaGruposToFamiliasAlt(familias, idOrcamentoCenario)));
  }

  getFamiliasTotais(idOrcamento: number, idOrcamentoCenario: number): Observable<FamiliaAltTotal[]> {
    return this.http.get<FamiliaAltTotal[]>(
      `${environment.AwApiUrl}orcamento/${idOrcamento}/orcamento-cenarios/${idOrcamentoCenario}/totais-familia`
    );
  }

  putFiltroOrdem(idOrcamentoGrupo: number, filtro: GrupoItemFiltroEnum, ordem: GrupoItemOrdem): Observable<void> {
    return this.http
      .put<void>(`${environment.AwApiUrl}orcamento-grupo/${idOrcamentoGrupo}/filtro`, { filtro, ordem })
      .pipe(
        tap(() => {
          this._updateGrupo(idOrcamentoGrupo, { ordem, filtro });
        })
      );
  }
}
