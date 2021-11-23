import { Inject, Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { EpPropostaItemState, EpPropostaItemStore } from './ep-proposta-item.store';
import { auditTime, distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { EpPropostaItem, EpPropostaItemPropertyComparativo } from '../../model/item';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { DOCUMENT } from '@angular/common';
import { EpFornecedorTotal } from '../../model/fornecedor';
import { epColumnWidth, epFirstColumnWidth } from '../../constants';
import { EpPropostaItemQuantitativoItem } from '../../model/item-quantitativo';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { epPropostaItemGetValorTotal, epPropostaItemSumValorTotal } from '../../utils';
import { EpBloqueios } from '../../model/informacaoes';
import { bloqueiaProduto } from '../../../../grupo/definicao-escopo/shared/bloqueia-produto.pipe';
import { bloqueiaServico } from '../../../../grupo/definicao-escopo/shared/bloqueia-servico.pipe';

@Injectable({ providedIn: 'root' })
export class EpPropostaItemQuery extends QueryEntity<EpPropostaItemState> {
  constructor(
    protected store: EpPropostaItemStore,
    @Inject(WINDOW_TOKEN) private window: Window,
    @Inject(DOCUMENT) private document: Document
  ) {
    super(store);
  }

  fornecedores$ = this.select('fornecedores');
  fornecedoresSelect$ = this.fornecedores$.pipe(
    map(fornecedores => fornecedores.filter(fornecedor => !fornecedor.indicadorAWReferencia))
  );
  fornecedoresSelecionados$ = this.fornecedores$.pipe(
    map(fornecedores => fornecedores.filter(fornecedor => fornecedor.selecionado))
  );
  fornecedoresSelecionadosCount$ = this.fornecedoresSelecionados$.pipe(
    map(fornecedores => fornecedores.length),
    distinctUntilChanged()
  );
  fornecedoresSelecionadosSet$ = this.fornecedoresSelecionados$.pipe(
    map(fornecedores => new Set(fornecedores.map(fornecedor => fornecedor.idFornecedor)))
  );
  itens$ = this.selectAll();
  collapseFornecedorHeader$ = this.select('collapseFornecedorHeader').pipe(distinctUntilChanged());
  loadingSelecionar$ = this.fornecedores$.pipe(
    map(fornecedores => fornecedores.some(fornecedor => fornecedor.loadingSelecionar)),
    distinctUntilChanged()
  );

  resize$ = fromEvent(this.window, 'resize').pipe(
    auditTime(350),
    startWith(1),
    map(() => this.document.body.clientWidth)
  );

  offsetColumns$: Observable<null[]> = combineLatest([this.fornecedoresSelecionadosCount$, this.resize$]).pipe(
    map(([fornecedores, width]) =>
      Math.floor((width - epFirstColumnWidth - fornecedores * epColumnWidth) / epColumnWidth)
    ),
    distinctUntilChanged(),
    map(length => Array.from({ length }).map(() => null)),
    shareReplay()
  );
  totalColumns$ = combineLatest([this.offsetColumns$, this.fornecedoresSelecionadosCount$]).pipe(
    map(([offsetColumns, fornecedores]) => offsetColumns.length + fornecedores),
    distinctUntilChanged()
  );
  nomeGrupo$ = this.select(['nomeGrupo', 'codigoGrupo']).pipe(
    map(({ nomeGrupo, codigoGrupo }) => `${codigoGrupo} - ${nomeGrupo}`),
    distinctUntilChanged()
  );
  indiceComparativa$ = this.select('indiceComparativa');
  uniqueItens$: Observable<EpPropostaItem[]> = combineLatest([
    this.fornecedoresSelecionadosSet$,
    this.itens$.pipe(
      map(itens =>
        itens
          .filter(item => !item.omisso && item.indicadorAWReferencia)
          .map(item => ({
            ...item,
            columns: itens.filter(itemColumn => itemColumn.idOrcamentoGrupoItem === item.idOrcamentoGrupoItem),
          }))
      )
    ),
  ]).pipe(
    map(([fornecedoresSelecionadosSet, itens]) =>
      itens
        .filter(item => fornecedoresSelecionadosSet.has(item.idFornecedor))
        .map(item => ({
          ...item,
          columns: item.columns.filter(itemColumn => fornecedoresSelecionadosSet.has(itemColumn.idFornecedor)),
          loadingSelecionar: item.columns.some(itemColumn => itemColumn.loadingSelecionar),
        }))
    )
  );
  itensOmisso$: Observable<EpPropostaItem[]> = combineLatest([
    this.fornecedoresSelecionadosSet$,
    this.itens$.pipe(map(itens => itens.filter(item => item.omisso))),
  ]).pipe(
    map(([fornecedoresSelecionadosSet, itens]) =>
      itens
        .filter(item => fornecedoresSelecionadosSet.has(item.idFornecedor))
        .map(item => ({
          ...item,
          columns: [...fornecedoresSelecionadosSet].map(idFornecedor =>
            itens.find(itemF => itemF.idFornecedor === idFornecedor && itemF.idPropostaItem === item.idPropostaItem)
          ),
        }))
    ),
    orderByOperator('orderOmisso')
  );
  classficacao$ = this.select('classificacao');
  valorTotalSelecionado$: Observable<number> = this.itens$.pipe(
    map(itens =>
      epPropostaItemSumValorTotal(
        itens.filter(item => !item.omisso && item.idPropostaItem === item.idPropostaItemSelecionado)
      )
    )
  );
  disabledAwReferenciaInputs$ = this.fornecedores$.pipe(
    map(fornecedores => fornecedores.some(fornecedor => fornecedor.loadingTransferencia)),
    distinctUntilChanged()
  );
  bloqueios$: Observable<EpBloqueios> = this.classficacao$.pipe(
    map(classificacao => ({ produto: bloqueiaProduto(classificacao), servico: bloqueiaServico(classificacao) }))
  );

  selectItensFornecedor(idFornecedor: number): Observable<EpPropostaItem[]> {
    return this.itens$.pipe(map(itens => itens.filter(item => item.idFornecedor === idFornecedor)));
  }

  selectAllItensSelected(idFornecedor: number): Observable<boolean> {
    return this.selectItensFornecedor(idFornecedor).pipe(
      map(itens => itens.every(item => item.idPropostaItemSelecionado === item.idPropostaItem)),
      distinctUntilChanged()
    );
  }

  selectTotalFornecedor(idFornecedor: number): Observable<EpFornecedorTotal> {
    return this.selectItensFornecedor(idFornecedor).pipe(
      map(itens => {
        return {
          valorTotalParcial: epPropostaItemSumValorTotal(
            itens.filter(item => item.idPropostaItemSelecionado === item.idPropostaItem)
          ),
          valorTotal: epPropostaItemSumValorTotal(itens),
        };
      }),
      distinctUntilChanged()
    );
  }

  compareItemWithAwReferenia(
    idPropostaItem: number,
    property: EpPropostaItemPropertyComparativo,
    idFasePavimentoCentro?: string
  ): Observable<number> {
    const item$ = this.selectEntity(idPropostaItem);
    const itemAwReferencia$ = item$.pipe(
      switchMap(item =>
        this.selectEntity(
          entity => entity.idOrcamentoGrupoItem === item.idOrcamentoGrupoItem && entity.idFornecedor === -1
        )
      )
    );
    return combineLatest([item$, itemAwReferencia$]).pipe(
      map(([item, itemAwReferencia]) => {
        switch (property) {
          case 'valorTotal': {
            const valorTotalItem = epPropostaItemGetValorTotal(item);
            const valorTotalAwReferencia = epPropostaItemGetValorTotal(itemAwReferencia);
            return [valorTotalItem, valorTotalAwReferencia];
          }
          case 'quantitativos': {
            const quantitativoAwReferencia = itemAwReferencia.quantitativos.find(
              quantitativo => quantitativo.idFasePavimentoCentro === idFasePavimentoCentro
            ).quantidade;
            const quantitativoItem = item.quantitativos.find(
              quantitativo => quantitativo.idFasePavimentoCentro === idFasePavimentoCentro
            ).quantidade;
            return [quantitativoItem, quantitativoAwReferencia];
          }
          case 'valorUnitario': {
            const valorItem = item.valorUnitarioProdutoPropostaItem + item.valorUnitarioServicoPropostaItem;
            const valorAwReferencia =
              itemAwReferencia.valorUnitarioProdutoPropostaItem + itemAwReferencia.valorUnitarioServicoPropostaItem;
            return [valorItem, valorAwReferencia];
          }
          default: {
            return [item[property], itemAwReferencia[property]];
          }
        }
      }),
      map(([valorItem, valorAwReferencia]) => (valorAwReferencia && valorItem ? valorItem / valorAwReferencia - 1 : 0))
    );
  }

  compareFornecedorTotalWithAwReferencia(idFornecedor: number): Observable<number> {
    return combineLatest([this.selectTotalFornecedor(idFornecedor), this.selectTotalFornecedor(-1)]).pipe(
      map(([fornecedor, fornecedorAwReferencia]) =>
        fornecedorAwReferencia.valorTotal && fornecedor.valorTotal
          ? (fornecedor.valorTotal - fornecedorAwReferencia.valorTotal) / fornecedorAwReferencia.valorTotal
          : 0
      )
    );
  }

  selectItemSelecionado(idOrcamentoGrupoItem: number): Observable<EpPropostaItem | undefined> {
    return this.itens$.pipe(
      map(itens =>
        itens.find(
          item =>
            item.idOrcamentoGrupoItem === idOrcamentoGrupoItem && item.idPropostaItem === item.idPropostaItemSelecionado
        )
      )
    );
  }

  selectItemDisabled(idPropostaItem: number): Observable<boolean> {
    const item$ = this.selectEntity(idPropostaItem);
    const itemSelecionado$ = item$.pipe(
      switchMap(item => this.selectItemSelecionado(item.idOrcamentoGrupoItem)),
      distinctUntilChanged((itemA, itemB) => itemA && itemB && itemA.idPropostaItem === itemB.idPropostaItem)
    );
    return combineLatest([item$, itemSelecionado$]).pipe(
      map(([item, itemSelecionado]) => itemSelecionado && itemSelecionado.idPropostaItem !== item.idPropostaItem),
      distinctUntilChanged()
    );
  }

  getIdsFornecedoresSelect(): number[] {
    return this.getValue()
      .fornecedores.filter(fornecedor => !fornecedor.indicadorAWReferencia)
      .map(fornecedor => fornecedor.idFornecedor);
  }

  getIndiceComparativa(): number {
    return this.getValue().indiceComparativa;
  }

  getItemAwReferencia(idOrcamentoGrupoItem: number): EpPropostaItem {
    return this.getAll().find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem && item.indicadorAWReferencia);
  }

  getQuantitativoAwReferencia(
    idOrcamentoGrupoItem: number,
    idFasePavimentoCentro: string
  ): EpPropostaItemQuantitativoItem {
    return this.getItemAwReferencia(idOrcamentoGrupoItem).quantitativos.find(
      quantitativo => quantitativo.idFasePavimentoCentro === idFasePavimentoCentro
    );
  }
}
