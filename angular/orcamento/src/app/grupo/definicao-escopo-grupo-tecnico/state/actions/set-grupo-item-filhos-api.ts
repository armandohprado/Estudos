import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { Observable } from 'rxjs';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItemLoading } from './set-grupo-item-loading';

export class SetGrupoItemFilhosApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SetGrupoItemFilhosApi';

  constructor(private idOrcamentoGrupoItem: number, private idGrupoItem: number) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<GrupoItemTecnicoFilho[]> {
    dispatch(new SetGrupoItemLoading(this.idOrcamentoGrupoItem, true));
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    return context.definicaoEscopoGrupoTecnicoService
      .getGrupoItemFilhos(this.idOrcamentoGrupoItem, this.idGrupoItem, grupoItem.filhos)
      .pipe(
        tap(filhos => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              filhos,
              loading: false,
              opened: true,
            })
          );
        })
      );
  }
}
