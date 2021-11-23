import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateProdutoGrupoItemFilhoApi } from './update-produto-grupo-item-filho-api';
import { Observable } from 'rxjs';
import { RecalcularValoresProduto } from './recalcular-valores-produto';
import { tap } from 'rxjs/operators';

export class SetProdutoSelecionadoGrupoItemFilhoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetProdutoSelecionadoGrupoItemFilhoApi';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemProdutoCatalogo: number,
    public selecionado: boolean
  ) {}

  action({ dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>): Observable<void> {
    const grupoItem = getState().grupoItens.find(item => item.idOrcamentoGrupoItem === this.idOrcamentoGrupoItemPai);
    if (!grupoItem) return;
    const grupoItemFilho = grupoItem.filhos.find(filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    if (!grupoItemFilho) return;
    const produto = grupoItemFilho.produtos.find(
      prod => prod.idOrcamentoGrupoItemProdutoCatalogo === this.idOrcamentoGrupoItemProdutoCatalogo
    );
    const produtoSelecionado = grupoItemFilho.produtos.find(
      prod =>
        prod.idProdutoCatalogo !== produto.idProdutoCatalogo &&
        prod.idFornecedor === produto.idFornecedor &&
        prod.selecionado
    );
    if (!produto) return;
    const actions: any[] = [
      new UpdateProdutoGrupoItemFilhoApi(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        this.idOrcamentoGrupoItemProdutoCatalogo,
        {
          selecionado: this.selecionado,
          idOrcamentoGrupoItemProdutoCatalogo: produto.idOrcamentoGrupoItemProdutoCatalogo,
          complemento: produto.complemento,
          idOrcamentoGrupoItem: produto.idOrcamentoGrupoItem,
          idProdutoCatalogo: produto.idProdutoCatalogo,
          idFornecedor: produto.idFornecedor,
        }
      ),
    ];
    if (produtoSelecionado && this.selecionado) {
      actions.push(
        new UpdateProdutoGrupoItemFilhoApi(
          this.idOrcamentoGrupoItemPai,
          this.idOrcamentoGrupoItem,
          produtoSelecionado.idOrcamentoGrupoItemProdutoCatalogo,
          {
            selecionado: false,
            idProdutoCatalogo: produtoSelecionado.idProdutoCatalogo,
            idOrcamentoGrupoItemProdutoCatalogo: produtoSelecionado.idOrcamentoGrupoItemProdutoCatalogo,
            idOrcamentoGrupoItem: produtoSelecionado.idOrcamentoGrupoItem,
            complemento: produtoSelecionado.complemento,
            idFornecedor: produtoSelecionado.idFornecedor,
          }
        )
      );
    }
    return dispatch(actions).pipe(
      tap(() => {
        dispatch(new RecalcularValoresProduto(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem));
      })
    );
  }
}
