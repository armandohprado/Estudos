import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { StateContext, StateOperator } from '@ngxs/store';
import { GrupoItemDELIFilho } from '../../models/grupo-item';
import { isFunction } from 'lodash-es';
import { patch, updateItem } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';

export class UpdateGrupoItemFilho
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] UpdateGrupoItemFilho';

  constructor(
    private idOrcamentoGrupoItem: number,
    private idOrcamentoGrupoItemFilho: number,
    private partialOrOperator: Partial<GrupoItemDELIFilho> | StateOperator<GrupoItemDELIFilho>
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    const operator = isFunction(this.partialOrOperator) ? this.partialOrOperator : patch(this.partialOrOperator);
    dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch({
          filhos: updateItem(filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItemFilho, operator),
        })
      )
    );
  }
}
