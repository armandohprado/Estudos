import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { GrupoItemDE, GrupoItemGenericReponse } from '../../model/grupo-item';
import { InclusaoGrupoItem } from '../../model/inclusao-grupo-item';
import { catchError, tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { AddGrupoItem } from './add-grupo-item';
import { SetLoading } from './set-loading';
import { SetErrorApi } from './set-error-api';
import { GenericResponse } from '../../model/generic-response';
import { SetGrupoItemAtributosApi } from './set-grupo-item-atributos-api';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

export class IncluirGrupoItemApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] IncluirGrupoItemApi';
  constructor(public payload: InclusaoGrupoItem, public idGrupoItem?: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GrupoItemGenericReponse> {
    const { payload, idGrupoItem } = this;
    const grupoItem = idGrupoItem ? getState().gruposItens.find(item => item.idGrupoItem === idGrupoItem) : null;
    if (grupoItem) {
      dispatch(new UpdateGrupoItem(idGrupoItem, { loading: true }, 'idGrupoItem'));
    } else {
      dispatch(new SetLoading(true));
    }
    return context.definicaoEscopoService.incluirGrupoItem(payload).pipe(
      tap(response => {
        if (!response || response.responseMessage.erro || response.responseMessage.codigo === 0) {
          return throwError(() => response.responseMessage);
        }
        const { orcamentoGrupoItem } = response;
        const { tag, classificacao, ordenacao, quantidadeTotal } = orcamentoGrupoItem;
        const newGrupoItem: GrupoItemDE = {
          ...orcamentoGrupoItem,
          ativo: true,
          idsFornecedores: (orcamentoGrupoItem.fornecedores ?? []).map(fornecedor => fornecedor.idFornecedor),
          quantidadeTotal: quantidadeTotal ?? payload.quantidadeTotal,
          atributos: [],
          tag: tag || null,
          idGrupo: payload.idGrupo,
          classificacao: classificacao ?? payload.classificacao ?? 2,
          ordenacao: ordenacao ?? null,
        };
        if (!newGrupoItem.unidadeMedida && payload.UM) {
          newGrupoItem.unidadeMedida = payload.UM.descricao;
        }
        if (grupoItem) {
          dispatch([
            new UpdateGrupoItem(idGrupoItem, { ...newGrupoItem, loading: false }, 'idGrupoItem'),
            new SetErrorApi(null),
            new SetGrupoItemAtributosApi(newGrupoItem.idOrcamentoGrupoItem, true),
          ]);
        } else {
          dispatch([new AddGrupoItem(newGrupoItem), new SetErrorApi(null), new SetLoading(false)]);
        }
      }),
      catchAndThrow((error: GenericResponse) => {
        const actions: NgxsAction[] = [
          new SetErrorApi({
            error: 'Erro ao tentar incluir o Grupo item',
            callAgain: context.definicaoEscopoService.incluirGrupoItemApi.bind(this),
            args: [payload, idGrupoItem],
            moreInfo: {
              info: error.erro,
              title: error.mensagem,
              code: 500,
            },
          }),
        ];
        if (grupoItem) {
          actions.push(new UpdateGrupoItem(idGrupoItem, { loading: false }, 'idGrupoItem'));
        } else {
          actions.push(new SetLoading(false));
        }
        dispatch(actions);
      })
    );
  }
}
