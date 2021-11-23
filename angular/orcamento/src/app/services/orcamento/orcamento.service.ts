import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, combineLatest, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import {
  Contato,
  Datas,
  Edificio,
  ExistePlanoCompraNegociacao,
  Familia,
  FamiliaCustomizada,
  Grupao,
  Grupo,
  Orcamento,
  Projeto,
  StatusPropostaValorOrcamento,
} from '../../models';
import { environment } from '../../../environments/environment';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { isFunction, minBy, unionWith } from 'lodash-es';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { OrcamentoGrupo } from '@aw-models/orcamentoGrupo';
import { AwHttpParams } from '@aw-utils/http-params';
import { TitleCasePipe } from '@angular/common';
import { FormattedTelPipe } from '@aw-shared/pipes/formatted-tel.pipe';
import { EnvioCotacaoPayload } from '@aw-models/envio-cotacao-payload';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { formatISO } from 'date-fns';
import { catchAndThrow, reduceToFunc, refresh, refreshMap } from '@aw-utils/rxjs/operators';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { statusBudgetValue } from '../../grupo/status-budget-value.pipe';

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  constructor(private http: HttpClient) {}

  private readonly _grupoesMap = new Map<string, Grupao>();

  readonly titleCasePipe = new TitleCasePipe();
  readonly formattedTelPipe = new FormattedTelPipe();

  readonly orcamento$ = new BehaviorSubject<Orcamento>(null);
  readonly familiasLoading$ = new BehaviorSubject<boolean>(false);
  readonly familias$ = new BehaviorSubject<Familia[]>([]);
  readonly visualizarGruposEmLista$ = new BehaviorSubject<boolean>(false);
  readonly projeto$ = new BehaviorSubject<Projeto>(null);

  readonly mappedFamilies$ = this.familias$.pipe(map(familias => familias.filter(familia => familia.grupoes?.length)));

  getContatosFornecedor(idOrcamento: number, idGrupo: number): Observable<Contato[]> {
    return this.http
      .get<Contato[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/contatos-fornecedor`)
      .pipe(
        map(contatos =>
          contatos.map(contato => {
            let contatoInfo = contato.nome;
            if (contato.telefonePrincipal) {
              contatoInfo += ` - ${this.formattedTelPipe.transform(contato.telefonePrincipal)}`;
            }
            if (contato.email) {
              contatoInfo += ` - ${contato.email}`;
            }
            contatoInfo = this.titleCasePipe.transform(contatoInfo);
            return { ...contato, contatoInfo };
          })
        )
      );
  }

  clearGrupoesMap(): void {
    this._grupoesMap.clear();
  }

  alterarModoVisualizacao(): Observable<Familia[]> {
    return combineLatest([this.familias$, this.visualizarGruposEmLista$]).pipe(
      map(([familias, flag]) => {
        if (!flag) {
          const grupoes = reduceToFunc(familias, 'grupoes');
          return [
            {
              descricaoFamilia: 'Padrão',
              grupoes: orderBy(
                grupoes.filter(grupao => grupao.idFamilia),
                'numeroGrupao'
              ),
              numeroFamilia: 1,
              ordemFamilia: 0,
              idFamilia: 0,
              idOrcamentoFamilia: 0,
            },
            ...familias.filter(familia => familia.idFamiliaCustomizada),
          ];
        } else {
          return familias;
        }
      })
    );
  }

  setGrupoesMap(familias: Familia[]): void {
    this.clearGrupoesMap();
    familias.forEach(familia => {
      familia.grupoes.forEach(grupao => {
        const key = getIdGrupao(grupao);
        this._grupoesMap.set(key, grupao);
      });
    });
  }

  retrieveProject(projetoId: number, includeExisteCompras?: boolean): Observable<Projeto> {
    let http$: Observable<any> = this.http.get<Projeto>(`${environment.ApiUrl}projetos/${projetoId}`).pipe(
      map(projeto => ({
        ...projeto,
        orcamentos: (projeto.orcamentos ?? []).map(orcamento => ({
          ...orcamento,
          orcamentoCenarioPadrao: minBy(orcamento.orcamentoCenario ?? [], 'idOrcamentoCenario'),
          edificios: (orcamento.edificios ?? []).map(edificio => ({
            ...edificio,
            isDisabled: !edificio.canRemove,
          })),
        })),
      }))
    );
    if (includeExisteCompras) {
      http$ = http$.pipe(switchMap(this.includeExisteCompras.bind(this)));
    }
    return http$.pipe(
      tap(projeto => {
        this.projeto$.next(projeto);
      })
    );
  }

  getExistePlanoCompraNegociacaoMultiple(idOrcamentoCenarios: number[]): Observable<ExistePlanoCompraNegociacao[]> {
    const params = new AwHttpParams({ idOrcamentoCenario: idOrcamentoCenarios });
    return this.http.get<ExistePlanoCompraNegociacao[]>(
      `${environment.AwApiUrl}orcamento-cenario/existe-plano-compra-negociacao`,
      { params }
    );
  }

  includeExisteCompras(projeto: Projeto): Observable<Projeto> {
    let requests$: Observable<Projeto>;
    if (projeto.orcamentos.some(orcamento => orcamento.orcamentoCenarioPadrao?.idOrcamentoCenario)) {
      const idOrcamentoCenarios = new Set<number>();
      for (const orcamento of projeto.orcamentos) {
        if (orcamento.orcamentoCenarioPadrao?.idOrcamentoCenario) {
          idOrcamentoCenarios.add(orcamento.orcamentoCenarioPadrao.idOrcamentoCenario);
        }
      }
      requests$ = this.getExistePlanoCompraNegociacaoMultiple([...idOrcamentoCenarios]).pipe(
        map(existeCompras => ({
          ...projeto,
          orcamentos: projeto.orcamentos.map(orcamento => {
            if (
              orcamento.orcamentoCenarioPadrao?.idOrcamentoCenario &&
              idOrcamentoCenarios.has(orcamento.orcamentoCenarioPadrao?.idOrcamentoCenario)
            ) {
              const existeCompra = existeCompras.find(
                _existeCompra =>
                  _existeCompra.idOrcamentoCenario === orcamento.orcamentoCenarioPadrao.idOrcamentoCenario
              );
              orcamento = {
                ...orcamento,
                orcamentoCenarioPadrao: { ...orcamento.orcamentoCenarioPadrao, ...existeCompra },
              };
            }
            return orcamento;
          }),
        }))
      );
    } else {
      requests$ = of(null).pipe(map(() => projeto));
    }
    return requests$;
  }

  saveOrcamento(orcamento: Orcamento): Observable<Orcamento> {
    if (orcamento.idOrcamento) {
      return this.updateOrcamento(orcamento);
    }
    return this.http.post<Orcamento>(`${environment.ApiUrl}orcamentos`, orcamento);
  }

  retrieveBuildings(idProjeto: number): Observable<Edificio[]> {
    return this.http.get<Edificio[]>(`${environment.ApiUrl}projetos/${idProjeto}/edificios`).pipe(
      map(edificios =>
        edificios.map(edificio => ({
          ...edificio,
          idOrcamentoProjetoEdificio: edificio.idOrcamentoProjetoEdificio ?? 0,
          idOrcamento: edificio.idOrcamento ?? 0,
        }))
      )
    );
  }

  deleteOrcamento(idConfiguracaoOrcamento: number): Observable<Orcamento> {
    return this.http.delete<Orcamento>(`${environment.ApiUrl}orcamentos/${idConfiguracaoOrcamento}`);
  }

  buscarFamilias(orcamento: Orcamento, idOrcamentoCenario: number): Observable<Familia[]> {
    this.familiasLoading$.next(true);
    const params = new AwHttpParams({ idOrcamentoCenario }, true);
    return this.http
      .get<Familia[]>(`${environment.ApiUrl}orcamentos/${orcamento.idOrcamento}/familias`, {
        params,
      })
      .pipe(
        map(familias => this.setSelectedGroupsToFamilies(orcamento, familias)),
        finalize(() => {
          this.familiasLoading$.next(false);
        }),
        tap(familias => {
          this.familias$.next(familias);
        })
      );
  }

  getFamilia(
    idOrcamento: number,
    idFamilia: number,
    customizada: boolean,
    idOrcamentoCenario: number
  ): Observable<Familia> {
    let params = new HttpParams();
    if (customizada) {
      params = params.set('customizada', '' + customizada);
    }
    params = params.set(RouteParamEnum.idOrcamentoCenario, '' + idOrcamentoCenario);
    return this.http
      .get<Familia>(`${environment.ApiUrl}orcamentos/${idOrcamento}/familias/${idFamilia}`, { params })
      .pipe(map(familia => ({ ...familia, idFamilia: familia.idFamilia ?? 0 })));
  }

  buscarOrcamento(idOrcamento: number, idOrcamentoCenario: number): Observable<Orcamento> {
    const params = new AwHttpParams({ idOrcamentoCenario });
    return this.http
      .get<Orcamento>(`${environment.ApiUrl}orcamentos/${idOrcamento}`, {
        params,
      })
      .pipe(
        // Map para facilitar nos componentes
        map(orcamento => ({
          ...orcamento,
          orcamentoCenarioPadrao: minBy(orcamento.orcamentoCenario ?? [], 'idOrcamentoCenario'),
          grupoes: (orcamento.grupoes ?? []).map(grupao => ({
            ...grupao,
            idUnico: `${grupao.idGrupao}-${grupao.idOrcamentoFamilia}`,
            grupos: orderBy(
              (grupao.grupos ?? []).map(grupo => {
                return {
                  ...grupo,
                  idFamiliaCustomizada: grupao.idFamiliaCustomizada,
                  propostas: (grupo.propostas ?? []).map(proposta => ({
                    ...proposta,
                    fornecedor: (grupo.fornecedores ?? []).find(
                      fornecedor => fornecedor.idFornecedor === proposta.idFornecedor
                    ),
                    equalizacaoSelecionada:
                      statusBudgetValue(proposta, grupo.propostas) === StatusPropostaValorOrcamento.Total,
                  })),
                  responsaveis: orderBy(grupo.responsaveis ?? [], {
                    principal: 'desc',
                    idOrcamentoGrupoResponsavel: 'asc',
                  }),
                  idOrcamentoCenario,
                  idOrcamento,
                }
              }),
              orderByCodigo<Grupo>('codigoGrupo')
            ),
          })),
        })),
        refreshMap(orcamento => this.buscarFamilias(orcamento, idOrcamentoCenario)),
        tap(orcamento => {
          this.orcamento$.next(orcamento);
        })
      );
  }
  // Seleciona os grupos a serem salvos e guarda em um mapa
  selectGroup(grupao: Grupao): void {
    const { grupos, ..._grupao } = grupao;
    const key = getIdGrupao(grupao);
    if (this._grupoesMap.has(key)) {
      this._grupoesMap.set(key, {
        ..._grupao,
        grupos: unionWith(grupos, this._grupoesMap.get(key).grupos, (a, b) => a.idGrupo === b.idGrupo),
      });
    } else {
      this._grupoesMap.set(key, grupao);
    }
  }

  saveGrupos(idOrcamento: number, idOrcamentoCenario: number): Observable<Orcamento> {
    const params = new AwHttpParams({ idOrcamentoCenario }, true);
    const grupoesFormatted = this.transFormGroupsToPayload();
    return this.http.put<Orcamento>(`${environment.ApiUrl}orcamentos/${idOrcamento}/grupoes`, grupoesFormatted, {
      params,
    });
  }

  saveGruposValores(payload: Grupao[], idOrcamento: number, idOrcamentoCenario: number): Observable<Orcamento> {
    return this.http
      .put<Orcamento>(`${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/valores`, payload)
      .pipe(refresh(this.refreshOrcamento(idOrcamento, idOrcamentoCenario)));
  }

  salvarFamilia(familiaCustomizada: FamiliaCustomizada): Observable<FamiliaCustomizada> {
    const { idFamiliaCustomizada, ...payload } = familiaCustomizada;

    if (idFamiliaCustomizada) {
      return this.http.put<FamiliaCustomizada>(
        `${environment.ApiUrl}orcamentos/${payload.idOrcamento}/familias-customizadas/${idFamiliaCustomizada}`,
        { ...payload, idFamiliaCustomizada }
      );
    }

    return this.http.post<FamiliaCustomizada>(
      `${environment.ApiUrl}orcamentos/${payload.idOrcamento}/familias-customizadas`,
      payload
    );
  }

  deleteFamilia(idOrcamento: number, idFamiliaCustomizada: number): Observable<Familia> {
    return this.http.delete<Familia>(
      `${environment.ApiUrl}orcamentos/${idOrcamento}/familias-customizadas/${idFamiliaCustomizada}`
    );
  }

  refreshOrcamento(idOrcamento: number, idOrcamentoCenario: number): Observable<Orcamento> {
    return this.buscarOrcamento(idOrcamento, idOrcamentoCenario);
  }

  saveDatas(datas: Datas, idOrcamento: number): any {
    const payload = Object.entries(datas)
      .filter(([_, value]) => value)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: formatISO(value) }), {});
    return this.http.put(`${environment.ApiUrl}orcamentos/${idOrcamento}/datas`, payload);
  }

  ordenaFamilias(familias: Familia[], idOrcamento: number): Observable<Familia[]> {
    const ordem = familias.map(({ idOrcamentoFamilia }) => idOrcamentoFamilia);
    return this.http.put<Familia[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/familias/nova-ordenacao`, ordem);
  }

  updateMatriz({
    idOrcamento,
    ...payload
  }: {
    idProjeto: number;
    idOrcamentoGrupo: number;
    idGrupo: number;
    idOrcamento: number;
  }): Observable<void> {
    return this.http.post<void>(`${environment.ApiUrl}orcamentos/${idOrcamento}/atualizar-matriz`, payload);
  }

  setSelectedGroupsToFamilies(orcamento: Orcamento, familias: Familia[]): Familia[] {
    const { grupoes } = orcamento;
    familias = familias.map(familia => ({
      ...familia,
      grupoes: grupoes
        .filter(
          grupao =>
            (familia.idFamilia && grupao.idFamilia === familia.idFamilia) ||
            (grupao.idFamiliaCustomizada && grupao.idFamiliaCustomizada === familia.idFamiliaCustomizada)
        )
        .map(grupao => ({
          ...grupao,
          grupos: (grupao.grupos ?? []).map(grupo => ({
            ...grupo,
            idOrcamentoFamilia: familia.idOrcamentoFamilia,
            idFamilia: familia.idFamilia,
            idFamiliaCustomizada: familia.idFamiliaCustomizada,
            dataLimiteDefinicao: grupo.dataLimiteDefinicao && new Date(grupo.dataLimiteDefinicao),
            dataLimiteRecebimento: grupo.dataLimiteRecebimento
              ? new Date(grupo.dataLimiteRecebimento)
              : orcamento.datas?.dataRecebimentoTodosCustos
              ? new Date(orcamento.datas?.dataRecebimentoTodosCustos)
              : null,
          })),
        })),
    }));

    this.setGrupoesMap(familias);
    return familias;
  }

  saveCotacao(
    payload: EnvioCotacaoPayload,
    idOrcamento: number,
    idGrupo: number,
    reenvio: boolean,
    customizada?: boolean
  ): Observable<void> {
    payload.faseDNN ??= true;
    const params = new AwHttpParams({ customizada });
    const target = `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/${
      reenvio ? 'reenvio-cotacao' : 'envio-cotacao'
    }`;
    return this.http.put<void>(target, payload, { params });
  }

  private transFormGroupsToPayload(): Grupao[] {
    const payload: Grupao[] = [];
    for (const [, grupao] of this._grupoesMap) {
      grupao.grupos = grupao.grupos.map(grupo => ({
        ...grupo,
        dataLimiteDefinicao: grupo.dataLimiteDefinicao ? new Date(grupo.dataLimiteDefinicao) : null,
        dataLimiteRecebimento: grupo.dataLimiteRecebimento ? new Date(grupo.dataLimiteRecebimento) : null,
      }));
      payload.push(grupao);
    }
    return payload;
  }

  private updateOrcamento(orcamento: Orcamento): Observable<Orcamento> {
    return this.http.put<Orcamento>(`${environment.ApiUrl}orcamentos/${orcamento.idOrcamento}`, orcamento);
  }

  getCloneOrcamento(): Orcamento {
    const orcamento = this.orcamento$.value;
    if (!orcamento) return null;
    return {
      ...orcamento,
      fases: (orcamento?.fases ?? []).map(fase => ({ ...fase })),
      edificios: (orcamento?.edificios ?? []).map(edificio => ({
        ...edificio,
        pavimentos: cloneArray(edificio?.pavimentos),
      })),
      grupoes: (orcamento?.grupoes ?? []).map(grupao => ({
        ...grupao,
        grupos: (grupao?.grupos ?? []).map(grupo => ({
          ...grupo,
          anexosAvulsos: cloneArray(grupo?.anexosAvulsos),
          arquitetura: cloneArray(grupo?.arquitetura),
          especialistas: cloneArray(grupo?.especialistas),
          responsaveis: cloneArray(grupo?.responsaveis),
          propostas: cloneArray(grupo?.propostas),
          fornecedores: cloneArray(grupo?.fornecedores),
        })),
      })),
    };
  }

  updateGrupo(idOrcamentoGrupo: number, partial: Partial<Grupo> | ((grupo: Grupo) => Grupo)): void {
    const update = isFunction(partial) ? partial : (grupo: Grupo) => ({ ...grupo, ...partial });
    const orcamento = this.getCloneOrcamento();
    this.orcamento$.next({
      ...orcamento,
      grupoes: orcamento.grupoes.map(grupao => {
        return {
          ...grupao,
          grupos: grupao.grupos.map(grupo => {
            if (grupo.idOrcamentoGrupo === idOrcamentoGrupo) {
              grupo = update(grupo);
            }
            return grupo;
          }),
        };
      }),
    });
    this.familias$.next(
      this.familias$.value.map(familia => {
        return {
          ...familia,
          grupoes: familia.grupoes.map(grupao => {
            return {
              ...grupao,
              grupos: grupao.grupos.map(grupo => {
                if (grupo.idOrcamentoGrupo === idOrcamentoGrupo) {
                  grupo = update(grupo);
                }
                return grupo;
              }),
            };
          }),
        };
      })
    );
  }

  getVisualizarGruposEmLista(idOrcamento: number): Observable<boolean> {
    return this.http.get<boolean>(`${environment.AwApiUrl}orcamento/${idOrcamento}/visualizar-grupos-em-lista`).pipe(
      tap(visualizarGruposEmLista => {
        this.visualizarGruposEmLista$.next(visualizarGruposEmLista);
      })
    );
  }

  putModoExibicao(idOrcamento: number, flag: boolean): Observable<boolean> {
    this.visualizarGruposEmLista$.next(flag);
    return this.http
      .put<boolean>(`${environment.AwApiUrl}orcamento/${idOrcamento}/visualizar-grupos-em-lista/${flag}`, {})
      .pipe(catchAndThrow(() => this.visualizarGruposEmLista$.next(!flag)));
  }

  patchOrcamentoGrupo(
    idOrcamento: number,
    idOrcamentoGrupo: number,
    payload: Partial<OrcamentoGrupo>
  ): Observable<OrcamentoGrupo> {
    return this.http.patch<OrcamentoGrupo>(
      `${environment.ApiUrl}/orcamentos/${idOrcamento}/grupos/${idOrcamentoGrupo}`,
      payload
    );
  }

  /**
   * @description Operator para separar as familias normais das familias opcionais, adiciona uma flag na familia (opcional), separa os grupoes/grupos e
   * adiciona "Opcional" na descrição da familia
   */
  mapFamiliasOpcionais(): MonoTypeOperatorFunction<Familia[]> {
    return map(familias => {
      const familiasNormais: Familia[] = [];
      const familiasOpcionais: Familia[] = [];
      for (const familia of familias) {
        const familiaNormal: Familia = {
          ...familia,
          grupoes: familia.grupoes
            .map(grupao => ({ ...grupao, grupos: grupao.grupos.filter(grupo => !grupo.opcional) }))
            .filter(grupao => grupao.grupos.length),
          opcional: false,
        };
        const familiaOpcional: Familia = {
          ...familia,
          descricaoFamilia: `${familia.descricaoFamilia} (Opcional)`,
          opcional: true,
          grupoes: familia.grupoes
            .map(grupao => ({ ...grupao, grupos: grupao.grupos.filter(grupo => grupo.opcional) }))
            .filter(grupao => grupao.grupos.length),
        };
        familiasNormais.push(familiaNormal);
        familiasOpcionais.push(familiaOpcional);
      }
      // Poderia fazer isso com um reduce, porém, ia ficar muito complexo para ler
      // Então resolvi fazer com um for of simples
      return [...familiasNormais, ...familiasOpcionais].filter(familia => familia.grupoes?.length);
    });
  }
}

const cloneArray = <T>(array: T[]): T[] => (array ?? []).map(element => ({ ...element }));

const getIdGrupao = ({ idGrupao, idFamiliaCustomizada, idFamilia }: Grupao) =>
  `${idGrupao}-${idFamilia ?? idFamiliaCustomizada}`;
