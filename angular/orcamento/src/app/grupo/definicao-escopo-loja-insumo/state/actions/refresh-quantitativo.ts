import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemQuantitativoApi } from './set-grupo-item-quantitativo-api';

export class RefreshQuantitativo
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] RefreshQuantitativo';

  constructor(private idOrcamentoGrupoItemAtualizados: number[]) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    const gruposItens = getState().grupoItens;
    for (const idOrcamentoGrupoItem of this.idOrcamentoGrupoItemAtualizados) {
      if (gruposItens.some(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem)) {
        dispatch(new SetGrupoItemQuantitativoApi(idOrcamentoGrupoItem, true));
      }
    }
  }
}
