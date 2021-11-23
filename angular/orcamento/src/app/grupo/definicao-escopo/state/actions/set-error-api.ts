import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { StateContext } from '@ngxs/store';
import { ErrorApi } from '../../model/error-api';

export class SetErrorApi implements NgxsAction<DefinicaoEscopoStateModel> {
  static readonly type = '[DefinicaoEscopo] SetErrorApi';
  constructor(public error: ErrorApi) {}
  action({ patchState }: StateContext<DefinicaoEscopoStateModel>): void {
    patchState({ errorApi: this.error });
  }
}
