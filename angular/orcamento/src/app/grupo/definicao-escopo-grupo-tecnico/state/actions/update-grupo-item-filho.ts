import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { StateContext, StateOperator } from '@ngxs/store';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { isFunction } from 'lodash-es';
import { patch, updateItem } from '@ngxs/store/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';

export class UpdateGrupoItemFilho
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] UpdateGrupoItemFilho';

  constructor(
    private idOrcamentoGrupoItem: number,
    private idOrcamentoGrupoItemFilho: number,
    private partialOrOperator: Partial<GrupoItemTecnicoFilho> | StateOperator<GrupoItemTecnicoFilho>
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
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
