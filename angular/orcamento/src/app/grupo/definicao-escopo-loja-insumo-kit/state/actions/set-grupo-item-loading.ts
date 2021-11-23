import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { GrupoItemKitID } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemLoading
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoKitStateModel,
      DefinicaoEscopoLojaInsumoKitState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  SetGrupoItemLoading';

  constructor(
    public id: number,
    public loading: boolean,
    public propertyId: GrupoItemKitID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItem(this.id, { loading: this.loading }, this.propertyId)
    );
  }
}
