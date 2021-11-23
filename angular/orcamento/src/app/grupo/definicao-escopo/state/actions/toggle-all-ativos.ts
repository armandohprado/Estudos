import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GrupoItemDE } from '../../model/grupo-item';
import { GrupoItemAtributo } from '../../model/grupo-item-atributo';

interface GrupoItemAtributoPayload {
  grupoItem: GrupoItemDE;
  atributos: GrupoItemAtributo[];
}

export class ToggleAllAtivos implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] ToggleAllAtivos';

  constructor(private open = true) {}

  action(
    { getState, setState }: StateContext<DefinicaoEscopoStateModel>,
    { definicaoEscopoService }: DefinicaoEscopoState
  ): Observable<any> | void {
    const grupoItensAtivos = getState().gruposItens.filter(grupoItem => grupoItem.ativo);
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
        gruposItens: state.gruposItens.map(grupoItem => {
          if (grupoItensAtivosClosed.some(gi => gi.idOrcamentoGrupoItem === grupoItem.idOrcamentoGrupoItem)) {
            grupoItem = { ...grupoItem, loading: true };
          }
          return grupoItem;
        }),
        openingAll: true,
      }));
      const requests$: Observable<GrupoItemAtributoPayload>[] = grupoItensAtivosClosed.map(grupoItem => {
        if (grupoItem.atributos?.length) {
          return of({ grupoItem, atributos: grupoItem.atributos });
        } else {
          return definicaoEscopoService
            .getAtributos(grupoItem.idOrcamentoGrupoItem)
            .pipe(map(atributos => ({ grupoItem, atributos })));
        }
      });
      return forkJoin(requests$).pipe(
        map(atributos => {
          return new Map<number, GrupoItemAtributoPayload>(
            atributos.map(attr => [attr.grupoItem.idOrcamentoGrupoItem, attr])
          );
        }),
        tap<Map<number, GrupoItemAtributoPayload>>(grupoAtributoMap => {
          setState(state => ({
            ...state,
            gruposItens: state.gruposItens.map(grupoItem => {
              if (grupoAtributoMap.has(grupoItem.idOrcamentoGrupoItem)) {
                const { atributos } = grupoAtributoMap.get(grupoItem.idOrcamentoGrupoItem);
                grupoItem = {
                  ...grupoItem,
                  errorApi: null,
                  atributos,
                  opened: true,
                  loading: false,
                  activeMode: 'atributos',
                  activeTab: atributos && atributos.length ? 'atributo1' : 'complemento',
                };
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
        gruposItens: state.gruposItens.map(grupoItem => {
          if (grupoItensAtivosOpened.some(gi => gi.idOrcamentoGrupoItem === grupoItem.idOrcamentoGrupoItem)) {
            grupoItem = { ...grupoItem, opened: false };
          }
          return grupoItem;
        }),
      }));
    }
  }
}
