import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';

export class UpdateGrupoItemTagApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  UpdateGrupoItemTagApi';

  constructor(public idOrcamentoGrupoItem: number, public tag: string) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GenericResponse> {
    dispatch([
      new UpdateGrupoItem(this.idOrcamentoGrupoItem, { tag: this.tag }),
      new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'tag', 'loading'),
    ]);
    return definicaoEscopoLojaInsumoKitService.definicaoEscopoService
      .putValoresTag(this.idOrcamentoGrupoItem, { tag: this.tag })
      .pipe(
        finalize(() => {
          dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'tag', 'completed'));
        })
      );
  }
}
