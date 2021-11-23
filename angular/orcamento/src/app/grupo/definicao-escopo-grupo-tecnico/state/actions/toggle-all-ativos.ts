import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { GrupoItemTecnico, GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface GrupoItemFilhoPayload {
  grupoItem: GrupoItemTecnico;
  filhos: GrupoItemTecnicoFilho[];
}

export class ToggleAllAtivos
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] ToggleAllAtivos';

  constructor(private open = true) {}

  action(
    { getState, setState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
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
      const request$: Observable<GrupoItemFilhoPayload>[] = grupoItensAtivosClosed.map(grupoItem =>
        definicaoEscopoGrupoTecnicoService
          .getGrupoItemFilhos(grupoItem.idOrcamentoGrupoItem, grupoItem.idGrupoItem, grupoItem.filhos)
          .pipe(map(filhos => ({ grupoItem, filhos })))
      );
      return forkJoin(request$).pipe(
        map(paylods => {
          return new Map<number, GrupoItemFilhoPayload>(
            paylods.map(payload => [payload.grupoItem.idOrcamentoGrupoItem, payload])
          );
        }),
        tap<Map<number, GrupoItemFilhoPayload>>(payloadMap => {
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
