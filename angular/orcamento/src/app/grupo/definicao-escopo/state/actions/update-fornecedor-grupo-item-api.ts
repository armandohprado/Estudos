import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { UpdateGrupoItem } from './update-grupo-item';
import { Observable } from 'rxjs';
import { OrcamentoGrupoItemFornecedor } from '../../model/grupo-item';
import { tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

export class UpdateFornecedorGrupoItemApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] UpdateFornecedorGrupoItemApi';

  constructor(private idOrcamentoGrupoItem: number, private idsFornecedores: number[]) {}

  action(
    { dispatch, patchState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<OrcamentoGrupoItemFornecedor[]> {
    dispatch(new UpdateGrupoItem(this.idOrcamentoGrupoItem, { loadingFornecedores: true }));
    return context.definicaoEscopoService.updateFornecedores(this.idOrcamentoGrupoItem, this.idsFornecedores).pipe(
      tap(fornecedores => {
        dispatch(
          new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
            fornecedores,
            idsFornecedores: fornecedores.map(f => f.idFornecedor),
            loadingFornecedores: false,
          })
        );
      }),
      catchAndThrow(() => {
        dispatch(new UpdateGrupoItem(this.idOrcamentoGrupoItem, { loadingFornecedores: false }));
      })
    );
  }
}
