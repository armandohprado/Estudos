import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { GrupoItemTecnicoID } from '../../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemLoading
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico]  SetGrupoItemLoading';

  constructor(
    public id: number,
    public loading: boolean,
    public propertyId: GrupoItemTecnicoID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): void {
    dispatch(new UpdateGrupoItem(this.id, { loading: this.loading }, this.propertyId));
  }
}
