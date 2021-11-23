import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { GrupoItemTecnicoID, KeyofGrupoItemTecnico } from '../../models/grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemStatus
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SetGrupoItemStatus';

  constructor(
    public id: number,
    public property: KeyofGrupoItemTecnico,
    public status: AwInputStatus,
    public propertyId: GrupoItemTecnicoID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
  ): void {
    dispatch(
      new UpdateGrupoItem(this.id, patch({ statusProperty: patch({ [this.property]: this.status }) }), this.propertyId)
    );
    if (this.status === 'completed') {
      setTimeout(() => dispatch(new SetGrupoItemStatus(this.id, this.property, null, this.propertyId)), 2000);
    }
  }
}
