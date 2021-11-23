import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable } from 'rxjs';
import { Quantitativo } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { iif, patch } from '@ngxs/store/operators';
import { GrupoItemKit } from '../../models/grupo-item';
import { getQtdeTotal } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/util';

export class SetGrupoItemQuantitativoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState>
{
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  SetGrupoItemQuantitativoApi';

  constructor(public idOrcamentoGrupoItem: number, private setQuantidadeTotal = false) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<Quantitativo> {
    dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'quantitativo', 'loading'));
    return definicaoEscopoLojaInsumoKitService.definicaoEscopoService
      .getQuantitativo(definicaoEscopoLojaInsumoKitService.grupo.idOrcamento, this.idOrcamentoGrupoItem)
      .pipe(
        tap(quantitativo => {
          dispatch([
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItem,
              patch<GrupoItemKit>({
                quantitativo,
                statusProperty: patch({ quantitativo: null }),
                quantidadeTotal: iif(this.setQuantidadeTotal, getQtdeTotal(quantitativo.fases)),
              })
            ),
          ]);
        })
      );
  }
}
