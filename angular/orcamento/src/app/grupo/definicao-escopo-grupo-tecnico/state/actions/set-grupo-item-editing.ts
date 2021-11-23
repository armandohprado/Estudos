import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { KeyofGrupoItemTecnico } from '../../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemEditing
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico]  SetGrupoItemEditing';

  constructor(public idOrcamentoGrupoItem: number, public property: KeyofGrupoItemTecnico, public editing: boolean) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({ editingProperty: patch({ [this.property]: this.editing }) })
      )
    );
  }
}
