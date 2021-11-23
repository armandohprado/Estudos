import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { GrupoItemDELIID } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemLoading
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo]  SetGrupoItemLoading';

  constructor(
    public id: number,
    public loading: boolean,
    public propertyId: GrupoItemDELIID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): void {
    dispatch(
      new UpdateGrupoItem(this.id, { loading: this.loading }, this.propertyId)
    );
  }
}
