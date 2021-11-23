import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class UpdateGrupoItemTagApi
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo]  UpdateGrupoItemTagApi';

  constructor(public idOrcamentoGrupoItem: number, public tag: string) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<GenericResponse> {
    dispatch([
      new UpdateGrupoItem(this.idOrcamentoGrupoItem, { tag: this.tag }),
      new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'tag', 'loading'),
    ]);
    return definicaoEscopoLojaInsumoService.definicaoEscopoService
      .putValoresTag(this.idOrcamentoGrupoItem, { tag: this.tag })
      .pipe(
        finalize(() => {
          dispatch(
            new SetGrupoItemStatus(
              this.idOrcamentoGrupoItem,
              'tag',
              'completed'
            )
          );
        })
      );
  }
}
