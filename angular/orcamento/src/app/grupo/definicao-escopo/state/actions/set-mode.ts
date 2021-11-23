import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoModeEnum, DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';

export class SetMode implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetMode';
  constructor(public mode: DefinicaoEscopoModeEnum) {}

  action({ patchState }: StateContext<DefinicaoEscopoStateModel>): void {
    patchState({ mode: this.mode });
  }
}
