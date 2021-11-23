import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateCatalogoGrupoItemFilho } from './update-catalogo-grupo-item-filho';
import { Observable } from 'rxjs';
import { ProdutoCatalogoVariacoesResponse } from '../../models/produto-catalogo';
import { tap } from 'rxjs/operators';
import { maxBy, minBy } from 'lodash-es';

export class SetVariacoesProdutoCatalogoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetVariacoesProdutoCatalogoApi';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idProdutoCatalogo: number
  ) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<ProdutoCatalogoVariacoesResponse> {
    dispatch(
      new UpdateCatalogoGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        this.idProdutoCatalogo,
        { loading: true }
      )
    );
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItemPai);
    const grupoItemFilho = grupoItem.filhos.find(filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    const produto = grupoItemFilho.catalogo.find(p => p.idProdutoCatalogo === this.idProdutoCatalogo);
    return context.definicaoEscopoLojaInsumoService.getProdutoVariacoes(grupoItemFilho.id, produto.idProduto).pipe(
      tap(({ variacoes, variacoesPermitidas }) => {
        dispatch(
          new UpdateCatalogoGrupoItemFilho(
            this.idOrcamentoGrupoItemPai,
            this.idOrcamentoGrupoItem,
            this.idProdutoCatalogo,
            {
              loading: false,
              variacoes,
              skus: variacoesPermitidas,
              maxOptionVariacoes: maxBy(variacoes, 'optionNumber')?.optionNumber ?? 0,
              minOptionVariacoes: minBy(variacoes, 'optionNumber')?.optionNumber ?? 0,
            }
          )
        );
      })
    );
  }
}
