import { GrupoItemDE } from '../../model/grupo-item';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { StateContext, StateOperator } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { isFunction } from 'lodash-es';

export class UpdateGrupoItem implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] UpdateGrupoItem';
  constructor(
    public id: number,
    public grupoItem: Partial<GrupoItemDE> | StateOperator<GrupoItemDE>,
    public property: 'idOrcamentoGrupoItem' | 'idGrupoItem' = 'idOrcamentoGrupoItem'
  ) {}

  action({ setState }: StateContext<DefinicaoEscopoStateModel>, context: DefinicaoEscopoState): void {
    if (this.id === 0) return;
    const operator = isFunction(this.grupoItem) ? this.grupoItem : patch(this.grupoItem);
    setState(
      patch({
        gruposItens: updateItem(item => item[this.property] === this.id, operator),
      })
    );
  }
}
