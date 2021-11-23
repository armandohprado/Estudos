import { StateContext, StateOperator } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { GrupoItemDELI, GrupoItemDELIID } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, updateItem } from '@ngxs/store/operators';
import { isFunction } from 'lodash-es';

export class UpdateGrupoItem
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo]  UpdateGrupoItem';

  constructor(
    public id: number,
    public partialOrOperator:
      | Partial<GrupoItemDELI>
      | StateOperator<GrupoItemDELI>,
    public propertyId: GrupoItemDELIID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { setState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    const operator = isFunction(this.partialOrOperator)
      ? this.partialOrOperator
      : patch(this.partialOrOperator);
    setState(
      patch({
        grupoItens: updateItem(
          item => item[this.propertyId] === this.id,
          operator
        ),
      })
    );
  }
}
