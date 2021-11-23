import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { getPaiFilho } from './utils';
import { Observable } from 'rxjs';
import { SetGrupoItemFilhoQuantitativoApi } from './set-grupo-item-filho-quantitativo-api';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class SetGrupoItemFilhoAmbientesQuantitativoApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SetGrupoItemFilhoAmbientesQuantitativoApi';

  constructor(private idOrcamentoGrupoItemPai: number, private idOrcamentoGrupoItem: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<any> {
    dispatch(new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, { loading: true }));

    const [, grupoItem] = getPaiFilho(getState().grupoItens, this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem);

    const actions: NgxsAction[] = [];

    if (grupoItem.itemHabilitaAmbiente || !grupoItem.campoCalculado) {
      actions.push(new SetGrupoItemFilhoQuantitativoApi(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem));
    }

    return dispatch(actions).pipe(
      tap(() => {
        dispatch(
          new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
            opened: true,
            loading: false,
          })
        );
      })
    );
  }
}
