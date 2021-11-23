import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { insertItem, patch } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { Kit } from '../../models/kit';

export class AddProdutoGrupoItem
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoKitStateModel,
      DefinicaoEscopoLojaInsumoKitState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] AddProdutoGrupoItem';

  constructor(public idOrcamentoGrupoItem: number, public kit: Kit) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({
          produtos: insertItem(this.kit),
        })
      )
    );
  }
}
