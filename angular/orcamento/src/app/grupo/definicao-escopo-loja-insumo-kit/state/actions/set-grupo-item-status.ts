import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { GrupoItemKitID, KeyofGrupoItemKit } from '../../models/grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemStatus
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] SetGrupoItemStatus';

  constructor(
    public id: number,
    public property: KeyofGrupoItemKit,
    public status: AwInputStatus,
    public propertyId: GrupoItemKitID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItem(this.id, patch({ statusProperty: patch({ [this.property]: this.status }) }), this.propertyId)
    );
    if (this.status === 'completed') {
      setTimeout(() => dispatch(new SetGrupoItemStatus(this.id, this.property, null, this.propertyId)), 2000);
    }
  }
}
