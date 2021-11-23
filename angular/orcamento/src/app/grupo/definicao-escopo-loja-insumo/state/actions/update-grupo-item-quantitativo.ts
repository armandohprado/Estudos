import { iif, patch, updateItem } from '@ngxs/store/operators';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { CentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { updateCentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/util';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { GrupoItemDELI } from '../../models/grupo-item';
import { Fase } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/fase';

export class UpdateGrupoItemQuantitativo
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] UpdateGrupoItemQuantitativo';
  constructor(
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public idProjetoCentroCusto: number,
    public centroCusto: Partial<CentroCusto>
  ) {}

  action({ setState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>): void {
    const { centroCusto, idFase, pavimento, idOrcamentoGrupoItem, idProjetoCentroCusto } = this;
    setState(
      patch({
        grupoItens: updateItem(
          item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
          patch<GrupoItemDELI>({
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
