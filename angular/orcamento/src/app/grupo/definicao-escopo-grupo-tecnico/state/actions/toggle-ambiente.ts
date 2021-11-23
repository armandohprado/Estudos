import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { GrupoItemTecnicoFilho, GrupoItemTecnicoFilhoPavimentoAmbiente } from '../../models/grupo-item';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { append, patch, removeItem } from '@ngxs/store/operators';
import { getPaiFilho } from './utils';
import { isNil } from 'lodash-es';

export class ToggleAmbiente
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] ToggleAmbiente';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private pavimentoAmbiente: GrupoItemTecnicoFilhoPavimentoAmbiente,
    private selecionado?: boolean
  ) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): void {
    const [, grupoItem] = getPaiFilho(getState().grupoItens, this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem);
    const predicate = (ambiente: GrupoItemTecnicoFilhoPavimentoAmbiente) =>
      ambiente.idProjetoAmbiente === this.pavimentoAmbiente.idProjetoAmbiente &&
      ambiente.idProjetoEdificioPavimento === this.pavimentoAmbiente.idProjetoEdificioPavimento;
    const exists = grupoItem.ambientesSelecionados.some(predicate) || (!isNil(this.selecionado) && !this.selecionado);
    dispatch(
      new UpdateGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.idOrcamentoGrupoItem,
        patch<GrupoItemTecnicoFilho>({
          ambientesSelecionados: exists ? removeItem(predicate) : append([this.pavimentoAmbiente]),
        })
      )
    );
  }
}
