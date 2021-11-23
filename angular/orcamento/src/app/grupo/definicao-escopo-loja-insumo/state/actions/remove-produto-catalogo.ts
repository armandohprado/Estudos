import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { patch, removeItem } from '@ngxs/store/operators';
import { ProdutoCatalogo } from '../../models/produto-catalogo';

export class RemoveProdutoCataloto
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] RemoveProdutoCataloto';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idProdutoCatalogo: number
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
          catalogo: removeItem<ProdutoCatalogo>(produto => produto.idProdutoCatalogo === this.idProdutoCatalogo),
        })
      )
    );
  }
}
