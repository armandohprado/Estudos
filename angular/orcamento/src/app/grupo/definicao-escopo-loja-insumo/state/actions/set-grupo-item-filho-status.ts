import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { KeyofGrupoItemDELIFilho } from '../../models/grupo-item';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class SetGrupoItemFilhoStatus
  implements
    NgxsAction<
      DefinicaoEscopoLojaInsumoStateModel,
      DefinicaoEscopoLojaInsumoState
    > {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetGrupoItemFilhoStatus';

  constructor(
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemFilho: number,
    public property: KeyofGrupoItemDELIFilho,
    public status: AwInputStatus
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
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
