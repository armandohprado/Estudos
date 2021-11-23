import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { FiltroProdutoCatalogo } from '../../models/produto-catalogo';
import { insertItem, patch, removeItem } from '@ngxs/store/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class UpdateFiltroCatalogoGrupoItemFilho
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type =
    '[DefinicaoEscopoLojaInsumo] UpdateFiltroCatalogoGrupoItemFilho';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public filtro: FiltroProdutoCatalogo
  ) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    const grupoItem = getState().grupoItens.find(
      gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItemPai
    );
    const grupoItemFilho = grupoItem.filhos.find(
      filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem
    );
    const filtroExiste = grupoItemFilho.filtros.some(
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
      new UpdateGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        patch({
          filtros: operator,
        })
      )
    );
  }
}
