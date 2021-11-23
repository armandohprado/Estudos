import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { StateContext, StateOperator } from '@ngxs/store';
import { GrupoItemKitFilho } from '../../models/grupo-item';
import { isFunction } from 'lodash-es';
import { patch, updateItem } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';

export class UpdateGrupoItemFilho
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] UpdateGrupoItemFilho';

  constructor(
    private idOrcamentoGrupoItem: number,
    private idOrcamentoGrupoItemFilho: number,
    private partialOrOperator: Partial<GrupoItemKitFilho> | StateOperator<GrupoItemKitFilho>
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
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
