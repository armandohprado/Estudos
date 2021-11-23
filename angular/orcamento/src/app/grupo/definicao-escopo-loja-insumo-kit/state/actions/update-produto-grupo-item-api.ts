import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { patch } from '@ngxs/store/operators';
import { GrupoItemKit, GrupoItemKitStatusProperty } from '../../models/grupo-item';
import { UpdateProdutoGrupoItem } from './update-produto-grupo-item';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { UpdateGrupoItem } from './update-grupo-item';
import { KitPayload } from '../../models/kit';

export class UpdateProdutoGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] UpdateProdutoGrupoItemApi';

  constructor(
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemKit: number,
    public payload: KitPayload
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GenericResponse> {
    dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'produtos', 'loading'));
    return definicaoEscopoLojaInsumoKitService.selecionarKit(this.idOrcamentoGrupoItem, this.payload).pipe(
      map(response => {
        if (!response || response.erro) {
          throw Error('Erro ao tentar atualizar o produto catalogo');
        }
        return response;
      }),
      tap(() => {
        dispatch([
          new UpdateProdutoGrupoItem(this.idOrcamentoGrupoItem, this.idOrcamentoGrupoItemKit, this.payload),
          new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'produtos', 'completed'),
        ]);
      }),
      catchError(error => {
        dispatch(
          new UpdateGrupoItem(
            this.idOrcamentoGrupoItem,
            patch<GrupoItemKit>({
              statusProperty: patch<GrupoItemKitStatusProperty>({
                produtos: 'error',
              }),
              errorApi: {
                error,
                callAgain: definicaoEscopoLojaInsumoKitService.updateProdutoGrupoItemApi.bind(
                  definicaoEscopoLojaInsumoKitService
                ),
                args: [this.idOrcamentoGrupoItem, this.idOrcamentoGrupoItemKit, this.payload],
              },
            })
          )
        );
        return throwError(error);
      })
    );
  }
}
