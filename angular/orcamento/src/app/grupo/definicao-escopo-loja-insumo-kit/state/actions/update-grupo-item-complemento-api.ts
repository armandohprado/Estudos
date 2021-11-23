import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable, throwError } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { catchError, tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { patch } from '@ngxs/store/operators';
import { GrupoItemKit, GrupoItemKitStatusProperty } from '../../models/grupo-item';

export class UpdateGrupoItemComplementoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  UpdateGrupoItemComplementoApi';

  constructor(public idOrcamentoGrupoItem: number, public complemento: string) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GenericResponse> {
    dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'complemento', 'loading'));
    return definicaoEscopoLojaInsumoKitService.definicaoEscopoService
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
              patch<GrupoItemKit>({
                statusProperty: patch<GrupoItemKitStatusProperty>({
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
