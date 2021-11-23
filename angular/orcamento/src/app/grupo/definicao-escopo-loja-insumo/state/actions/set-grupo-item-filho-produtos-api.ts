import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProdutoCatalogo } from '../../models/produto-catalogo';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class SetGrupoItemFilhoProdutosApi
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type =
    '[DefinicaoEscopoLojaInsumo] SetGrupoItemFilhoProdutosApi';

  constructor(
    private idOrcamentoGrupoItem: number,
    public idGrupoItemFilho: number,
    public idOrcamentoGrupoItemFilho: number
  ) {}

  action(
    { setState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<[ProdutoCatalogo[], ProdutoCatalogo[]]> {
    dispatch(
      new UpdateGrupoItemFilho(
        this.idOrcamentoGrupoItem,
        this.idOrcamentoGrupoItemFilho,
        { loading: true }
      )
    );
    return definicaoEscopoLojaInsumoService
      .getAllProdutos(this.idGrupoItemFilho, this.idOrcamentoGrupoItemFilho)
      .pipe(
        tap(([catalogo, produtos]) => {
          dispatch(
            new UpdateGrupoItemFilho(
              this.idOrcamentoGrupoItem,
              this.idOrcamentoGrupoItemFilho,
              {
                produtos,
                catalogo,
                opened: true,
                loading: false,
              }
            )
          );
        })
      );
  }
}
