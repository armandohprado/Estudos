import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { Pavimento } from '../../shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../../shared/de-distribuir-quantitativo/model/centro-custo';
import { StateContext } from '@ngxs/store';
import { iif, patch, updateItem } from '@ngxs/store/operators';
import { updateCentroCusto } from '../../shared/de-distribuir-quantitativo/util';
import { GrupoItemDE } from '../../model/grupo-item';
import { Fase } from '../../shared/de-distribuir-quantitativo/model/fase';

export class UpdateGrupoItemQuantitativo implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] UpdateGrupoItemQuantitativo';
  constructor(
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public idProjetoCentroCusto: number,
    public centroCusto: Partial<CentroCusto>
  ) {}

  action({ setState }: StateContext<DefinicaoEscopoStateModel>): void {
    const { centroCusto, idFase, pavimento, idOrcamentoGrupoItem, idProjetoCentroCusto } = this;
    setState(
      patch({
        gruposItens: updateItem<GrupoItemDE>(
          item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
          patch({
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
