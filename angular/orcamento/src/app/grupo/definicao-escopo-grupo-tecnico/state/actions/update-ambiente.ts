import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { patch, updateItem } from '@ngxs/store/operators';
import { GrupoItemTecnicoFilho, GrupoItemTecnicoFilhoPavimentoAmbiente } from '../../models/grupo-item';

export class UpdateAmbiente
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] UpdateAmbiente';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idProjetoAmbiente: number,
    private idProjetoEdificioPavimento: number,
    private partial: Partial<GrupoItemTecnicoFilhoPavimentoAmbiente>
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): void {
    dispatch(
      new UpdateGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        patch<GrupoItemTecnicoFilho>({
          ambientesSelecionados: updateItem(
            ambiente =>
              ambiente.idProjetoAmbiente === this.idProjetoAmbiente &&
              ambiente.idProjetoEdificioPavimento === this.idProjetoEdificioPavimento,
            patch(this.partial)
          ),
        })
      )
    );
  }
}
