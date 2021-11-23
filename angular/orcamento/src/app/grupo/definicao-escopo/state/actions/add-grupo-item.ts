import { GrupoItemDE } from '../../model/grupo-item';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { insertItem, patch } from '@ngxs/store/operators';
import { StateContext } from '@ngxs/store';

export class AddGrupoItem implements NgxsAction<DefinicaoEscopoStateModel> {
  static readonly type = '[DefinicaoEscopo] AddGrupoItem';
  constructor(public grupoItem: GrupoItemDE) {}
  action({ setState }: StateContext<DefinicaoEscopoStateModel>): void {
    setState(
      patch({
        gruposItens: insertItem(this.grupoItem),
      })
    );
  }
}
