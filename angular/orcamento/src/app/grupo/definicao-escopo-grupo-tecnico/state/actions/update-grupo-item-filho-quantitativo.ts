import { iif, patch, updateItem } from '@ngxs/store/operators';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { CentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { updateCentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/util';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { Fase } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/fase';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class UpdateGrupoItemFilhoQuantitativo
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] UpdateGrupoItemFilhoQuantitativo';
  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public idProjetoCentroCusto: number,
    public centroCusto: Partial<CentroCusto>
  ) {}

  action({ setState, dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>): void {
    const {
      centroCusto,
      idFase,
      pavimento,
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemPai,
      idProjetoCentroCusto,
    } = this;
    dispatch(
      new UpdateGrupoItemFilho(
        idOrcamentoGrupoItemPai,
        idOrcamentoGrupoItem,
        patch<GrupoItemTecnicoFilho>({
          quantitativo: patch({
            fases: updateItem<Fase>(
              fase => fase.idFase === idFase,
              patch({
                edificios: updateItem<Pavimento>(
                  edificio => edificio.idEdificio === pavimento.idEdificio,
                  iif<Pavimento>(
                    pavimento.tipo === 'Prédio',
                    updateCentroCusto(pavimento, idProjetoCentroCusto, centroCusto),
                    patch({
                      site: iif(
                        pavimento.tipo === 'Site',
                        updateCentroCusto(pavimento, idProjetoCentroCusto, centroCusto)
                      ),
                      andares: iif(
                        pavimento.tipo === 'Andar',
                        updateItem(
                          andar => andar.idProjetoEdificioPavimento === pavimento.idProjetoEdificioPavimento,
                          updateCentroCusto(pavimento, idProjetoCentroCusto, centroCusto)
                        )
                      ),
                    })
                  )
                ),
              })
            ),
          }),
        })
      )
    );
  }
}
