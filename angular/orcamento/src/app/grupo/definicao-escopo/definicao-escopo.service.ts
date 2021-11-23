import { Injectable } from '@angular/core';
import { GrupoAlt, OrcamentoCenarioPadrao } from '../../models';
import { MonoTypeOperatorFunction, Observable, Subject, throwError } from 'rxjs';
import {
  GrupoItem,
  GrupoItemDE,
  GrupoItemGenericReponse,
  GrupoItemMode,
  GrupoItemTab,
  OrcamentoGrupoItemFornecedor,
} from './model/grupo-item';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { isNumber, uniqBy } from 'lodash-es';
import {
  GrupoComboConteudo,
  GrupoItemAtributo,
  GrupoItemDadoAtributo,
  GrupoItemDadoAtributoCombo,
  IncluirGrupoItemDadoAtributo,
  IncluirGrupoItemDadoAtributoCombo,
} from './model/grupo-item-atributo';
import { GenericResponse } from './model/generic-response';
import { catchError, filter, finalize, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { GrupoItemValoresTag } from './model/atualiza-valores-tag';
import { DuplicarGrupoItem } from './model/duplicar';
import { DefinicaoEscopoActions } from './state/actions';
import { SetGruposItens } from './state/actions/set-grupos-itens';
import { SetErrorApi } from './state/actions/set-error-api';
import { Quantitativo } from './shared/de-distribuir-quantitativo/model/quantitativo';
import { ErrorApi } from './model/error-api';
import { InclusaoGrupoItemQuantitativo } from './model/atualizacao-quantitativo';
import { mapFase, mapQuantitativoPavimentosPermitidos } from './shared/de-distribuir-quantitativo/util';
import { Pavimento } from './shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from './shared/de-distribuir-quantitativo/model/centro-custo';
import { InclusaoGrupoItem } from './model/inclusao-grupo-item';
import {
  GrupoItemPesquisaReferencia,
  GrupoItemPesquisaReferenciaPayload,
} from './model/grupo-item-pesquisa-referencia';
import { Entity } from '@aw-utils/types/entity';
import { DefinicaoEscopoModeEnum } from './state/definicao-escopo.model';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { PlanilhaClienteService } from '@aw-services/planilha-cliente/planilha-cliente.service';
import { FornecedorSelecionado } from './model/fornecedor-selecionado';
import { AwHttpParams } from '@aw-utils/http-params';
import { Store } from '@ngxs/store';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';

@Injectable({
  providedIn: 'root',
})
export class DefinicaoEscopoService {
  constructor(
    private http: HttpClient,
    public awDialogService: AwDialogService,
    private planilhaClienteService: PlanilhaClienteService,
    public store: Store,
    private cenariosService: CenariosService
  ) {}

  grupo: GrupoAlt;
  cenarioPadrao: OrcamentoCenarioPadrao;
  idOrcamentoCenario: number;

  targetGrupoItem = environment.AwApiUrl + 'orcamento-grupo-itens';
  targetGrupoItemQuantitativo = environment.AwApiUrl + 'orcamento-grupo-itens-quantitativos';
  targetGrupo = environment.AwApiUrl + 'orcamento-grupo';

  private _scrollIntoView$ = new Subject<number>();
  scrollIntoView$ = this._scrollIntoView$.asObservable();

  selectScrollIntoView(idOrcamentoGrupoItem: number): Observable<number> {
    return this.scrollIntoView$.pipe(filter(id => id === idOrcamentoGrupoItem));
  }

  scrollIntoView(idOrcamentoGrupoItem: number): void {
    this._scrollIntoView$.next(idOrcamentoGrupoItem);
  }

  setInit(
    grupo: GrupoAlt,
    cenarioPadrao: OrcamentoCenarioPadrao,
    idOrcamentoCenario: number,
    idOrcamentoGrupoItemAtual?: number
  ): void {
    this.grupo = grupo;
    this.cenarioPadrao = cenarioPadrao;
    this.idOrcamentoCenario = idOrcamentoCenario;
    this.setGruposItensApi(this.grupo.idOrcamentoGrupo, idOrcamentoGrupoItemAtual);
    this.setFornecedoresApi(this.grupo.idOrcamento, this.grupo.idOrcamentoGrupo, this.grupo.idGrupo);
  }

  clear(): void {
    this.cenarioPadrao = null;
    this.grupo = null;
    this.idOrcamentoCenario = null;
    this.clearState();
  }

  getGrupoItens<T extends GrupoItem>(idOrcamentoGrupo: number): Observable<T[]> {
    return this.http.get<T[]>(`${environment.AwApiUrl}grupos/orcamento-grupo/${idOrcamentoGrupo}/grupo-itens`).pipe(
      map(gruposItens =>
        gruposItens.map(item => {
          item.tag = !item.tag ? null : item.tag;
          return item;
        })
      )
    );
  }

  setGruposItensApi(idOrcamentoGrupo: number, idOrcamentoGrupoItemAtual?: number): void {
    // Não da pra colocar isso no ngxs, pois por algum motivo ele chama a requisição duas vezes
    this.setLoading(true);
    this.getGrupoItens<GrupoItemDE>(idOrcamentoGrupo)
      .pipe(
        map(gruposItens =>
          gruposItens.map(item => {
            item.atributos = [];
            item.idsFornecedores = item.fornecedores.map(f => f.idFornecedor);
            return item;
          })
        ),
        tap(grupoItens => {
          if (idOrcamentoGrupoItemAtual) {
            const grupoItem = grupoItens.find(g => g.idOrcamentoGrupoItem === idOrcamentoGrupoItemAtual);
            if (grupoItem) {
              this.collapseOrPesquisa(grupoItem, 'atributos', true);
            }
          }
        }),
        catchError(error => {
          this.setErrorApi({
            error: 'Erro ao tentar carregar os itens!',
            args: [idOrcamentoGrupo],
            callAgain: this.setGruposItensApi.bind(this),
          });
          return throwError(error);
        }),
        finalize(() => {
          this.setLoading(false);
        })
      )
      .subscribe(gruposItens => {
        this.setGruposItens(gruposItens, null);
      });
  }

  getAtributos(idOrcamentoGrupoItem: number): Observable<GrupoItemAtributo[]> {
    return this.http.get<GrupoItemAtributo[]>(`${this.targetGrupoItem}/${idOrcamentoGrupoItem}/atributos`).pipe(
      map(grupoItemAtributos =>
        (grupoItemAtributos ?? [])
          .filter(grupoItemAtributo => grupoItemAtributo.grupoItemDadoAtributo?.length)
          .map(grupoItemAtributo => ({
            ...grupoItemAtributo,
            grupoItemDadoAtributo: uniqBy(grupoItemAtributo.grupoItemDadoAtributo ?? [], 'idGrupoItemDadoAtributo').map(
              grupoItemDadoAtributo => ({
                ...grupoItemDadoAtributo,
                grupoItemDadoAtributoCombo: uniqBy(
                  grupoItemDadoAtributo.grupoItemDadoAtributoCombo ?? [],
                  'idGrupoItemDadoAtributoCombo'
                ).map(grupoItemDadoAtributoCombo => ({
                  ...grupoItemDadoAtributoCombo,
                  grupoComboConteudo: uniqBy(
                    grupoItemDadoAtributoCombo.grupoComboConteudo ?? [],
                    'idGrupoComboConteudo'
                  ),
                })),
              })
            ),
          }))
          .map(grupoItemAtributo => ({
            ...grupoItemAtributo,
            grupoItemDadoAtributo: grupoItemAtributo.grupoItemDadoAtributo.map(grupoItemDadoAtributo => ({
              ...grupoItemDadoAtributo,
              grupoItemDadoAtributoCombo: grupoItemDadoAtributo.grupoItemDadoAtributoCombo.map(
                grupoItemDadoAtributoCombo => ({
                  ...grupoItemDadoAtributoCombo,
                  grupoComboConteudo: grupoItemDadoAtributoCombo.grupoComboConteudo.map(grupoComboConteudo => ({
                    ...grupoComboConteudo,
                    descricaoReal: `${grupoItemDadoAtributoCombo.texto} ${grupoComboConteudo.descricaoCategoriaConteudo}`,
                  })),
                })
              ),
            })),
          }))
      )
    );
  }

  putComplemento(idOrcamentoGrupoItem: number, complemento: string): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.targetGrupoItem}/${idOrcamentoGrupoItem}/atualizacao/complemento`, {
      complemento,
    });
  }

  putValoresTag(idOrcamentoGrupoItem: number, payload: GrupoItemValoresTag): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      `${this.targetGrupoItem}/${idOrcamentoGrupoItem}/atualizacao/valores-tag`,
      payload
    );
  }

  postDuplicacao(payload: DuplicarGrupoItem): Observable<GrupoItemGenericReponse> {
    return this.http.post<GrupoItemGenericReponse>(`${this.targetGrupoItem}/duplicacao`, payload);
  }

  excluirGrupoItemAtributo(idOrcamentoGrupoItemAtributo: number): Observable<GenericResponse> {
    return this.http.delete<GenericResponse>(
      `${this.targetGrupoItem}/atributos/${idOrcamentoGrupoItemAtributo}/exclusao`
    );
  }

  incluirGrupoItemDadoAtributo(payload: IncluirGrupoItemDadoAtributo): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.targetGrupoItem}/atributos/inclusao`, payload);
  }

  incluirGrupoItemDadoAtributoCombo(payload: IncluirGrupoItemDadoAtributoCombo): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.targetGrupoItem}/atributos/combo/inclusao`, payload);
  }

  atualizacaoGrupoItemDadoAtributoCombo(
    idOrcamentoGrupoItemAtributoCombo: number,
    payload: IncluirGrupoItemDadoAtributoCombo
  ): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      `${this.targetGrupoItem}/atributos/combo/${idOrcamentoGrupoItemAtributoCombo}/atualizacao`,
      payload
    );
  }

  getQuantitativo(idOrcamento: number, idOrcamentoGrupoItem: number): Observable<Quantitativo> {
    return this.http
      .get<Quantitativo>(`${this.targetGrupoItemQuantitativo}/${idOrcamentoGrupoItem}/preenchimento-quantitativo`)
      .pipe(
        this.mapWithPavimentos(idOrcamento, idOrcamentoGrupoItem),
        map(quantitativo => {
          quantitativo.fases = quantitativo.fases.map(mapFase);
          return quantitativo;
        })
      );
  }

  getQuantitativoNovo(idOrcamento: number): Observable<Quantitativo> {
    return this.http
      .get<Quantitativo>(`${this.targetGrupoItemQuantitativo}/${idOrcamento}/preenchimento-quantitativo-orcamento`)
      .pipe(
        map(quantitativo => {
          quantitativo.fases = quantitativo.fases.map(mapFase);
          return quantitativo;
        })
      );
  }

  private mapWithPavimentos(idOrcamento: number, idOrcamentoGrupoItem: number): MonoTypeOperatorFunction<Quantitativo> {
    const cenarioPadrao = this.cenariosService.getCenarioPadraoSnapshot();
    if (cenarioPadrao?.existePlanilhaCliente) {
      return switchMap(quantitativo =>
        this.planilhaClienteService
          .getPavimentos(idOrcamento, idOrcamentoGrupoItem)
          .pipe(map(pavimentos => mapQuantitativoPavimentosPermitidos(quantitativo, pavimentos)))
      );
    } else {
      return source => source;
    }
  }

  updateQuantitativo(payload: InclusaoGrupoItemQuantitativo, v2 = false): Observable<InclusaoGrupoItemQuantitativo> {
    return this.http.put<InclusaoGrupoItemQuantitativo>(
      `${this.targetGrupoItemQuantitativo}/${v2 ? 'v2/' : ''}${payload.idOrcamentoGrupoItemQuantitativo}/atualizacao`,
      payload
    );
  }

  incluirQuantitativo(payload: InclusaoGrupoItemQuantitativo, v2 = false): Observable<InclusaoGrupoItemQuantitativo> {
    return this.http.post<InclusaoGrupoItemQuantitativo>(
      `${this.targetGrupoItemQuantitativo}/${v2 ? 'v2/' : ''}${payload.idOrcamentoGrupoItem}/inclusao`,
      payload
    );
  }

  deleteQuantitativo(
    idOrcamentoGrupoItemQuantitativo: number,
    forcarExclusao = false,
    v2 = false,
    body?: InclusaoGrupoItemQuantitativo
  ): Observable<GenericResponse> {
    const params = new AwHttpParams({ forcarExclusao });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .request<GenericResponse>(
        'delete',
        `${this.targetGrupoItemQuantitativo}/${v2 ? 'v2/' : ''}${idOrcamentoGrupoItemQuantitativo}/exclusao`,
        { body: body ?? {}, headers, params }
      )
      .pipe(
        map(response => {
          if (response?.codigo === 0) {
            this.awDialogService.error('Erro ao tentar remover a quantidade', response.mensagem);
            throw response;
          }
          if (response?.codigo === 2) {
            throw response;
          }
          return response;
        })
      );
  }

  incluirGrupoItem(payload: InclusaoGrupoItem): Observable<GrupoItemGenericReponse> {
    return this.http.post<GrupoItemGenericReponse>(`${this.targetGrupoItem}/inclusao`, payload);
  }

  excluirGrupoItem(idOrcamentoGrupoItem: number, idOrcamentoCenario: number, forcarExclusao = false): Observable<void> {
    const params = new AwHttpParams({ forcarExclusao });
    return this.http
      .delete<GenericResponse>(
        `${this.targetGrupoItem}/${idOrcamentoGrupoItem}/cenario/${idOrcamentoCenario}/exclusao`,
        { params }
      )
      .pipe(
        map(response => {
          if (response.codigo === 0) {
            this.awDialogService.error('Erro ao tentar excluir o item', response.mensagem);
            throw response;
          }
          if (response.codigo === 2) {
            throw response;
          }
          return;
        })
      );
  }

  getPesquisaReferencia(
    idOrcamentoGrupoItem: number,
    payload: GrupoItemPesquisaReferenciaPayload
  ): Observable<GrupoItemPesquisaReferencia> {
    return this.http.post<GrupoItemPesquisaReferencia>(
      `${this.targetGrupoItem}/${idOrcamentoGrupoItem}/pesquisa-referencia`,
      payload
    );
  }

  getProximaNumeracao(idOrcamentoGrupo: number): Observable<string> {
    return this.http
      .get<{ numeracao: string }>(`${this.targetGrupoItem}/numeracao/proxima/${idOrcamentoGrupo}`)
      .pipe(map(numeracao => numeracao.numeracao));
  }

  getOrcamentoGrupoItemFornecedores(idOrcamentoGrupoItem: number): Observable<OrcamentoGrupoItemFornecedor[]> {
    return this.http.get<OrcamentoGrupoItemFornecedor[]>(
      `${this.targetGrupoItem}/${idOrcamentoGrupoItem}/fornecedores`
    );
  }

  updateFornecedores(
    idOrcamentoGrupoItem: number,
    idsFornecedores: number[]
  ): Observable<OrcamentoGrupoItemFornecedor[]> {
    return this.http
      .post<void>(`${this.targetGrupoItem}/${idOrcamentoGrupoItem}/fornecedores`, idsFornecedores)
      .pipe(switchMapTo(this.getOrcamentoGrupoItemFornecedores(idOrcamentoGrupoItem)));
  }

  getFornecedoresSelecionados(idOrcamentoGrupo: number): Observable<FornecedorSelecionado[]> {
    return this.http.get<FornecedorSelecionado[]>(`${this.targetGrupo}/${idOrcamentoGrupo}/fornecedores`);
  }

  @Dispatch() setErrorApi = (error: ErrorApi) => new SetErrorApi(error);
  @Dispatch() setGruposItens = (gruposItens: GrupoItemDE[], error?: ErrorApi) => [
    new SetGruposItens(gruposItens),
    new SetErrorApi(error),
  ];
  @Dispatch() setLoading = (loading: boolean) => new DefinicaoEscopoActions.setLoading(loading);
  @Dispatch() clearState = () => new DefinicaoEscopoActions.clearState();
  @Dispatch() updateGrupoItem = (
    id: number,
    grupoItem: Partial<GrupoItemDE>,
    property?: 'idOrcamentoGrupoItem' | 'idGrupoItem'
  ) => new DefinicaoEscopoActions.updateGrupoItem(id, grupoItem, property);
  @Dispatch() setGrupoItemAtributosApi = (idOrcamentoGrupoItem: number, scroll?: boolean) =>
    new DefinicaoEscopoActions.setGrupoItemAtributosApi(idOrcamentoGrupoItem, scroll);
  @Dispatch() setGrupoItemNextTab = (idOrcamentoGrupoItem: number, activeTab?: string | number | GrupoItemTab) =>
    new DefinicaoEscopoActions.setGrupoItemNextTab(idOrcamentoGrupoItem, resolveTabName(activeTab));

  @Dispatch() updateGrupoItemComplementoApi = (idOrcamentoGrupoItem: number, complemento: string) =>
    new DefinicaoEscopoActions.updateGrupoItemComplementoApi(idOrcamentoGrupoItem, complemento);
  @Dispatch() updateGrupoItemValoresTagApi = (idOrcamentoGrupoItem: number, payload: GrupoItemValoresTag) =>
    new DefinicaoEscopoActions.updateGrupoItemValoresTagApi(idOrcamentoGrupoItem, payload);
  @Dispatch() setGrupoItemQuantitativoApi = (idOrcamentoGrupoItem: number, refresh = false) =>
    new DefinicaoEscopoActions.setGrupoItemQuantitativoApi(idOrcamentoGrupoItem, refresh);
  setGrupoItemActiveTab = (idOrcamentoGrupoItem: number, activeTab: string | number | GrupoItemTab) => {
    this.updateGrupoItem(idOrcamentoGrupoItem, {
      activeTab: resolveTabName(activeTab),
    });
  };
  @Dispatch() updateGrupoItemQuantitativoApi = (
    idOrcamentoGrupoItem: number,
    idFase: number,
    pavimento: Pavimento,
    centroCusto: CentroCusto,
    qtde: number
  ) =>
    new DefinicaoEscopoActions.updateGrupoItemQuantitativoApi(
      idOrcamentoGrupoItem,
      idFase,
      pavimento,
      centroCusto,
      qtde
    );
  @Dispatch() incluirGrupoItemApi = (payload: InclusaoGrupoItem, idGrupoItem?: number) =>
    new DefinicaoEscopoActions.incluirGrupoItemApi(payload, idGrupoItem);
  @Dispatch() excluirGrupoItemApi = (idOrcamentoGrupoItem: number, forcarExclusao = false) =>
    new DefinicaoEscopoActions.excluirGrupoItemApi(idOrcamentoGrupoItem, forcarExclusao);
  @Dispatch() setGrupoItemPesquisaReferenciaApi = (
    idOrcamentoGrupoItem: number,
    payload: GrupoItemPesquisaReferenciaPayload,
    forceApi?: boolean,
    attr?: Entity<boolean>
  ) => new DefinicaoEscopoActions.setGrupoItemPesquisaReferenciaApi(idOrcamentoGrupoItem, payload, forceApi, attr);
  @Dispatch() setGrupoItemAtributoTexto = (idOrcamentoGrupoItem: number, atributoOrdem: number) =>
    new DefinicaoEscopoActions.setGrupoItemAtributoTexto(idOrcamentoGrupoItem, atributoOrdem);
  @Dispatch() setMode = (mode: DefinicaoEscopoModeEnum) => new DefinicaoEscopoActions.setMode(mode);

  @Dispatch() setFornecedoresApi = (idOrcamento: number, idOrcamentoGrupo: number, idGrupo: number) =>
    new DefinicaoEscopoActions.setFornecedoresApi(idOrcamento, idOrcamentoGrupo, idGrupo);

  @Dispatch() updateFornecedorApi = (idOrcamentoGrupoItem: number, idsFornecedores: number[]) =>
    new DefinicaoEscopoActions.updateFornecedorGrupoItemApi(idOrcamentoGrupoItem, idsFornecedores);

  @Dispatch() changeAtributo = (
    idOrcamentoGrupoItem: number,
    grupoItemAtributo: GrupoItemAtributo,
    grupoItemDadoAtributo: GrupoItemDadoAtributo,
    grupoItemDadoAtributoCombo?: GrupoItemDadoAtributoCombo,
    grupoComboConteudo?: GrupoComboConteudo
  ) =>
    new DefinicaoEscopoActions.changeAtributo(
      idOrcamentoGrupoItem,
      grupoItemAtributo,
      grupoItemDadoAtributo,
      grupoItemDadoAtributoCombo,
      grupoComboConteudo
    );

  @Dispatch() toggleAllAtivos = (open = true) => new DefinicaoEscopoActions.toggleAllAtivos(open);

  collapseOrPesquisa(
    { activeMode, idOrcamentoGrupoItem, opened, atributos }: GrupoItemDE,
    click: GrupoItemMode,
    scroll?: boolean
  ): void {
    if (click === 'atributos') {
      if (!activeMode) {
        this.setGrupoItemAtributosApi(idOrcamentoGrupoItem, scroll);
      } else {
        this.updateGrupoItem(idOrcamentoGrupoItem, { opened: !opened });
      }
    } else {
      if (opened) {
        if (activeMode === 'pesquisa') {
          if (atributos && atributos.length) {
            this.updateGrupoItem(idOrcamentoGrupoItem, {
              activeMode: 'atributos',
            });
          } else {
            this.setGrupoItemAtributosApi(idOrcamentoGrupoItem, scroll);
          }
        } else {
          this.updateGrupoItem(idOrcamentoGrupoItem, {
            activeMode: 'pesquisa',
          });
        }
      } else {
        this.updateGrupoItem(idOrcamentoGrupoItem, {
          activeMode: 'pesquisa',
          opened: true,
        });
      }
    }
  }
}

function resolveTabName(tab: string | number | GrupoItemTab): GrupoItemTab {
  return (isNumber(tab) ? `atributo${tab}` : tab) as GrupoItemTab;
}
