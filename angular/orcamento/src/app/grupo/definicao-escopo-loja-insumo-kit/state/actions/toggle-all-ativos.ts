import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { map, tap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { GrupoItemKit, GrupoItemKitFilho } from '../../models/grupo-item';
import { Kit } from '../../models/kit';

interface GrupoItemFilhoPayload {
  grupoItem: GrupoItemKit;
  filhos: GrupoItemKitFilho[];
  produtos: Kit[];
  catalogo: Kit[];
}

export class ToggleAllAtivos
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] ToggleAllAtivos';

  constructor(private open = true) {}

  action(
    { getState, setState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
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
      const requests$: Observable<GrupoItemFilhoPayload>[] = grupoItensAtivosClosed.map(grupoItem => {
        const produtos$ = definicaoEscopoLojaInsumoKitService.getAllProdutos(
          grupoItem.idGrupoItem,
          grupoItem.idOrcamentoGrupoItem
        );
        const filhos$ = definicaoEscopoLojaInsumoKitService.getGrupoItemFilhos(
          grupoItem.idOrcamentoGrupoItem,
          grupoItem.idGrupoItem
        );
        return forkJoin([filhos$, produtos$]).pipe(
          map(([filhos, [catalogo, produtos]]) => ({ grupoItem, filhos, catalogo, produtos }))
        );
      });
      return forkJoin(requests$).pipe(
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
                const { filhos, catalogo, produtos } = payloadMap.get(grupoItem.idOrcamentoGrupoItem);
                grupoItem = {
                  ...grupoItem,
                  filhos,
                  produtos,
                  catalogo,
                  activeTab: 'Especificar',
                  tabSelectedIndex: 0,
                  loading: false,
                  opened: true,
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
