import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { KeyofGrupoItemTecnicoFilho } from '../../models/grupo-item';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class SetGrupoItemFilhoStatus
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SetGrupoItemFilhoStatus';

  constructor(
    public idOrcamentoGrupoItem: number,
    public idOrcamentoGrupoItemFilho: number,
    public property: KeyofGrupoItemTecnicoFilho,
    public status: AwInputStatus
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
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
