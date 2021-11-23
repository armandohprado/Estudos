import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { InclusaoGrupoItem } from '../../../definicao-escopo/model/inclusao-grupo-item';
import { SetGrupoItemLoading } from './set-grupo-item-loading';
import { Observable, throwError } from 'rxjs';
import { GrupoItem } from '../../../definicao-escopo/model/grupo-item';
import { catchError, map, tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetErrorApi } from './set-error-api';
import { ToggleCollapseGrupoItem } from './toggle-collapse-grupo-item';

export class IncluirGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  IncluirGrupoItemApi';

  constructor(public grupoItem: InclusaoGrupoItem) {}

  action(
    { setState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GrupoItem> {
    dispatch(new SetGrupoItemLoading(this.grupoItem.idGrupoItem, true, 'idGrupoItem'));
    return definicaoEscopoLojaInsumoKitService.definicaoEscopoLojaInsumoService.incluirGrupoItem(this.grupoItem).pipe(
      map(response => {
        if (!response || response.responseMessage.erro) {
          throw response?.responseMessage.erro ?? new Error('Erro ao inserir o grupo item');
        } else {
          return response.orcamentoGrupoItem;
        }
      }),
      tap(grupoItem => {
        dispatch([
          new UpdateGrupoItem(
            this.grupoItem.idGrupoItem,
            {
              ...grupoItem,
              ativo: true,
              loading: false,
              tag: grupoItem.tag ?? null,
              unidadeMedida: this.grupoItem.UM?.descricao ?? '',
              idGrupo: this.grupoItem.idGrupo,
              classificacao: this.grupoItem.classificacao,
              valorUnitarioProdutoReferencia: this.grupoItem.valorUnitarioProdutoReferencia ?? 0,
            },
            'idGrupoItem'
          ),
          new ToggleCollapseGrupoItem(grupoItem.idOrcamentoGrupoItem, this.grupoItem.idGrupoItem),
        ]);
      }),
      catchError(error => {
        dispatch([
          new SetErrorApi({
            error: 'Erro ao tentar inserir o grupo item',
            callAgain: definicaoEscopoLojaInsumoKitService.incluirGrupoItemApi.bind(
              definicaoEscopoLojaInsumoKitService
            ),
            args: [this.grupoItem],
          }),
          new SetGrupoItemLoading(this.grupoItem.idGrupoItem, false, 'idGrupoItem'),
        ]);
        return throwError(error);
      })
    );
  }
}
