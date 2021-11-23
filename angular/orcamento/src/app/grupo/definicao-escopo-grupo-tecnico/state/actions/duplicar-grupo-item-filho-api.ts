import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { SetGrupoItemFilhosApi } from './set-grupo-item-filhos-api';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

export class DuplicarGrupoItemFilhoApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] DuplicarGrupoItemFilhoApi';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idGrupoItem: number
  ) {}

  action(
    { dispatch, setState, getState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
  ): Observable<void> {
    dispatch(
      new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
        loading: true,
      })
    );
    return definicaoEscopoGrupoTecnicoService.duplicarGrupoItemFilho(this.idOrcamentoGrupoItem).pipe(
      tap(() => {
        dispatch([
          new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
            loading: false,
          }),
          new SetGrupoItemFilhosApi(this.idOrcamentoGrupoItemPai, this.idGrupoItem),
        ]);
      }),
      catchAndThrow(() => {
        dispatch(
          new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
            loading: false,
          })
        );
      })
    );
  }
}
