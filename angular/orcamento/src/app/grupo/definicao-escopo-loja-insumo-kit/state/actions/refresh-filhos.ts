import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { tap } from 'rxjs/operators';
import { StateContext } from '@ngxs/store';
import { upsert } from '@aw-utils/util';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { GrupoItemKitFilho } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { Observable } from 'rxjs';
import { UpdateGrupoItem } from './update-grupo-item';

export class RefreshFilhos
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] RefreshFilhos';

  constructor(private idOrcamentoGrupoItem: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GrupoItemKitFilho[]> {
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    return context.definicaoEscopoLojaInsumoKitService
      .getGrupoItemFilhos(grupoItem.idOrcamentoGrupoItem, grupoItem.idGrupoItem)
      .pipe(
        tap(filhos => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, gi => {
              return {
                ...gi,
                filhos: upsert(gi.filhos, filhos, 'idOrcamentoGrupoItem'),
              };
            })
          );
        })
      );
  }
}
