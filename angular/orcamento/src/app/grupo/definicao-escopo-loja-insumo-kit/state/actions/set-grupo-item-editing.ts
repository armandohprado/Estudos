import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { KeyofGrupoItemKit } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemEditing
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoKitStateModel,
      DefinicaoEscopoLojaInsumoKitState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  SetGrupoItemEditing';

  constructor(
    public idOrcamentoGrupoItem: number,
    public property: KeyofGrupoItemKit,
    public editing: boolean
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({ editingProperty: patch({ [this.property]: this.editing }) })
      )
    );
  }
}
