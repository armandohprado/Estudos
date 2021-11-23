import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import {
  GrupoItemPesquisaReferencia,
  GrupoItemPesquisaReferenciaPayload,
} from '../../model/grupo-item-pesquisa-referencia';
import { StateContext } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { defaultAtributoAtivo } from '../../de-grupo-item/de-grupo-item-content/de-grupo-item-pesquisa/de-grupo-item-pesquisa.config';
import { Entity } from '@aw-utils/types/entity';

export class SetGrupoItemPesquisaReferenciaApi
  implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetGrupoItemPesquisaReferenciaApi';
  constructor(
    public idOrcamentoGrupoItem: number,
    public payload: GrupoItemPesquisaReferenciaPayload,
    public forceApi?: boolean,
    public attrAtivo?: Entity<boolean>
  ) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GrupoItemPesquisaReferencia> | void {
    const { idOrcamentoGrupoItem, payload, forceApi, attrAtivo } = this;
    const grupoItem = getState().gruposItens.find(
      item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem
    );
    if (grupoItem.pesquisaReferencia && !forceApi) {
      return;
    }
    dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { loading: true }));
    return context.definicaoEscopoService
      .getPesquisaReferencia(idOrcamentoGrupoItem, payload)
      .pipe(
        map(pesquisaRef => {
          if (grupoItem.pesquisaReferencia) {
            pesquisaRef.atributoAtivo =
              grupoItem.pesquisaReferencia.atributoAtivo;
          } else {
            pesquisaRef.atributoAtivo = defaultAtributoAtivo;
          }
          if (attrAtivo) {
            pesquisaRef.atributoAtivo = {
              ...pesquisaRef.atributoAtivo,
              ...attrAtivo,
            };
          }
          return pesquisaRef;
        }),
        tap(pesquisaReferencia => {
          dispatch(
            new UpdateGrupoItem(idOrcamentoGrupoItem, {
              loading: false,
              pesquisaReferencia,
              errorApi: null,
            })
          );
        }),
        catchError(error => {
          dispatch(
            new UpdateGrupoItem(idOrcamentoGrupoItem, {
              loading: false,
              errorApi: {
                error: 'Erro ao tentar carregar os itens da pesquisa',
                callAgain: context.definicaoEscopoService.setGrupoItemPesquisaReferenciaApi.bind(
                  this
                ),
                args: [idOrcamentoGrupoItem, payload],
              },
            })
          );
          return throwError(error);
        })
      );
  }
}
