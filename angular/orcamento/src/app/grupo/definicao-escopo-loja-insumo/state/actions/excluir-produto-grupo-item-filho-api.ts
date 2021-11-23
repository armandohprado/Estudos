import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, removeItem } from '@ngxs/store/operators';
import { GrupoItemDELIFilho } from '../../models/grupo-item';
import { UpdateCatalogoGrupoItemFilho } from './update-catalogo-grupo-item-filho';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { tap } from 'rxjs/operators';
import { SetGrupoItemFilhoStatus } from './set-grupo-item-filho-status';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { RecalcularValoresProduto } from './recalcular-valores-produto';

export class ExcluirProdutoGrupoItemFilhoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo]  ExcluirProdutoGrupoItemFilhoApi';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public idProdutoCatalogo: number
  ) {}

  action(
    { dispatch, setState, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<GenericResponse> {
    const produtoSelecionado = getState()
      .grupoItens.find(item => item.idOrcamentoGrupoItem === this.idOrcamentoGrupoItemPai)
      .filhos.find(filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem)
      .produtos?.find?.(prod => prod.idProdutoCatalogo === this.idProdutoCatalogo);
    if (!produtoSelecionado) return;
    dispatch([
      new SetGrupoItemFilhoStatus(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, 'produtos', 'loading'),
      new UpdateCatalogoGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        this.idProdutoCatalogo,
        { loading: true }
      ),
    ]);
    return definicaoEscopoLojaInsumoService.definicaoEscopoLojaService
      .deleteProduto(produtoSelecionado.idOrcamentoGrupoItemProdutoCatalogo)
      .pipe(
        tap(() => {
          dispatch([
            new UpdateGrupoItemFilho(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              patch<GrupoItemDELIFilho>({
                produtos: removeItem(
                  prod =>
                    prod.idOrcamentoGrupoItemProdutoCatalogo === produtoSelecionado.idOrcamentoGrupoItemProdutoCatalogo
                ),
              })
            ),
            new SetGrupoItemFilhoStatus(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, 'produtos', null),
            new UpdateCatalogoGrupoItemFilho(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              this.idProdutoCatalogo,
              {
                loading: false,
                selecionadoCatalogo: false,
                idOrcamentoGrupoItemProdutoCatalogo: 0,
                idOrcamentoGrupoItem: 0,
              }
            ),
          ]);
          dispatch(new RecalcularValoresProduto(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem));
        })
      );
  }
}
