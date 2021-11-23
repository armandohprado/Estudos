import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { ProdutoCatalogoPayload } from '../../models/produto-catalogo';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { patch } from '@ngxs/store/operators';
import {
  GrupoItemDELI,
  GrupoItemDELIFilhoStatusProperty,
} from '../../models/grupo-item';
import { UpdateProdutoGrupoItemFilho } from './update-produto-grupo-item-filho';
import { SetGrupoItemFilhoStatus } from './set-grupo-item-filho-status';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class UpdateProdutoGrupoItemFilhoApi
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type =
    '[DefinicaoEscopoLojaInsumo] UpdateProdutoGrupoItemApi';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemProdutoCatalogo: number,
    public payload: ProdutoCatalogoPayload
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<GenericResponse> {
    dispatch(
      new SetGrupoItemFilhoStatus(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        'produtos',
        'loading'
      )
    );
    return definicaoEscopoLojaInsumoService
      .putProduto(this.idOrcamentoGrupoItem, this.payload)
      .pipe(
        map(response => {
          if (!response || response.erro) {
            throw Error('Erro ao tentar atualizar o produto catalogo');
          }
          return response;
        }),
        tap(() => {
          dispatch([
            new UpdateProdutoGrupoItemFilho(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              this.idOrcamentoGrupoItemProdutoCatalogo,
              this.payload
            ),
            new SetGrupoItemFilhoStatus(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              'produtos',
              'completed'
            ),
          ]);
        }),
        catchError(error => {
          dispatch(
            new UpdateGrupoItemFilho(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              patch<GrupoItemDELI>({
                statusProperty: patch<GrupoItemDELIFilhoStatusProperty>({
                  produtos: 'error',
                }),
                errorApi: {
                  error,
                  callAgain: definicaoEscopoLojaInsumoService.updateProdutoGrupoItemFilhoApi.bind(
                    definicaoEscopoLojaInsumoService
                  ),
                  args: [
                    this.idOrcamentoGrupoItemPai,
                    this.idOrcamentoGrupoItem,
                    this.idOrcamentoGrupoItemProdutoCatalogo,
                    this.payload,
                  ],
                },
              })
            )
          );
          return throwError(error);
        })
      );
  }
}
