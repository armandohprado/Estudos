import { iif, patch, updateItem } from '@ngxs/store/operators';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { StateContext } from '@ngxs/store';
import { CentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { updateCentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/util';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { Fase } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/fase';
import { GrupoItemKit } from '../../models/grupo-item';

export class UpdateGrupoItemQuantitativo
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] UpdateGrupoItemQuantitativo';
  constructor(
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public idProjetoCentroCusto: number,
    public centroCusto: Partial<CentroCusto>
  ) {}

  action({ setState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>): void {
    const { centroCusto, idFase, pavimento, idOrcamentoGrupoItem, idProjetoCentroCusto } = this;
    setState(
      patch({
        grupoItens: updateItem(
          item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
          patch<GrupoItemKit>({
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
        ),
      })
    );
  }
}
