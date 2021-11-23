import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class UpdateGrupoItemTagApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico]  UpdateGrupoItemTagApi';

  constructor(public idOrcamentoGrupoItem: number, public tag: string) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
  ): Observable<GenericResponse> {
    dispatch([
      new UpdateGrupoItem(this.idOrcamentoGrupoItem, { tag: this.tag }),
      new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'tag', 'loading'),
    ]);
    return definicaoEscopoGrupoTecnicoService.definicaoEscopoService
      .putValoresTag(this.idOrcamentoGrupoItem, { tag: this.tag })
      .pipe(
        finalize(() => {
          dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'tag', 'completed'));
        })
      );
  }
}
