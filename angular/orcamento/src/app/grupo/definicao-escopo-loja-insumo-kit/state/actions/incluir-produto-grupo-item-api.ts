import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GrupoItemKit } from '../../models/grupo-item';
import { AddProdutoGrupoItem } from './add-produto-grupo-item';
import { UpdateCatalogoGrupoItem } from './update-catalogo-grupo-item';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { UpdateGrupoItem } from './update-grupo-item';
import { KitPayload } from '../../models/kit';

export class IncluirProdutoGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] IncluirProdutoGrupoItemApi';

  constructor(public idOrcamentoGrupoItem: number, public payload: KitPayload) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<KitPayload> {
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    const kitCatalogo = grupoItem.catalogo.find(k => k.idKit === this.payload.idKit);
    this.payload.selecionado = !grupoItem.produtos.some(kit => kit.idFornecedor === this.payload.idFornecedor);
    dispatch([
      new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'produtos', 'loading'),
      new UpdateCatalogoGrupoItem(this.idOrcamentoGrupoItem, this.payload.idKit, { loading: true }),
    ]);
    return definicaoEscopoLojaInsumoKitService.incluirKit(this.payload).pipe(
      tap(_kit => {
        const kit = { ...kitCatalogo, ..._kit };
        dispatch([
          new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
            openedCatalogo: true,
          }),
          new AddProdutoGrupoItem(this.idOrcamentoGrupoItem, kit),
          new UpdateCatalogoGrupoItem(this.idOrcamentoGrupoItem, this.payload.idKit, {
            selecionadoCatalogo: true,
            loading: false,
            idOrcamentoGrupoItemKit: kit.idOrcamentoGrupoItemKit,
          }),
          new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'produtos', 'completed'),
        ]);
      }),
      catchError(error => {
        dispatch(
          new UpdateGrupoItem(
            this.idOrcamentoGrupoItem,
            patch<GrupoItemKit>({
              statusProperty: patch({ produtos: 'error' }),
              errorApi: {
                args: [this.idOrcamentoGrupoItem, this.payload],
                callAgain: definicaoEscopoLojaInsumoKitService.incluirProdutoGrupoItemApi.bind(
                  definicaoEscopoLojaInsumoKitService
                ),
                error,
              },
            })
          )
        );
        return throwError(error);
      })
    );
  }
}
