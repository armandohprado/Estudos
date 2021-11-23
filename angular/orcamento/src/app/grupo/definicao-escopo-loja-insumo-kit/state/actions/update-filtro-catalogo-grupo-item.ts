import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { insertItem, patch, removeItem } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { FiltroProdutoCatalogo } from '../../../definicao-escopo-loja-insumo/models/produto-catalogo';

export class UpdateFiltroCatalogoGrupoItem
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoKitStateModel,
      DefinicaoEscopoLojaInsumoKitState
    > {
  static readonly type =
    '[DefinicaoEscopoLojaInsumoKit] UpdateFiltroCatalogoGrupoItem';

  constructor(
    public idOrcamentoGrupoItem: number,
    public filtro: FiltroProdutoCatalogo
  ) {}

  action(
    {
      dispatch,
      getState,
    }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    const grupoItem = getState().grupoItens.find(
      gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem
    );
    const filtroExiste = grupoItem.filtros.some(
      filtro =>
        filtro.nome === this.filtro.nome && filtro.valor === this.filtro.valor
    );
    const operator = filtroExiste
      ? removeItem<FiltroProdutoCatalogo>(
          filtro =>
            filtro.nome === this.filtro.nome &&
            filtro.valor === this.filtro.valor
        )
      : insertItem(this.filtro);
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({
          filtros: operator,
        })
      )
    );
  }
}
