import { DuplicarGrupoItem } from '../../model/duplicar';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GrupoItemGenericReponse } from '../../model/grupo-item';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { RefreshNumeracaoApi } from './refresh-numeracao-api';

export class DuplicarGrupoItemApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] DuplicarGrupoItemApi';
  constructor(public payload: DuplicarGrupoItem) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GrupoItemGenericReponse> {
    const { payload } = this;
    const grupoItem = getState().gruposItens.find(g => g.idOrcamentoGrupoItem === payload.idOrcamentoGrupoItem);
    dispatch(
      new UpdateGrupoItem(payload.idOrcamentoGrupoItem, {
        duplicarLoading: true,
      })
    );
    return context.definicaoEscopoService.postDuplicacao(payload).pipe(
      finalize(() => {
        dispatch([
          new UpdateGrupoItem(payload.idOrcamentoGrupoItem, {
            duplicarLoading: false,
          }),
          new RefreshNumeracaoApi(grupoItem.idOrcamentoGrupo),
        ]);
      })
    );
  }
}
