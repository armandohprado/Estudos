import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoState } from '../definicao-escopo.state';

export class SetLoading
  implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetLoading';
  constructor(public loading: boolean) {}
  action(
    { patchState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): any {
    patchState({ loading: this.loading });
  }
}
