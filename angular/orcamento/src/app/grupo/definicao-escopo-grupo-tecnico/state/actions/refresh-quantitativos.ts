import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemFilhoQuantitativoApi } from './set-grupo-item-filho-quantitativo-api';
import { Observable, of } from 'rxjs';

export class RefreshQuantitativos
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] RefreshQuantitativos';

  constructor(private idOrcamentoGrupoItem: number, private idOrcamentoGrupoItemNotToRefresh: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<void> {
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    const refreshs = grupoItem.filhos
      .filter(filho => filho.opened && filho.idOrcamentoGrupoItem !== this.idOrcamentoGrupoItemNotToRefresh)
      .map(filho => new SetGrupoItemFilhoQuantitativoApi(grupoItem.idOrcamentoGrupoItem, filho.idOrcamentoGrupoItem));
    if (refreshs.length) {
      return dispatch(refreshs);
    } else {
      return of(null);
    }
  }
}
