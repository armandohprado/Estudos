import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { tap } from 'rxjs/operators';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { StateContext } from '@ngxs/store';
import { sumBy } from 'lodash-es';
import { Observable } from 'rxjs';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { UpdateGrupoItem } from './update-grupo-item';

export class CalcularValorReferenciaGrupoItem
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] CalcularValorReferenciaGrupoItem';

  constructor(private idOrcamentoGrupoItem: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GenericResponse> {
    const grupoItem = getState().grupoItens.find(g => g.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    const valor = sumBy(
      grupoItem.produtos.filter(k => k.selecionado),
      'precoRegiao'
    );
    return context.definicaoEscopoLojaInsumoKitService.definicaoEscopoService
      .putValoresTag(this.idOrcamentoGrupoItem, {
        valorUnitarioProdutoReferencia: valor,
      })
      .pipe(
        tap(() => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              valorUnitarioProdutoReferencia: valor,
            })
          );
        })
      );
  }
}
