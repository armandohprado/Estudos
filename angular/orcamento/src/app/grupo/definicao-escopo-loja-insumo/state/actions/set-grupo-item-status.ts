import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { GrupoItemDELIID, KeyofGrupoItemDELI } from '../../models/grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemStatus
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetGrupoItemStatus';

  constructor(
    public id: number,
    public property: KeyofGrupoItemDELI,
    public status: AwInputStatus,
    public propertyId: GrupoItemDELIID = 'idOrcamentoGrupoItem'
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): void {
    dispatch(
      new UpdateGrupoItem(
        this.id,
        patch({ statusProperty: patch({ [this.property]: this.status }) }),
        this.propertyId
      )
    );
    if (this.status === 'completed') {
      setTimeout(
        () =>
          dispatch(
            new SetGrupoItemStatus(
              this.id,
              this.property,
              null,
              this.propertyId
            )
          ),
        2000
      );
    }
  }
}
