import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { ProdutoCatalogo, ProdutoCatalogoPayload } from '../../models/produto-catalogo';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { GrupoItemDELIFilho } from '../../models/grupo-item';
import { AddProdutoGrupoItemFilho } from './add-produto-grupo-item-filho';
import { UpdateCatalogoGrupoItemFilho } from './update-catalogo-grupo-item-filho';
import { SetGrupoItemFilhoStatus } from './set-grupo-item-filho-status';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { getPaiFilho } from './utils';

export class IncluirProdutoGrupoItemFilhoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] IncluirProdutoGrupoItemFilhoApi';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public payload: ProdutoCatalogoPayload
  ) {}

  action(
    { setState, dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<ProdutoCatalogo> {
    const [, grupoItem] = getPaiFilho(getState().grupoItens, this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem);
    this.payload.selecionado = !grupoItem.produtos.some(produto => produto.idFornecedor === this.payload.idFornecedor);
    dispatch([
      new SetGrupoItemFilhoStatus(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, 'produtos', 'loading'),
      new UpdateCatalogoGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        this.payload.idProdutoCatalogo,
        { loading: true }
      ),
    ]);
    return definicaoEscopoLojaInsumoService.postProduto(this.idOrcamentoGrupoItem, this.payload).pipe(
      map(response => {
        if (!response || response.responseMessage.erro) {
          throw Error('Erro ao tentar inserir o produto catalogo');
        }
        return response.produtoCatalogo;
      }),
      tap(produtoCatalogo => {
        dispatch([
          new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
            openedCatalogo: true,
          }),
          new AddProdutoGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, produtoCatalogo),
          new UpdateCatalogoGrupoItemFilho(
            this.idOrcamentoGrupoItemPai,
            this.idOrcamentoGrupoItem,
            this.payload.idProdutoCatalogo,
            {
              selecionadoCatalogo: true,
              loading: false,
              idOrcamentoGrupoItem: produtoCatalogo.idOrcamentoGrupoItem,
              idOrcamentoGrupoItemProdutoCatalogo: produtoCatalogo.idOrcamentoGrupoItemProdutoCatalogo,
            }
          ),
          new SetGrupoItemFilhoStatus(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, 'produtos', 'completed'),
        ]);
      }),
      catchError(error => {
        dispatch(
          new UpdateGrupoItemFilho(
            this.idOrcamentoGrupoItemPai,
            this.idOrcamentoGrupoItem,
            patch<GrupoItemDELIFilho>({
              statusProperty: patch({ produtos: 'error' }),
              errorApi: {
                args: [this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, this.payload],
                callAgain: definicaoEscopoLojaInsumoService.incluirProdutoGrupoItemFilhoApi.bind(
                  definicaoEscopoLojaInsumoService
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
