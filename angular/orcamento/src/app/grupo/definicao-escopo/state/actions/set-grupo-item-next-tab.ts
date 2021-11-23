import { GrupoItemTab } from '../../model/grupo-item';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { UpdateGrupoItem } from './update-grupo-item';

export class SetGrupoItemNextTab implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetGrupoItemNextTab';

  constructor(public idOrcamentoGrupoItem: number, public tabAtual?: GrupoItemTab) {}

  action({ getState, dispatch }: StateContext<DefinicaoEscopoStateModel>, context: DefinicaoEscopoState): void {
    let { tabAtual, idOrcamentoGrupoItem } = this;
    if (!idOrcamentoGrupoItem) {
      return;
    }
    const grupoItem = getState().gruposItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
    tabAtual ??= grupoItem.activeTab;
    if (/^atributo[0-9]$/.test(tabAtual)) {
      let attrNumber = +tabAtual.replace(/[^0-9.]+/g, '');
      if (attrNumber < grupoItem.atributos.length) {
        const newTab = ('atributo' + ++attrNumber) as GrupoItemTab;
        dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { activeTab: newTab }));
      } else {
        dispatch(
          new UpdateGrupoItem(idOrcamentoGrupoItem, {
            activeTab: 'complemento',
          })
        );
      }
    } else if (tabAtual === 'complemento') {
      if (context.definicaoEscopoService.cenarioPadrao.existePlanilhaCliente) {
        dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { activeTab: 'eap-cliente' }));
      } else {
        dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { activeTab: 'distribuir' }));
      }
    } else if (tabAtual === 'eap-cliente') {
      dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { activeTab: 'distribuir' }));
    }
    context.definicaoEscopoService.scrollIntoView(idOrcamentoGrupoItem);
  }
}
