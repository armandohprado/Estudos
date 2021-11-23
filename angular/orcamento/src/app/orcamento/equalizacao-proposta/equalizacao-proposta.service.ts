import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EpPropostaItemStore } from './state/item/ep-proposta-item.store';
import { environment } from '../../../environments/environment';
import { forkJoin, Observable, of } from 'rxjs';
import { EpFornecedor, EpFornecedorResponse } from './model/fornecedor';
import { finalize, map, pluck, tap } from 'rxjs/operators';
import { catchAndThrow, reduceToFunc, refresh } from '@aw-utils/rxjs/operators';
import { EpInformacoes, EpInformacoesResponse } from './model/informacaoes';
import { isFunction, sumBy } from 'lodash-es';
import { EpPropostaItemQuery } from './state/item/ep-proposta-item.query';
import { EpPropostaItem, EpPropostaItemValorUnitarioPayload } from './model/item';
import { AwHttpParams } from '@aw-utils/http-params';
import {
  EpOrcamentoGrupoItemQuantitativoFase,
  EpPropostaItemQuantitativoAtualizarPayload,
  EpPropostaItemQuantitativoItem,
} from './model/item-quantitativo';
import {
  epPropostaItemCopyQuantitativo,
  mapEpFornecedoresItens,
  mapEpFornecedoresItensNaoPreenchidos,
  mapQuantitativoToPropostaItem,
  orderEpFornecedor,
} from './utils';
import { EpHistorico } from './model/historico';

@Injectable({ providedIn: 'root' })
export class EqualizacaoPropostaService {
  constructor(
    private http: HttpClient,
    private epPropostaItemStore: EpPropostaItemStore,
    private epPropostaItemQuery: EpPropostaItemQuery
  ) {}

  private _target = environment.AwApiUrl + 'equalizacoes';

  atualizarFornecedor(
    idFornecedor: number | ((fornecedor: EpFornecedor) => boolean),
    partial: Partial<EpFornecedor> | ((fornecedor: EpFornecedor) => EpFornecedor)
  ): void {
    const predicate = isFunction(idFornecedor)
      ? idFornecedor
      : (fornecedor: EpFornecedor) => fornecedor.idFornecedor === idFornecedor;
    const update = isFunction(partial) ? partial : (fornecedor: EpFornecedor) => ({ ...fornecedor, ...partial });
    this.epPropostaItemStore.update(state => ({
      ...state,
      fornecedores: state.fornecedores.map(fornecedor => {
        if (predicate(fornecedor)) {
          fornecedor = update(fornecedor);
        }
        return fornecedor;
      }),
    }));
  }

  atualizarItemQuantitativo(
    idPropostaItem: number | ((item: EpPropostaItem) => boolean),
    idQuantitativo: string | ((quantitativo: EpPropostaItemQuantitativoItem) => boolean),
    partial:
      | Partial<EpPropostaItemQuantitativoItem>
      | ((quantitativo: EpPropostaItemQuantitativoItem) => EpPropostaItemQuantitativoItem)
  ): void {
    const predicate = isFunction(idQuantitativo)
      ? idQuantitativo
      : (quantitativo: EpPropostaItemQuantitativoItem) => quantitativo.id === idQuantitativo;
    const update = isFunction(partial)
      ? partial
      : (quantitativo: EpPropostaItemQuantitativoItem) => ({ ...quantitativo, ...partial });
    this.epPropostaItemStore.update(idPropostaItem, item => ({
      ...item,
      quantitativos: item.quantitativos.map(quantitativo => {
        if (predicate(quantitativo)) {
          quantitativo = update(quantitativo);
        }
        return quantitativo;
      }),
    }));
  }

  getInformacaoes(idOrcamentoGrupo: number, idOrcamentoCenario: number): Observable<EpInformacoes> {
    return this.http
      .get<EpInformacoesResponse>(`${this._target}/${idOrcamentoGrupo}/cenario/${idOrcamentoCenario}`)
      .pipe(
        map(informacoes => {
          delete informacoes.fornecedores;
          return { ...informacoes };
        })
      );
  }

  getFornecedoresItens(idOrcamentoGrupo: number, idOrcamentoCenario: number): Observable<EpFornecedorResponse[]> {
    return this.http
      .get<EpFornecedorResponse[]>(`${this._target}/${idOrcamentoGrupo}/cenario/${idOrcamentoCenario}/orcamentos`)
      .pipe(map(mapEpFornecedoresItens), map(mapEpFornecedoresItensNaoPreenchidos));
  }

  get(idOrcamentoGrupo: number, idOrcamentoCenario: number): Observable<[EpInformacoes, EpFornecedorResponse[]]> {
    const informacoes$ = this.getInformacaoes(idOrcamentoGrupo, idOrcamentoCenario);
    const fornecedoresItens$ = this.getFornecedoresItens(idOrcamentoGrupo, idOrcamentoCenario);
    return forkJoin([informacoes$, fornecedoresItens$]).pipe(
      tap(([informacoes, fornecedores]) => {
        const allItens = reduceToFunc(fornecedores, 'itens');
        const fornecedoresWithoutItens = fornecedores.map(({ itens, ...fornecedor }) => fornecedor);
        this.epPropostaItemStore.update({ fornecedores: fornecedoresWithoutItens, ...informacoes });
        const itensStored = this.epPropostaItemQuery.getAll();
        // Merge dos itens que já existem com os itens novos, no caso de um refresh
        this.epPropostaItemStore.set(
          allItens.map(item => ({
            ...itensStored.find(itemS => itemS.idPropostaItem === item.idPropostaItem),
            ...item,
          }))
        );
      })
    );
  }

  gerarComparativa(
    idOrcamentoCenario: number,
    idOrcamentoGrupo: number,
    idsFornecedor: number[],
    indiceComparativa: number
  ): Observable<void> {
    return this.http
      .post<void>(
        `${this._target}/orcamento-cenarios/${idOrcamentoCenario}/orcamento-grupos/${idOrcamentoGrupo}/indice-comparativa/`,
        indiceComparativa
      )
      .pipe(
        tap(() => {
          this.epPropostaItemStore.update(state => ({
            ...state,
            indiceComparativa,
            fornecedores: state.fornecedores.map(fornecedor => ({
              ...fornecedor,
              selecionado: idsFornecedor.includes(fornecedor.idFornecedor) || fornecedor.indicadorAWReferencia,
            })),
          }));
        })
      );
  }

  atualizarLastCall(idProposta: number): Observable<void> {
    this.atualizarFornecedor(
      () => true,
      fornecedor => ({ ...fornecedor, lc: fornecedor.idProposta === idProposta, loadingLastCall: true })
    );
    return this.http.put<void>(`${this._target}/${idProposta}/atualizacao-lastcall`, undefined).pipe(
      finalize(() => {
        this.atualizarFornecedor(
          () => true,
          fornecedor => ({ ...fornecedor, lc: fornecedor.idProposta === idProposta, loadingLastCall: false })
        );
      })
    );
  }

  toggleCollapseHeaderFornecedor(): void {
    this.epPropostaItemStore.update(state => ({ ...state, collapseFornecedorHeader: !state.collapseFornecedorHeader }));
  }

  toggleCollapseItemDescricao(idOrcamentoGrupoItem: number): void {
    this.epPropostaItemStore.update(
      item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
      item => ({ ...item, descricaoOpened: !item.descricaoOpened })
    );
  }

  toggleCollapseItemOmissoDescricao(idPropostaItem: number): void {
    this.epPropostaItemStore.update(idPropostaItem, item => ({
      ...item,
      descricaoOpened: !item.descricaoOpened,
    }));
  }

  toggleCollapseItemValorUnitario(idOrcamentoGrupoItem: number): void {
    this.epPropostaItemStore.update(
      item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
      item => ({ ...item, valorUnitarioOpened: !item.valorUnitarioOpened })
    );
  }

  toggleCollapseItemOmissoValorUnitario(idPropostaItem: number): void {
    this.epPropostaItemStore.update(idPropostaItem, item => ({
      ...item,
      valorUnitarioOpened: !item.valorUnitarioOpened,
    }));
  }

  mapItens(callback: (item: EpPropostaItem, index: number, itens: EpPropostaItem[]) => EpPropostaItem): void {
    const itens = this.epPropostaItemQuery.getAll().map(callback);
    this.epPropostaItemStore.set(itens);
  }

  transferirTotal(from: (item: EpPropostaItem) => boolean, to: (item: EpPropostaItem) => boolean): void {
    this.mapItens((item, _, itens) => {
      if (to(item)) {
        const { valorUnitarioProdutoPropostaItem, valorUnitarioServicoPropostaItem, quantidadeItens, quantitativos } =
          itens.find(itemF => from(itemF) && item.idOrcamentoGrupoItem === itemF.idOrcamentoGrupoItem);
        item = { ...item, valorUnitarioProdutoPropostaItem, valorUnitarioServicoPropostaItem, quantidadeItens };
        if (item.quantitativos?.length) {
          item = epPropostaItemCopyQuantitativo(item, quantitativos);
        }
      }
      return item;
    });
  }

  transferirTotalParaAwReferencia(idFornecedor: number, idProposta: number): Observable<void> {
    this.atualizarFornecedor(idFornecedor, { loadingTransferencia: true });
    return this.http.post<void>(`${this._target}/${idProposta}/proposta-itens/aw-referencia`, undefined).pipe(
      tap(() => {
        this.transferirTotal(
          item => item.idFornecedor === idFornecedor,
          item => item.indicadorAWReferencia && !item.omisso
        );
      }),
      finalize(() => {
        this.atualizarFornecedor(idFornecedor, { loadingTransferencia: false });
      })
    );
  }

  transferirTotalAwReferenciaParaAwEstimado(
    idFornecedor: number,
    idOrcamentoCenario: number,
    idOrcamentoGrupo: number
  ): Observable<void> {
    this.atualizarFornecedor(idFornecedor, { loadingTransferencia: true });
    return this.http
      .post<void>(
        `${this._target}/orcamento-cenarios/${idOrcamentoCenario}/orcamento-grupos/${idOrcamentoGrupo}/aw-estimado`,
        undefined
      )
      .pipe(
        tap(() => {
          this.transferirTotal(
            item => item.indicadorAWReferencia,
            item => item.indicadorAWEstimado && !item.omisso
          );
        }),
        finalize(() => {
          this.atualizarFornecedor(idFornecedor, { loadingTransferencia: false });
        })
      );
  }

  selecionarTodosHttp(
    idOrcamentoGrupo: number,
    idProposta: number,
    idOrcamentoCenario: number,
    selecionar: boolean
  ): Observable<void> {
    const params = new AwHttpParams({ idOrcamentoCenario, selecionar });
    return this.http.post<void>(
      `${this._target}/orcamento-grupo/${idOrcamentoGrupo}/proposta/${idProposta}`,
      undefined,
      { params }
    );
  }

  selecionarTodos(
    idOrcamentoGrupo: number,
    idFornecedor: number,
    idProposta: number,
    idOrcamentoCenario: number,
    selecionar: boolean
  ): Observable<void> {
    this.atualizarFornecedor(idFornecedor, { loadingSelecionar: true });
    return this.selecionarTodosHttp(idOrcamentoGrupo, idProposta, idOrcamentoCenario, selecionar).pipe(
      tap(() => {
        this.mapItens(item => {
          if (!item.omisso) {
            item = {
              ...item,
              idPropostaItemSelecionado: selecionar && item.idFornecedor === idFornecedor ? item.idPropostaItem : null,
            };
          }
          return item;
        });
      }),
      finalize(() => {
        this.atualizarFornecedor(idFornecedor, { loadingSelecionar: false });
      })
    );
  }

  salvarValorUnitarioAwReferenciaHttp(
    idPropostaItem: number,
    payload: EpPropostaItemValorUnitarioPayload
  ): Observable<void> {
    return this.http.post<void>(`${this._target}/proposta-itens/${idPropostaItem}/valor-unitario`, payload);
  }

  salvarValorUnitarioAwReferencia(
    idPropostaItem: number,
    idOrcamentoGrupoItem: number,
    payload: EpPropostaItemValorUnitarioPayload
  ): Observable<void> {
    const predicate = (item: EpPropostaItem) => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem;
    this.epPropostaItemStore.update(predicate, { loadingValorUnitario: true });
    return this.salvarValorUnitarioAwReferenciaHttp(idPropostaItem, payload).pipe(
      tap(() => {
        this.mapItens(item => {
          if (item.idPropostaItem === idPropostaItem) {
            item = {
              ...item,
              valorUnitarioProdutoPropostaItem: payload.valorProduto,
              valorUnitarioServicoPropostaItem: payload.valorServico,
            };
          }
          if (item.idOrcamentoGrupoItem === idOrcamentoGrupoItem) {
            item = { ...item, loadingValorUnitario: false };
          }
          return item;
        });
      }),
      catchAndThrow(() => {
        this.epPropostaItemStore.update(predicate, { loadingValorUnitario: false });
      })
    );
  }

  selecionarPropostaItem(
    idOrcamentoGrupoItem: number,
    idProposta: number,
    idPropostaItem: number,
    idOrcamentoCenario: number
  ): Observable<void> {
    this.epPropostaItemStore.update(idPropostaItem, { loadingSelecionar: true });
    const params = new AwHttpParams({ idOrcamentoCenario });
    return this.http
      .post<void>(`${this._target}/proposta/${idProposta}/proposta-itens/${idPropostaItem}`, undefined, { params })
      .pipe(
        tap(() => {
          this.epPropostaItemStore.update(
            item =>
              item.idOrcamentoGrupoItem === idOrcamentoGrupoItem &&
              (item.idPropostaItem === idPropostaItem || item.idPropostaItemSelecionado === item.idPropostaItem),
            item => ({
              ...item,
              idPropostaItemSelecionado: item.idPropostaItem === idPropostaItem ? item.idPropostaItem : null,
            })
          );
        }),
        finalize(() => {
          this.epPropostaItemStore.update(idPropostaItem, { loadingSelecionar: false });
        })
      );
  }

  desselecionarPropostaItem(idProposta: number, idPropostaItem: number, idOrcamentoCenario: number): Observable<void> {
    this.epPropostaItemStore.update(idPropostaItem, { loadingSelecionar: true });
    const params = new AwHttpParams({ idOrcamentoCenario });
    return this.http.delete<void>(`${this._target}/${idProposta}/proposta-itens/${idPropostaItem}`, { params }).pipe(
      tap(() => {
        this.epPropostaItemStore.update(idPropostaItem, {
          idPropostaItemSelecionado: null,
          loadingSelecionar: false,
        });
      }),
      catchAndThrow(() => {
        this.epPropostaItemStore.update(idPropostaItem, { loadingSelecionar: false });
      })
    );
  }

  transferirQuantidadeParaAwReferencia(
    idProposta: number,
    idPropostaItem: number,
    idOrcamentoGrupoItem: number
  ): Observable<void> {
    this.epPropostaItemStore.update(idPropostaItem, { loadingTransferenciaQuantidade: true });
    const itemAwReferencia = this.epPropostaItemQuery.getItemAwReferencia(idOrcamentoGrupoItem);
    return this.http
      .post<void>(`${this._target}/${idProposta}/proposta-itens/${idPropostaItem}/quantidade`, undefined)
      .pipe(
        tap(() => {
          this.mapItens((item, _, itens) => {
            if (item.idPropostaItem === itemAwReferencia.idPropostaItem && item.indicadorAWReferencia && !item.omisso) {
              const { quantidadeItens, quantitativos } = itens.find(itemF => itemF.idPropostaItem === idPropostaItem);
              item = { ...item, quantidadeItens };
              if (item.quantitativos?.length) {
                item = epPropostaItemCopyQuantitativo(item, quantitativos);
              }
            }
            return item;
          });
        }),
        finalize(() => {
          this.epPropostaItemStore.update(idPropostaItem, { loadingTransferenciaQuantidade: false });
        })
      );
  }

  setLoadingValorUnitario(
    idPropostaItem: number,
    idOrcamentoGrupoItem: number,
    loading: boolean,
    loadingKey: 'Produto' | 'Servico' | '' = ''
  ): void {
    const keyLoading = `loadingTransferenciaValorUnitario${loadingKey}`;
    this.epPropostaItemStore.update(
      item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
      item => ({
        ...item,
        loadingValorUnitario: item.idPropostaItem !== idPropostaItem ? loading : item.loadingValorUnitario,
        [keyLoading]: item.idPropostaItem === idPropostaItem ? loading : item[keyLoading],
      })
    );
  }

  transferirValorUnitarioParaAwReferencia(
    idPropostaItem: number,
    idOrcamentoGrupoItem: number,
    payload: Partial<EpPropostaItemValorUnitarioPayload>,
    loading: 'Produto' | 'Servico' | '' = ''
  ): Observable<void> {
    this.setLoadingValorUnitario(idPropostaItem, idOrcamentoGrupoItem, true, loading);
    const itemAwReferencia = this.epPropostaItemQuery.getItemAwReferencia(idOrcamentoGrupoItem);
    const newPayload: EpPropostaItemValorUnitarioPayload = {
      valorServico: itemAwReferencia.valorUnitarioServicoPropostaItem,
      valorProduto: itemAwReferencia.valorUnitarioProdutoPropostaItem,
      awReferencia: true,
      ...payload,
    };
    return this.salvarValorUnitarioAwReferenciaHttp(itemAwReferencia.idPropostaItem, newPayload).pipe(
      tap(() => {
        this.epPropostaItemStore.update(itemAwReferencia.idPropostaItem, {
          valorUnitarioProdutoPropostaItem: newPayload.valorProduto,
          valorUnitarioServicoPropostaItem: newPayload.valorServico,
        });
      }),
      finalize(() => {
        this.setLoadingValorUnitario(idPropostaItem, idOrcamentoGrupoItem, false, loading);
      })
    );
  }

  getQuantitativo(idOrcamentoGrupoItem: number): Observable<any[]> {
    this.epPropostaItemStore.update(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem, {
      loadingQuantitativo: true,
    });
    return this.http
      .get<EpOrcamentoGrupoItemQuantitativoFase[]>(
        `${this._target}/orcamento-grupo-item/${idOrcamentoGrupoItem}/quantitativos`
      )
      .pipe(
        map(fases =>
          fases.map(fase => ({
            ...fase,
            pavimentos: fase.pavimentos.map(pavimento => ({
              ...pavimento,
              centrosCustos: pavimento.centrosCustos.map(centroCusto => ({
                ...centroCusto,
                fornecedores: orderEpFornecedor(centroCusto.fornecedores),
              })),
            })),
          }))
        ),
        tap(fases => {
          this.epPropostaItemStore.update(
            item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
            item => ({
              ...item,
              quantitativos: mapQuantitativoToPropostaItem(item.idPropostaItem, item.idFornecedor, fases),
              loadingQuantitativo: false,
            })
          );
        }),
        catchAndThrow(() => {
          this.epPropostaItemStore.update(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem, {
            loadingQuantitativo: false,
          });
        })
      );
  }

  openQuantitativo(
    idOrcamentoGrupoItem: number,
    skipRequest = false
  ): Observable<EpOrcamentoGrupoItemQuantitativoFase[]> {
    let request$ = of([]);
    if (!skipRequest) {
      request$ = this.getQuantitativo(idOrcamentoGrupoItem);
    }
    return request$.pipe(
      tap(() => {
        this.epPropostaItemStore.update(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem, {
          quantitativoOpened: true,
        });
      })
    );
  }

  closeQuantitativo(idOrcamentoGrupoItem: number): void {
    this.epPropostaItemStore.update(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem, {
      quantitativoOpened: false,
    });
  }

  setQuantitativoLoading(
    idOrcamentoGrupoItem: number,
    idFasePavimentoCentro: string,
    idQuantitativo: string,
    loading: boolean
  ): void {
    this.atualizarItemQuantitativo(
      item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
      quantitativo => quantitativo.idFasePavimentoCentro === idFasePavimentoCentro,
      quantitativo => ({
        ...quantitativo,
        loading: quantitativo.id === idQuantitativo ? loading : quantitativo.loading,
        disabled: quantitativo.id !== idQuantitativo ? loading : quantitativo.disabled,
      })
    );
  }

  atualizarQuantitativoAwReferencia(
    idOrcamentoGrupoItem: number,
    idFasePavimentoCentro: string,
    idQuantitativo: string,
    quantidade: number
  ): Observable<void> {
    const predicate = (item: EpPropostaItem) => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem;
    const { id, idProjetoCentroCusto, idProjetoEdificioPavimento, idFase } =
      this.epPropostaItemQuery.getQuantitativoAwReferencia(idOrcamentoGrupoItem, idFasePavimentoCentro);
    const payload: EpPropostaItemQuantitativoAtualizarPayload = {
      quantidade,
      idProjetoCentroCusto,
      idProjetoEdificioPavimento,
      idFase,
      idOrcamentoGrupoItem,
    };
    this.setQuantitativoLoading(idOrcamentoGrupoItem, idFasePavimentoCentro, idQuantitativo, true);
    return this.http.put<void>(`${this._target}/quantitativo`, payload).pipe(
      tap(() => {
        this.atualizarItemQuantitativo(predicate, id, { quantidade: payload.quantidade });
        this.epPropostaItemStore.update(
          item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem && item.indicadorAWReferencia,
          item => ({
            ...item,
            quantidadeItens: sumBy(item.quantitativos, 'quantidade'),
          })
        );
      }),
      finalize(() => {
        this.setQuantitativoLoading(idOrcamentoGrupoItem, idFasePavimentoCentro, idQuantitativo, false);
      })
    );
  }

  adicionarItemOmissoAoEscopo(
    idOrcamentoGrupo: number,
    idOrcamentoCenario: number,
    idProposta: number,
    idPropostaItem: number
  ): Observable<void> {
    this.epPropostaItemStore.update(idPropostaItem, { savingOmisso: true });
    return this.http.post<void>(`${this._target}/${idProposta}/item-omissos/${idPropostaItem}`, undefined).pipe(
      // Não queria usar esse refresh aqui, mas não tenho opção, seria muito dificil retornar algo do back-end
      refresh(
        this.get(idOrcamentoGrupo, idOrcamentoCenario).pipe(
          finalize(() => {
            // Fechar os collapses do item omisso, se não umas coisas bizarras acontecem
            this.epPropostaItemStore.update(idPropostaItem, {
              descricaoOpened: false,
              quantitativoOpened: false,
              valorUnitarioOpened: false,
            });
          })
        )
      ),
      finalize(() => {
        this.epPropostaItemStore.update(idPropostaItem, { savingOmisso: false });
      })
    );
  }

  excluirItemOmisso(idProposta: number, idPropostaItem: number): Observable<void> {
    this.epPropostaItemStore.update(idPropostaItem, { deletingOmisso: true });
    return this.http.delete<void>(`${this._target}/${idProposta}/item-omissos/${idPropostaItem}`).pipe(
      tap(() => {
        this.epPropostaItemStore.remove(idPropostaItem);
      }),
      catchAndThrow(() => {
        this.epPropostaItemStore.update(idPropostaItem, { deletingOmisso: false });
      })
    );
  }

  clearState(): void {
    this.epPropostaItemStore.reset();
  }

  getHistorico(idOrcamentoGrupo: number): Observable<EpHistorico[]> {
    return this.http.get<EpHistorico[]>(`${this._target}/${idOrcamentoGrupo}/historico`);
  }

  gerarRelatorio(idOrcamentoGrupo: number): Observable<string> {
    return this.http
      .post<{ url: string }>(`${this._target}/${idOrcamentoGrupo}/download-historico`, undefined)
      .pipe(pluck('url'));
  }
}
