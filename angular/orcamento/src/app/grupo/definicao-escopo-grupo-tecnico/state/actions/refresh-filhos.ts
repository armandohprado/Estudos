import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { upsert } from '@aw-utils/util';

export class RefreshFilhos
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] RefreshFilhos';

  constructor(private idOrcamentoGrupoItem: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<GrupoItemTecnicoFilho[]> {
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    return context.definicaoEscopoGrupoTecnicoService
      .getGrupoItemFilhos(grupoItem.idOrcamentoGrupoItem, grupoItem.idGrupoItem)
      .pipe(
        tap(filhos => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, gi => {
              return {
                ...gi,
                filhos: upsert(gi.filhos, filhos, 'idOrcamentoGrupoItem', (filho1, filho2) => {
                  return {
                    ...filho1,
                    ...filho2,
                  };
                }),
              };
            })
          );
        })
      );
  }
}
