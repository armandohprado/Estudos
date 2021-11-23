import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { ProdutoCatalogo } from '../../models/produto-catalogo';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, updateItem } from '@ngxs/store/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class UpdateCatalogoGrupoItemFilho
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] UpdateCatalogoGrupoItemFilho';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public idProdutoCatalogo: number,
    public catalogo: Partial<ProdutoCatalogo>
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    dispatch(
      new UpdateGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        patch({
          catalogo: updateItem<ProdutoCatalogo>(
            item => item.idProdutoCatalogo === this.idProdutoCatalogo,
            patch(this.catalogo)
          ),
        })
      )
    );
  }
}
