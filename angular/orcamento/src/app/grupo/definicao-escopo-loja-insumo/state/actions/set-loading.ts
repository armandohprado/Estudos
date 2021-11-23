import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { StateContext } from '@ngxs/store';

export class SetLoading
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetLoading';
  constructor(public loading: boolean) {}

  action(
    { patchState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    patchState({ loading: this.loading });
  }
}
