import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { KeyofGrupoItemDELI } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemEditing
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo]  SetGrupoItemEditing';

  constructor(
    public idOrcamentoGrupoItem: number,
    public property: KeyofGrupoItemDELI,
    public editing: boolean
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({ editingProperty: patch({ [this.property]: this.editing }) })
      )
    );
  }
}
