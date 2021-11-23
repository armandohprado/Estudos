import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { KeyofGrupoItemKitFilho } from '../../models/grupo-item';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class SetGrupoItemFilhoStatus
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] SetGrupoItemFilhoStatus';

  constructor(
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemFilho: number,
    public property: KeyofGrupoItemKitFilho,
    public status: AwInputStatus
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): void {
    dispatch(
      new UpdateGrupoItemFilho(
        this.idOrcamentoGrupoItem,
        this.idOrcamentoGrupoItemFilho,
        patch({ statusProperty: patch({ [this.property]: this.status }) })
      )
    );
  }
}
