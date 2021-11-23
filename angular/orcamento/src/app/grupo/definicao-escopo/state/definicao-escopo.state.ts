import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { DefinicaoEscopoModeEnum, DefinicaoEscopoStateModel } from './definicao-escopo.model';
import { DefinicaoEscopoService } from '../definicao-escopo.service';
import { GrupoItemDE, GrupoItemTab } from '../model/grupo-item';
import { DefinicaoEscopoActionsArray } from './actions';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { ErrorApi } from '../model/error-api';
import { DeDistribuirQuantitativoService } from '../shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { Injectable } from '@angular/core';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { Fornecedor } from '../../../models';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';

@State<DefinicaoEscopoStateModel>({
  name: 'definicaoEscopo',
  defaults: {
    gruposItens: [],
    loading: false,
    mode: DefinicaoEscopoModeEnum.lista,
    fornecedores: [],
  },
})
@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoState {
  constructor(
    public definicaoEscopoService: DefinicaoEscopoService,
    public deDistribuirQuantitativoService: DeDistribuirQuantitativoService,
    public fornecedorService: FornecedorService
  ) {}

  @Selector([DefinicaoEscopoState])
  static getLoading(state: DefinicaoEscopoStateModel): boolean {
    return !!state?.loading;
  }

  @Selector([DefinicaoEscopoState])
  static getGruposItens(state: DefinicaoEscopoStateModel): GrupoItemDE[] {
    return state?.gruposItens;
  }

  @Selector([DefinicaoEscopoState])
  static getMode(state: DefinicaoEscopoStateModel): DefinicaoEscopoModeEnum {
    return state?.mode;
  }

  @Selector([DefinicaoEscopoState])
  static getErrorApi(state: DefinicaoEscopoStateModel): ErrorApi {
    return state?.errorApi;
  }

  @Selector([DefinicaoEscopoState])
  static getFornecedores(state: DefinicaoEscopoStateModel): Fornecedor[] {
    return state.fornecedores;
  }

  @Selector([DefinicaoEscopoState])
  static getLoadingFornecedores(state: DefinicaoEscopoStateModel): boolean {
    return state.loadingFornecedores;
  }

  @Selector([DefinicaoEscopoState])
  static getOpeningAll(state: DefinicaoEscopoStateModel): boolean {
    return state.openingAll;
  }

  @Selector([DefinicaoEscopoState])
  static getIsAllOpened(state: DefinicaoEscopoStateModel): boolean {
    return state.gruposItens.filter(grupoItem => grupoItem.ativo).every(grupoItem => grupoItem.opened);
  }

  @Selector([DefinicaoEscopoState])
  static getIsAnyOpened(state: DefinicaoEscopoStateModel): boolean {
    return state.gruposItens.filter(grupoItem => grupoItem.ativo).some(grupoItem => grupoItem.opened);
  }

  static getGrupoItemTotal(idOrcamentoGrupoItem: number): (state: DefinicaoEscopoStateModel) => number {
    return createSelector([DefinicaoEscopoState], state => {
      if (idOrcamentoGrupoItem === 0) return 0;
      return state.gruposItens.reduce((acc, item) => {
        if (item.idOrcamentoGrupoItem === idOrcamentoGrupoItem) {
          acc = (+item.valorUnitarioProdutoReferencia + +item.valorUnitarioServicoReferencia) * +item.quantidadeTotal;
        }
        return acc;
      }, 0);
    });
  }

  static getGrupoItemActiveTab(idOrcamentoGrupoItem: number): (state: DefinicaoEscopoStateModel) => GrupoItemTab {
    return createSelector([DefinicaoEscopoState], state => {
      if (idOrcamentoGrupoItem === 0) return null;
      const grupoItem = state.gruposItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      return grupoItem?.activeTab;
    });
  }

  static getGrupoItemAtributos(idOrcamentoGrupoItem: number): (state: DefinicaoEscopoStateModel) => string[] {
    return createSelector([DefinicaoEscopoState], state => {
      if (idOrcamentoGrupoItem === 0) return [];
      const grupoItem = state.gruposItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      if (!grupoItem) return [];
      let atributos = [grupoItem.atributo1, grupoItem.atributo2, grupoItem.atributo3, grupoItem.atributo4];
      if (grupoItem.atributos?.length) {
        atributos = orderBy(grupoItem.atributos ?? [], 'ordem').map(atributo =>
          atributo.grupoItemDadoAtributo
            .filter(gida => gida.ativo)
            .reduce((accGida, gida) => {
              if (gida.ativo) {
                const textoGidac = gida.grupoItemDadoAtributoCombo.reduce((accGidac, gidac) => {
                  if (gidac.ativo) {
                    const textoGcc = gidac.grupoComboConteudo.reduce((accGcc, gcc) => {
                      if (gcc.ativo) {
                        accGcc += ` ${gcc.descricaoCategoriaConteudo}`;
                      }
                      return accGcc;
                    }, ' ');
                    accGidac += ` ${gidac.texto} ${textoGcc}`;
                  }
                  return accGidac;
                }, ' ');
                accGida += ` ${gida.descricaoGrupoItemDadoAtributo} ${textoGidac}`;
              }
              return accGida;
            }, '')
        );
      }
      return atributos.map(atributo => atributo?.trim()).filter(Boolean);
    });
  }

  @Action(DefinicaoEscopoActionsArray)
  actions(ctx: StateContext<DefinicaoEscopoStateModel>, action: NgxsAction): any {
    return action.action(ctx, this);
  }
}
