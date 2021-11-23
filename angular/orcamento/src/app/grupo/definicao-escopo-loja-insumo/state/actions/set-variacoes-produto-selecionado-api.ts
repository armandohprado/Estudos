import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { ProdutoCatalogoVariacoesResponse } from '../../models/produto-catalogo';
import { tap } from 'rxjs/operators';
import { maxBy, minBy } from 'lodash-es';
import { UpdateProdutoGrupoItemFilho } from './update-produto-grupo-item-filho';

export class SetVariacoesProdutoSelecionadoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetVariacoesProdutoSelecionadoApi';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idOrcamentoGrupoItemProdutoCatalogo: number
  ) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<ProdutoCatalogoVariacoesResponse> {
    dispatch(
      new UpdateProdutoGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        this.idOrcamentoGrupoItemProdutoCatalogo,
        { loading: true, variacoes: [], skus: [] }
      )
    );
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItemPai);
    const grupoItemFilho = grupoItem.filhos.find(filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    const produto = grupoItemFilho.produtos.find(
      p => p.idOrcamentoGrupoItemProdutoCatalogo === this.idOrcamentoGrupoItemProdutoCatalogo
    );
    return context.definicaoEscopoLojaInsumoService.getProdutoVariacoes(grupoItemFilho.id, produto.idProduto).pipe(
      tap(({ variacoes, variacoesPermitidas }) => {
        dispatch(
          new UpdateProdutoGrupoItemFilho(
            this.idOrcamentoGrupoItemPai,
            this.idOrcamentoGrupoItem,
            this.idOrcamentoGrupoItemProdutoCatalogo,
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
