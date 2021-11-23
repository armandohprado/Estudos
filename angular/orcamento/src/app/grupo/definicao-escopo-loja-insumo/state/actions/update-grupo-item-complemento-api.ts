import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable, throwError } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { catchError, tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { patch } from '@ngxs/store/operators';
import {
  GrupoItemDELI,
  GrupoItemDELIStatusProperty,
} from '../../models/grupo-item';

export class UpdateGrupoItemComplementoApi
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type =
    '[DefinicaoEscopoLojaInsumo]  UpdateGrupoItemComplementoApi';

  constructor(
    public idOrcamentoGrupoItem: number,
    public complemento: string
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<GenericResponse> {
    dispatch(
      new SetGrupoItemStatus(
        this.idOrcamentoGrupoItem,
        'complemento',
        'loading'
      )
    );
    return definicaoEscopoLojaInsumoService.definicaoEscopoService
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
            new SetGrupoItemStatus(
              this.idOrcamentoGrupoItem,
              'complemento',
              'completed'
            ),
          ]);
        }),
        catchError(error => {
          dispatch(
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItem,
              patch<GrupoItemDELI>({
                statusProperty: patch<GrupoItemDELIStatusProperty>({
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
