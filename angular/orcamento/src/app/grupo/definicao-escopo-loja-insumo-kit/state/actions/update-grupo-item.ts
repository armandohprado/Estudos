import { StateContext, StateOperator } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { GrupoItemKit, GrupoItemKitID } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch, updateItem } from '@ngxs/store/operators';
import { isFunction } from 'lodash-es';

export class UpdateGrupoItem
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoKitStateModel,
      DefinicaoEscopoLojaInsumoKitState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  UpdateGrupoItem';

  constructor(
    public id: number,
    public partialOrOperator:
      | Partial<GrupoItemKit>
      | StateOperator<GrupoItemKit>,
    public propertyId: GrupoItemKitID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { setState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
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
