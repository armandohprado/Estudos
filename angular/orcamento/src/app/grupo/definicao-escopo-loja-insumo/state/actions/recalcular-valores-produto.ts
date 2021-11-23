import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { getPaiFilho } from './utils';
import { sumBy } from 'lodash-es';
import { forkJoin, Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { GrupoItemDELI } from '../../models/grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';

export class RecalcularValoresProduto
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] RecalcularValoresProduto';

  constructor(private idOrcamentoGrupoItemPai: number, private idOrcamentoGrupoItem: number) {}

  ctx: StateContext<DefinicaoEscopoLojaInsumoStateModel>;
  state: DefinicaoEscopoLojaInsumoState;

  action(
    ctx: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<[GenericResponse, GenericResponse]> {
    this.ctx = ctx;
    this.state = context;
    const { getState } = ctx;
    const [grupoItemPai, grupoItemFilho] = getPaiFilho(
      getState().grupoItens,
      this.idOrcamentoGrupoItemPai,
      this.idOrcamentoGrupoItem
    );
    const valorFilho =
      sumBy(
        grupoItemFilho.produtos.filter(p => p.selecionado),
        'precoRegiao'
      ) ?? 0;
    const updatePai$ = this.updatePai(grupoItemPai, valorFilho);
    const updateFilho$ = this.updateFilho(valorFilho);
    return forkJoin([updatePai$, updateFilho$]);
  }

  private updateFilho(valor: number): Observable<GenericResponse> {
    return this.state.definicaoEscopoLojaInsumoService.definicaoEscopoService
      .putValoresTag(this.idOrcamentoGrupoItem, {
        valorUnitarioProdutoReferencia: valor,
      })
      .pipe(
        tap(() => {
          this.ctx.dispatch(
            new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
              valorProduto: valor,
            })
          );
        })
      );
  }

  private updatePai(grupoItem: GrupoItemDELI, valorFilho: number): Observable<GenericResponse> {
    const valor =
      sumBy(
        grupoItem.filhos.filter(f => f.idOrcamentoGrupoItem !== this.idOrcamentoGrupoItem),
        'valorProduto'
      ) ?? 0;
    return this.state.definicaoEscopoLojaInsumoService.definicaoEscopoService
      .putValoresTag(this.idOrcamentoGrupoItemPai, {
        valorUnitarioProdutoReferencia: valor + valorFilho,
      })
      .pipe(
        tap(() => {
          this.ctx.dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItemPai, {
              valorUnitarioProdutoReferencia: valor + valorFilho,
            })
          );
        })
      );
  }
}
