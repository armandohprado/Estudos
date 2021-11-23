import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { tap } from 'rxjs/operators';
import { UpdateProdutoGrupoItemApi } from './update-produto-grupo-item-api';
import { Observable } from 'rxjs';
import { RefreshFilhos } from './refresh-filhos';
import { CalcularValorReferenciaGrupoItem } from './calcular-valor-referencia-grupo-item';

export class SetProdutoSelecionadoGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] SetProdutoSelecionadoGrupoItemApi';

  constructor(
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemKit: number,
    public selecionado: boolean
  ) {}

  action({ dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>): Observable<void> {
    const grupoItem = getState().grupoItens.find(item => item.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    if (!grupoItem) return;
    const produto = grupoItem.produtos.find(prod => prod.idOrcamentoGrupoItemKit === this.idOrcamentoGrupoItemKit);
    if (!produto || produto.selecionado) return;
    const produtoSelecionado = grupoItem.produtos.find(
      prod => prod.idFornecedor === produto.idFornecedor && prod.selecionado
    );
    const actions = [
      new UpdateProdutoGrupoItemApi(this.idOrcamentoGrupoItem, this.idOrcamentoGrupoItemKit, {
        selecionado: this.selecionado,
        idKit: produto.idKit,
        idOrcamentoGrupoItem: grupoItem.idOrcamentoGrupoItem,
        idOrcamentoGrupoItemKit: produto.idOrcamentoGrupoItemKit,
        idFornecedor: produto.idFornecedor,
      }),
    ];
    if (produtoSelecionado && this.selecionado) {
      actions.push(
        new UpdateProdutoGrupoItemApi(this.idOrcamentoGrupoItem, produtoSelecionado.idOrcamentoGrupoItemKit, {
          selecionado: false,
          idOrcamentoGrupoItemKit: produtoSelecionado.idOrcamentoGrupoItemKit,
          idOrcamentoGrupoItem: grupoItem.idOrcamentoGrupoItem,
          idKit: produtoSelecionado.idKit,
          idFornecedor: produtoSelecionado.idFornecedor,
        })
      );
    }
    return dispatch(actions).pipe(
      tap(() => {
        dispatch([
          new CalcularValorReferenciaGrupoItem(this.idOrcamentoGrupoItem),
          new RefreshFilhos(this.idOrcamentoGrupoItem),
        ]);
      })
    );
  }
}
