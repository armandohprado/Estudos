import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../model/generic-response';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class UpdateGrupoItemComplementoApi
  implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] UpdateGrupoItemComplementoApi';
  constructor(
    public idOrcamentoGrupoItem: number,
    public complemento: string
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GenericResponse> {
    const { idOrcamentoGrupoItem, complemento } = this;
    return context.definicaoEscopoService
      .putComplemento(idOrcamentoGrupoItem, complemento)
      .pipe(
        finalize(() => {
          dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { complemento }));
        })
      );
  }
}
