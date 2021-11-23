import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, updateItem } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { Kit } from '../../models/kit';

export class UpdateProdutoGrupoItem
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] UpdateProdutoGrupoItemFilho';

  constructor(public idOrcamentoGrupoItem: number, public idOrcamentoGrupoItemKit: number, public kit: Partial<Kit>) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({
          produtos: updateItem<Kit>(
            produto => produto.idOrcamentoGrupoItemKit === this.idOrcamentoGrupoItemKit,
            patch(this.kit)
          ),
        })
      )
    );
  }
}
