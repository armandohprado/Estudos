import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, removeItem } from '@ngxs/store/operators';
import { GrupoItemKit } from '../../models/grupo-item';
import { UpdateCatalogoGrupoItem } from './update-catalogo-grupo-item';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { UpdateGrupoItem } from './update-grupo-item';
import { RefreshFilhos } from './refresh-filhos';
import { CalcularValorReferenciaGrupoItem } from './calcular-valor-referencia-grupo-item';

export class ExcluirProdutoGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] ExcluirProdutoGrupoItemApi';

  constructor(public idOrcamentoGrupoItem: number, public idKit: number) {}

  action(
    { dispatch, setState, getState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<void> {
    const grupoItem = getState().grupoItens.find(g => g.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    const kit = grupoItem.produtos.find(k => k.idKit === this.idKit);
    if (!kit) return;
    dispatch([
      new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'produtos', 'loading'),
      new UpdateCatalogoGrupoItem(this.idOrcamentoGrupoItem, this.idKit, {
        loading: true,
      }),
    ]);
    return definicaoEscopoLojaInsumoKitService
      .deleteProduto(this.idOrcamentoGrupoItem, kit.idOrcamentoGrupoItemKit)
      .pipe(
        tap(() => {
          dispatch([
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItem,
              patch<GrupoItemKit>({
                produtos: removeItem(prod => prod.idOrcamentoGrupoItemKit === kit.idOrcamentoGrupoItemKit),
              })
            ),
            new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'produtos', null),
            new UpdateCatalogoGrupoItem(this.idOrcamentoGrupoItem, this.idKit, {
              loading: false,
              selecionadoCatalogo: false,
              idOrcamentoGrupoItemKit: 0,
            }),
          ]);
          dispatch([
            new CalcularValorReferenciaGrupoItem(this.idOrcamentoGrupoItem),
            new RefreshFilhos(this.idOrcamentoGrupoItem),
          ]);
        })
      );
  }
}
