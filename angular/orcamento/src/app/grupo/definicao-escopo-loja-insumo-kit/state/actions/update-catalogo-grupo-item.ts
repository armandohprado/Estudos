import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItem } from './update-grupo-item';
import { patch, updateItem } from '@ngxs/store/operators';
import { Kit } from '../../models/kit';

export class UpdateCatalogoGrupoItem
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] UpdateCatalogoGrupoItem';

  constructor(public idOrcamentoGrupoItem: number, public idKit: number, public catalogo: Partial<Kit>) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({
          catalogo: updateItem<Kit>(item => item.idKit === this.idKit, patch(this.catalogo)),
        })
      )
    );
  }
}
