import { StateContext, StateOperator } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { GrupoItemTecnico, GrupoItemTecnicoID } from '../../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, updateItem } from '@ngxs/store/operators';
import { isFunction } from 'lodash-es';

export class UpdateGrupoItem
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico]  UpdateGrupoItem';

  constructor(
    public id: number,
    public partialOrOperator: Partial<GrupoItemTecnico> | StateOperator<GrupoItemTecnico>,
    public propertyId: GrupoItemTecnicoID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { setState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): void {
    const operator = isFunction(this.partialOrOperator) ? this.partialOrOperator : patch(this.partialOrOperator);
    setState(
      patch({
        grupoItens: updateItem(item => item[this.propertyId] === this.id, operator),
      })
    );
  }
}
