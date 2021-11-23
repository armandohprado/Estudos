import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { Kit } from '../../models/kit';

export class SetGrupoItemProdutosApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] SetGrupoItemProdutosApi';

  constructor(private idOrcamentoGrupoItem: number, private idGrupoItem: number) {}

  action(
    { setState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<[Kit[], Kit[]]> {
    dispatch(new UpdateGrupoItem(this.idOrcamentoGrupoItem, { loading: true }));
    return definicaoEscopoLojaInsumoKitService.getAllProdutos(this.idGrupoItem, this.idOrcamentoGrupoItem).pipe(
      tap(([catalogo, produtos]) => {
        dispatch(
          new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
            produtos,
            catalogo,
            opened: true,
            loading: false,
            activeTab: 'Especificar',
          })
        );
      })
    );
  }
}
