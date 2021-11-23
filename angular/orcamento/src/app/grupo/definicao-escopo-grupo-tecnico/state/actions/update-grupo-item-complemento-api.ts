import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable, throwError } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { catchError, tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { patch } from '@ngxs/store/operators';
import { GrupoItemTecnico, GrupoItemTecnicoStatusProperty } from '../../models/grupo-item';

export class UpdateGrupoItemComplementoApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico]  UpdateGrupoItemComplementoApi';

  constructor(public idOrcamentoGrupoItem: number, public complemento: string) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
  ): Observable<GenericResponse> {
    dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'complemento', 'loading'));
    return definicaoEscopoGrupoTecnicoService.definicaoEscopoService
      .putComplemento(this.idOrcamentoGrupoItem, this.complemento)
      .pipe(
        tap(() => {
          dispatch([
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItem,
              patch({
                complemento: this.complemento,
              })
            ),
            new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'complemento', 'completed'),
          ]);
        }),
        catchError(error => {
          dispatch(
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItem,
              patch<GrupoItemTecnico>({
                statusProperty: patch<GrupoItemTecnicoStatusProperty>({
                  complemento: 'error',
                }),
              })
            )
          );
          return throwError(error);
        })
      );
  }
}
