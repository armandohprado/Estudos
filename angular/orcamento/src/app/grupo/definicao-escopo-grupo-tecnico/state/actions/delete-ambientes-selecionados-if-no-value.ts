import { StateContext } from '@ngxs/store';
import { getPaiFilho } from './utils';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { Fase } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/fase';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { patch } from '@ngxs/store/operators';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { arrayRemove } from '@datorama/akita';

export function hasAnyCentroCustoAtivo(fases: Fase[], pavimento: Pavimento): boolean {
  return fases.some(fase =>
    fase.edificios.some(edificio => {
      switch (pavimento.tipo) {
        case 'Prédio':
          return (
            edificio.idProjetoEdificioPavimento === pavimento.idProjetoEdificioPavimento &&
            edificio.centrosDeCusto.some(centro => centro.ativo)
          );
        case 'Site':
          return (
            edificio.site.idProjetoEdificioPavimento === pavimento.idProjetoEdificioPavimento &&
            edificio.site.centrosDeCusto.some(centro => centro.ativo)
          );
        case 'Andar':
          return edificio.andares.some(
            andar =>
              andar.idProjetoEdificioPavimento === pavimento.idProjetoEdificioPavimento &&
              andar.centrosDeCusto.some(centro => centro.ativo)
          );
      }
    })
  );
}

export class DeleteAmbientesSelecionadosIfNoValue
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnicoStateModel] DeleteAmbientesSelecionadosIfNoValue';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private pavimento: Pavimento
  ) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): void {
    const [, grupoItem] = getPaiFilho(getState().grupoItens, this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem);
    const hasAnyCentroAtivo = hasAnyCentroCustoAtivo(grupoItem.quantitativo.fases, this.pavimento);
    if (!hasAnyCentroAtivo) {
      dispatch(
        new UpdateGrupoItemFilho(
          this.idOrcamentoGrupoItemPai,
          this.idOrcamentoGrupoItem,
          patch<GrupoItemTecnicoFilho>({
            ambientesSelecionados: arrayRemove(
              grupoItem.ambientesSelecionados,
              this.pavimento.idProjetoEdificioPavimento,
              'idProjetoEdificioPavimento'
            ),
          })
        )
      );
    }
  }
}
