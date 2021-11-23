import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoModeEnum, DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { StateContext } from '@ngxs/store';

export class ClearState implements NgxsAction<DefinicaoEscopoStateModel> {
  static readonly type = '[DefinicaoEscopo] SetGruposItensApi';
  action({ setState }: StateContext<DefinicaoEscopoStateModel>): void {
    setState({
      gruposItens: [],
      loading: false,
      errorApi: null,
      mode: DefinicaoEscopoModeEnum.lista,
    });
  }
}
