import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { getPaiFilho } from './utils';
import { ProdutoCatalogo, ProdutoCatalogoPayload } from '../../models/produto-catalogo';
import { map, pluck } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { UpdateProdutoGrupoItemFilho } from './update-produto-grupo-item-filho';
import { refreshMap } from '@aw-utils/rxjs/operators';

export class ChangeVariacaoProdutoSelecionado
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] ChangeVariacaoProdutoSelecionado';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idProdutoCatalogoOld: number,
    private produtoCatalogoNew: ProdutoCatalogoPayload
  ) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<ProdutoCatalogo> {
    const [, grupoItemFilho] = getPaiFilho(
      getState().grupoItens,
      this.idOrcamentoGrupoItemPai,
      this.idOrcamentoGrupoItem
    );
    const produtoOld = grupoItemFilho.produtos.find(produto => produto.idProdutoCatalogo === this.idProdutoCatalogoOld);
    dispatch(
      new UpdateProdutoGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        produtoOld.idOrcamentoGrupoItemProdutoCatalogo,
        { loading: true }
      )
    );
    const remover$ = context.definicaoEscopoLojaInsumoService.definicaoEscopoLojaService.deleteProduto(
      produtoOld.idOrcamentoGrupoItemProdutoCatalogo
    );
    const adicionar$ = context.definicaoEscopoLojaInsumoService.postProduto(
      this.idOrcamentoGrupoItem,
      this.produtoCatalogoNew
    );
    return forkJoin([adicionar$, remover$]).pipe(
      pluck(0),
      map(response => {
        if (response?.responseMessage?.erro) {
          throw response.responseMessage.erro;
        } else {
          return response.produtoCatalogo;
        }
      }),
      refreshMap(produtoCatalogo => {
        return dispatch(
          new UpdateProdutoGrupoItemFilho(
            this.idOrcamentoGrupoItemPai,
            this.idOrcamentoGrupoItem,
            produtoOld.idOrcamentoGrupoItemProdutoCatalogo,
            { ...produtoCatalogo, loading: false }
          )
        );
      })
    );
  }
}
