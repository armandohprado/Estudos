import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { patch } from '@ngxs/store/operators';
import { finalize, tap } from 'rxjs/operators';
import { SetLoading } from './set-loading';
import { Observable } from 'rxjs';
import { GrupoItem } from '../../model/grupo-item';

export class RefreshNumeracaoApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] RefreshNumeracaoApi';

  constructor(private idOrcamentoGrupo: number) {}

  action(
    { dispatch, setState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GrupoItem[]> {
    dispatch(new SetLoading(true));
    return context.definicaoEscopoService.getGrupoItens(this.idOrcamentoGrupo).pipe(
      tap(gruposItensApi => {
        setState(
          patch<DefinicaoEscopoStateModel>({
            gruposItens: gruposItens => {
              const ids = gruposItens.filter(gi => gi.idOrcamentoGrupoItem);
              const idsGrupoItem = gruposItens.filter(gi => !gi.idOrcamentoGrupoItem);
              return gruposItensApi.map(grupoItemApi => {
                const grupoItem =
                  ids.find(gi => gi.idOrcamentoGrupoItem === grupoItemApi.idOrcamentoGrupoItem) ??
                  idsGrupoItem.find(gi => gi.idGrupoItem === grupoItemApi.idGrupoItem);
                return {
                  ...grupoItemApi,
                  ...grupoItem,
                  numeracao: grupoItemApi.numeracao ?? grupoItem?.numeracao,
                  numeracaoGrupoItem: grupoItemApi.numeracaoGrupoItem ?? grupoItem?.numeracaoGrupoItem,
                };
              });
            },
          })
        );
      }),
      finalize(() => {
        dispatch(new SetLoading(false));
      })
    );
  }
}
