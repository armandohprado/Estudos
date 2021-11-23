import { GrupoItemDE } from '../../model/grupo-item';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { StateContext } from '@ngxs/store';

export class SetGruposItens implements NgxsAction<DefinicaoEscopoStateModel> {
  static readonly type = '[DefinicaoEscopo] SetGruposItens';
  constructor(public gruposItens: GrupoItemDE[]) {}

  action({ patchState }: StateContext<DefinicaoEscopoStateModel>): void {
    patchState({
      gruposItens: this.gruposItens,
    });
  }
}
