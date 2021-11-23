import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { UpdateGrupoItem } from './update-grupo-item';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export class ToggleCollapseGrupoItem
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] ToggleCollapseGrupoItem';

  constructor(private idOrcamentoGrupoItem: number, private idGrupoItem: number) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): void | Observable<any> {
    const grupoItem = getState().grupoItens.find(g => g.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    if (grupoItem.opened) {
      dispatch(new UpdateGrupoItem(this.idOrcamentoGrupoItem, { opened: false }));
    } else {
      dispatch(new UpdateGrupoItem(this.idOrcamentoGrupoItem, { loading: true }));
      const produtos$ = context.definicaoEscopoLojaInsumoKitService.getAllProdutos(
        this.idGrupoItem,
        this.idOrcamentoGrupoItem
      );
      const filhos$ = context.definicaoEscopoLojaInsumoKitService.getGrupoItemFilhos(
        this.idOrcamentoGrupoItem,
        this.idGrupoItem
      );
      return forkJoin([filhos$, produtos$]).pipe(
        tap(([filhos, produtosCatalogo]) => {
          const [catalogo, produtos] = produtosCatalogo;
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              filhos,
              loading: false,
              opened: true,
              produtos,
              catalogo,
              activeTab: 'Especificar',
              tabSelectedIndex: 0,
            })
          );
        })
      );
    }
  }
}
