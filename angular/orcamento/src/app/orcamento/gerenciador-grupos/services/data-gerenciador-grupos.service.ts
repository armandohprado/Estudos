import { Injectable } from '@angular/core';
import { map, pluck, tap } from 'rxjs/operators';
import { GerenciadorGruposStore } from '../state/gerenciador-grupos.store';
import {
  CenarioGG,
  FamiliaGG,
  FamiliaGrupoOpc,
  GgGravarOpcionalResponse,
  GrupoGG,
  GrupoOpc,
} from '../state/gerenciador-grupo.model';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { OrcamentoGrupo } from '../../planilha-vendas-hibrida/models/grupo';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { GrupaoGerenciar, GrupoGerenciarViewModel } from '../../planilha-vendas-hibrida/models/gerenciar';
import { CenarioStatusEnum } from '@aw-models/cenario';
import { Grupao } from '@aw-models/grupao';
import { AwHttpParams } from '@aw-utils/http-params';
import { phMapGerenciadorGrupos } from '../../planilha-vendas-hibrida/shared/gerenciar-grupos/ph-gerenciador-grupos';

@Injectable({
  providedIn: 'root',
})
export class DataGerenciadorGruposService {
  constructor(private gerenciadorGruposStore: GerenciadorGruposStore, private http: HttpClient) {}

  targets = {
    baseUrlAw: `${environment.AwApiUrl}`,
    baseUrlScienza: `${environment.ApiUrl}orcamentos`,
  };

  getMappeadFamilias(idOrcamento: number): Observable<FamiliaGG[]> {
    return forkJoin([this.getCenarios(idOrcamento), this.getFamilias(idOrcamento)]).pipe(
      map(([cenarios, familias]) =>
        familias.map(familia => ({
          ...familia,
          grupos: orderBy(familia.grupos, orderByCodigo<GrupoGG>('codigoGrupo')).map(grupo => {
            return {
              ...grupo,
              cenarios: cenarios.map(cenarioHeader => {
                if (!cenarioHeader) return cenarioHeader;
                return {
                  ...cenarioHeader,
                  ...grupo.cenarios.find(cenario => cenario.idOrcamentoCenario === cenarioHeader?.idOrcamentoCenario),
                  idOrcamentoGrupo: grupo.idOrcamentoGrupo,
                };
              }),
              opcional: grupo.cenarios.some(cenario => cenario?.opcional),
            };
          }),
          orcamentoCenarioFamilias: cenarios.map(cenario => {
            if (!cenario) return null;
            const familiaCenario = familia.orcamentoCenarioFamilias.find(
              cen => cen?.idOrcamentoCenario === cenario.idOrcamentoCenario
            );
            return { ...familiaCenario, idCenarioStatus: cenario.idCenarioStatus, disabled: cenario.disabled };
          }),
        }))
      ),
      tap(familias => {
        this.gerenciadorGruposStore.set(familias);
        this.gerenciadorGruposStore.setLoading(false);
      })
    );
  }

  getFamilias(idOrcamento: number): Observable<FamiliaGG[]> {
    return this.http.get<FamiliaGG[]>(`${this.targets.baseUrlAw}gerenciador-grupos/${idOrcamento}`).pipe(
      map(familias => {
        return familias.map(familia => {
          return {
            ...familia,
            grupos: familia.grupos.map(grupo => {
              return {
                ...grupo,
                idOrcamentoFamilia: familia.idOrcamentoFamilia,
                idFamiliaCustomizada: familia.idFamiliaCustomizada,
              };
            }),
            orcamentoCenarioFamilias: new Array(Math.max(familia.orcamentoCenarioFamilias.length, 4))
              .fill(null)
              .map((o, i) => familia.orcamentoCenarioFamilias[i]),
          };
        });
      })
    );
  }

  getOrcamentoGruposModalSelecGrupos(
    idOrcamentoCenario: number,
    idFamilia = 0,
    idFamiliaCustomizada?: number
  ): Observable<Grupao[]> {
    const newIdFamilia = !!idFamiliaCustomizada ? idFamiliaCustomizada : idFamilia;
    const params = new AwHttpParams({ customizada: !!idFamiliaCustomizada }, true);
    return this.http
      .get<{ grupoes: Grupao[] }>(
        `${this.targets.baseUrlAw}gerenciador-grupos/orcamentos-cenario/${idOrcamentoCenario}/orcamentos-grupos/familia/${newIdFamilia}`,
        { params }
      )
      .pipe(pluck('grupoes'));
  }

  getCenarios(idOrcamento: number): Observable<CenarioGG[]> {
    return this.http.get<CenarioGG[]>(`${this.targets.baseUrlScienza}/${idOrcamento}/cenarios`).pipe(
      map(cenarios => {
        return cenarios.map(cenario => {
          return { ...cenario, disabled: cenario.idCenarioStatus !== CenarioStatusEnum.emEdicao };
        });
      }),
      map(obj => {
        return Array.from({ length: Math.max(obj.length, 4) }).map((_, index) => obj[index]);
      }),
      tap(cenarios => {
        this.gerenciadorGruposStore.update({ cenarios });
      })
    );
  }

  getGruposDuplicacao(idOrcamentoCenarioFamilia: number): Observable<GrupaoGerenciar[]> {
    return this.http
      .get<GrupoGerenciarViewModel[]>(
        `${this.targets.baseUrlAw}/gerenciador-grupos/orcamentos-cenarios-familias/${idOrcamentoCenarioFamilia}/orcamentos-grupos`
      )
      .pipe(map(phMapGerenciadorGrupos));
  }

  duplicarOrcamentoGrupo(
    idOrcamentoCenario: number,
    idOrcamentoGrupo: number,
    manterFornecedor = false,
    manterAtributos = false,
    manterQuantidades = false
  ): Observable<OrcamentoGrupo> {
    const url = `${this.targets.baseUrlAw}gerenciador-grupos/orcamentos-cenario/${idOrcamentoCenario}/orcamentos-grupos/${idOrcamentoGrupo}/duplicacao/${manterFornecedor}/${manterAtributos}/${manterQuantidades}`;
    return this.http.put<OrcamentoGrupo>(url, undefined);
  }

  updateOpcional(idOrcamentoCenarioGrupo: number): Observable<any> {
    return this.http.put<void>(
      `${this.targets.baseUrlAw}gerenciador-grupos/grupos-opcionais/${idOrcamentoCenarioGrupo}`,
      undefined
    );
  }

  gravarOpcional(
    idOrcamentoCenarioGrupo: number,
    payload: {
      idOrcamentoCenarioGrupoVinculoOpcional: number;
      tipoGrupoOpcional: number;
    }
  ): Observable<GgGravarOpcionalResponse> {
    payload.idOrcamentoCenarioGrupoVinculoOpcional =
      payload.idOrcamentoCenarioGrupoVinculoOpcional === 0 ? null : payload.idOrcamentoCenarioGrupoVinculoOpcional;
    return this.http.post<GgGravarOpcionalResponse>(
      `${this.targets.baseUrlAw}gerenciador-grupos/grupos-opcionais/${idOrcamentoCenarioGrupo}`,
      {
        idOrcamentoCenarioGrupoVinculoOpcional: payload.idOrcamentoCenarioGrupoVinculoOpcional,
        tipoGrupoOpcional: payload.tipoGrupoOpcional,
      }
    );
  }

  buscarFamiliasOpcionais(idOrcamentoCenario: number): Observable<FamiliaGrupoOpc[]> {
    return this.http.get<FamiliaGrupoOpc[]>(
      `${this.targets.baseUrlAw}gerenciador-grupos/orcamentos-cenario/${idOrcamentoCenario}/orcamentos-cenarios-familia`
    );
  }

  buscarGruposOpcionais(idOrcamentoCenarioFamilia: number): Observable<GrupoOpc[]> {
    return this.http
      .get<GrupoOpc[]>(
        `${this.targets.baseUrlAw}gerenciador-grupos/orcamentos-cenarios-familias/${idOrcamentoCenarioFamilia}/orcamentos-grupos-ativos`
      )
      .pipe(map(grupos => orderBy(grupos, orderByCodigo<GrupoOpc>('codigo'))));
  }
}
