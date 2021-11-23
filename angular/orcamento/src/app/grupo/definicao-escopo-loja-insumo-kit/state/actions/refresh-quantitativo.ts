import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { SetGrupoItemQuantitativoApi } from './set-grupo-item-quantitativo-api';

export class RefreshQuantitativo
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] RefreshQuantitativo';

  constructor(private idOrcamentoGrupoItemAtualizados: number[]) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    const gruposItens = getState().grupoItens;
    for (const idOrcamentoGrupoItem of this.idOrcamentoGrupoItemAtualizados) {
      if (gruposItens.some(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem)) {
        dispatch(new SetGrupoItemQuantitativoApi(idOrcamentoGrupoItem, true));
      }
    }
  }
}
