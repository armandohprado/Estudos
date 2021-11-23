import { GrupoItemValoresTag } from '../../model/atualiza-valores-tag';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../model/generic-response';
import { UpdateGrupoItem } from './update-grupo-item';

export class UpdateGrupoItemValoresTagApi
  implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] UpdateGrupoItemValoresTagApi';

  constructor(
    public idOrcamentoGrupoItem: number,
    public payload: GrupoItemValoresTag
  ) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GenericResponse> {
    const { idOrcamentoGrupoItem, payload } = this;
    const grupoItem = getState().gruposItens.find(
      item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem
    );
    const newPayload = { ...payload };
    if (newPayload.valorUnitarioServicoReferencia) {
      newPayload.valorUnitarioServicoReferencia =
        grupoItem.classificacao === 0
          ? 0
          : newPayload.valorUnitarioServicoReferencia;
    }
    if (newPayload.valorUnitarioProdutoReferencia) {
      newPayload.valorUnitarioProdutoReferencia =
        grupoItem.classificacao === 1
          ? 0
          : newPayload.valorUnitarioProdutoReferencia;
    }
    dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, payload));
    return context.definicaoEscopoService.putValoresTag(
      idOrcamentoGrupoItem,
      payload
    );
  }
}
