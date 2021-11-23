import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { Observable } from 'rxjs';
import { Quantitativo } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { iif, patch } from '@ngxs/store/operators';
import { GrupoItemDELI } from '../../models/grupo-item';
import { getQtdeTotal } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/util';

export class SetGrupoItemQuantitativoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState>
{
  static readonly type = '[DefinicaoEscopoLojaInsumo]  SetGrupoItemQuantitativoApi';

  constructor(public idOrcamentoGrupoItem: number, private setQuantidadeTotal = false) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<Quantitativo> {
    dispatch(new SetGrupoItemStatus(this.idOrcamentoGrupoItem, 'quantitativo', 'loading'));
    return definicaoEscopoLojaInsumoService.definicaoEscopoService
      .getQuantitativo(definicaoEscopoLojaInsumoService.grupo.idOrcamento, this.idOrcamentoGrupoItem)
      .pipe(
        tap(quantitativo => {
          dispatch([
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItem,
              patch<GrupoItemDELI>({
                quantitativo,
                statusProperty: patch({ quantitativo: null }),
                openedQuantitativo: true,
                quantidadeTotal: iif(this.setQuantidadeTotal, getQtdeTotal(quantitativo.fases)),
              })
            ),
          ]);
        })
      );
  }
}
