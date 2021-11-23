import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { GrupoItemDE } from '../../model/grupo-item';

export class SetGrupoItemAtributoTexto implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetGrupoItemAtributoTexto';
  constructor(public idOrcamentoGrupoItem: number, public atributoOrdem: number) {}
  action({ setState, getState }: StateContext<DefinicaoEscopoStateModel>, context: DefinicaoEscopoState): void {
    const { idOrcamentoGrupoItem, atributoOrdem } = this;
    if (idOrcamentoGrupoItem === 0) return;
    const grupoItem = getState().gruposItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
    const attrOrdem = grupoItem.atributos.find(({ ordem }) => ordem === atributoOrdem);
    const texto = attrOrdem.grupoItemDadoAtributo.reduce((acc, item) => {
      if (item.ativo) {
        acc = item.descricaoGrupoItemDadoAtributo;
        const textDado = item.grupoItemDadoAtributoCombo.reduce((acc1, item1) => {
          if (item1.ativo) {
            acc1 += item1.texto;
            const textConteudo = item1.grupoComboConteudo.reduce((acc2, item2) => {
              if (item2.ativo) {
                acc2 += item2.descricaoCategoriaConteudo;
              }
              return acc2;
            }, '');
            if (textConteudo) acc1 += ' ' + textConteudo;
          }
          return acc1;
        }, '');
        if (textDado) acc += ' ' + textDado;
      }
      return acc;
    }, '');
    setState(
      patch({
        gruposItens: updateItem<GrupoItemDE>(
          item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem,
          patch<GrupoItemDE>({
            ['atributo' + atributoOrdem]: texto,
          })
        ),
      })
    );
  }
}
