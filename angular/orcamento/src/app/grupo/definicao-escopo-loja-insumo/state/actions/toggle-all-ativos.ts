import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { GrupoItemDELI, GrupoItemDELIFilho } from '../../models/grupo-item';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface GrupoItemFilhoPayload {
  grupoItem: GrupoItemDELI;
  filhos: GrupoItemDELIFilho[];
}

export class ToggleAllAtivos
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] ToggleAllAtivos';

  constructor(private open = true) {}

  action(
    { getState, setState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<any> | void {
    const grupoItensAtivos = getState().grupoItens.filter(grupoItem => grupoItem.ativo);
    if (!grupoItensAtivos.length) {
      return;
    }
    if (this.open) {
      const grupoItensAtivosClosed = grupoItensAtivos.filter(grupoItem => !grupoItem.opened);
      if (!grupoItensAtivosClosed.length) {
        return;
      }
      setState(state => ({
        ...state,
        grupoItens: state.grupoItens.map(grupoItem => {
          if (grupoItensAtivosClosed.some(gi => gi.idOrcamentoGrupoItem === grupoItem.idOrcamentoGrupoItem)) {
            grupoItem = { ...grupoItem, loading: true };
          }
          return grupoItem;
        }),
        openingAll: true,
      }));
      const requests$: Observable<GrupoItemFilhoPayload>[] = grupoItensAtivosClosed.map(grupoItem =>
        definicaoEscopoLojaInsumoService
          .getGrupoItemFilhos(grupoItem.idOrcamentoGrupoItem, grupoItem.idGrupoItem)
          .pipe(map(filhos => ({ grupoItem, filhos })))
      );
      return forkJoin(requests$).pipe(
        map(paylods => {
          return new Map<number, GrupoItemFilhoPayload>(
            paylods.map(payload => [payload.grupoItem.idOrcamentoGrupoItem, payload])
          );
        }),
        tap(payloadMap => {
          setState(state => ({
            ...state,
            grupoItens: state.grupoItens.map(grupoItem => {
              if (payloadMap.has(grupoItem.idOrcamentoGrupoItem)) {
                const { filhos } = payloadMap.get(grupoItem.idOrcamentoGrupoItem);
                grupoItem = { ...grupoItem, filhos, loading: false, opened: true };
              }
              return grupoItem;
            }),
            openingAll: false,
          }));
        })
      );
    } else {
      const grupoItensAtivosOpened = grupoItensAtivos.filter(grupoItem => grupoItem.opened);
      if (!grupoItensAtivosOpened.length) {
        return;
      }
      setState(state => ({
        ...state,
        grupoItens: state.grupoItens.map(grupoItem => {
          if (grupoItensAtivosOpened.some(gi => gi.idOrcamentoGrupoItem === grupoItem.idOrcamentoGrupoItem)) {
            grupoItem = { ...grupoItem, opened: false };
          }
          return grupoItem;
        }),
      }));
    }
  }
}
