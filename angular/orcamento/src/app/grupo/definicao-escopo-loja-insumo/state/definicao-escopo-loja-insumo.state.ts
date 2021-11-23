import { Action, Actions, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from './definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoService } from '../definicao-escopo-loja-insumo.service';
import { DefinocaoEscopoLojaInsumoActionsArray } from './actions';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { GrupoItemDELI, GrupoItemDELIFilhoGrouped, KeyofGrupoItemDELI } from '../models/grupo-item';
import { groupBy } from 'lodash-es';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';

import { DeDistribuirQuantitativoService } from '../../definicao-escopo/shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { Injectable } from '@angular/core';

@State<DefinicaoEscopoLojaInsumoStateModel>({
  name: 'definicaoEscopoLojaInsumo',
  defaults: {
    grupoItens: [],
  },
})
@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoLojaInsumoState {
  constructor(
    public definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService,
    public actions$: Actions,
    public deDistribuirQuantitativoService: DeDistribuirQuantitativoService
  ) {}

  @Selector([DefinicaoEscopoLojaInsumoState])
  static getLoading({ loading }: DefinicaoEscopoLojaInsumoStateModel): boolean {
    return !!loading;
  }

  @Selector([DefinicaoEscopoLojaInsumoState])
  static getErrorApi({ errorApi }: DefinicaoEscopoLojaInsumoStateModel): ErrorApi {
    return errorApi;
  }

  @Selector([DefinicaoEscopoLojaInsumoState])
  static getGrupoItens({ grupoItens }: DefinicaoEscopoLojaInsumoStateModel): GrupoItemDELI[] {
    return grupoItens;
  }

  @Selector([DefinicaoEscopoLojaInsumoState])
  static getOpeningAll(state: DefinicaoEscopoLojaInsumoStateModel): boolean {
    return state.openingAll;
  }

  @Selector([DefinicaoEscopoLojaInsumoState])
  static getIsAllOpened(state: DefinicaoEscopoLojaInsumoStateModel): boolean {
    return state.grupoItens.filter(grupoItem => grupoItem.ativo).every(grupoItem => grupoItem.opened);
  }

  @Selector([DefinicaoEscopoLojaInsumoState])
  static getIsAnyOpened(state: DefinicaoEscopoLojaInsumoStateModel): boolean {
    return state.grupoItens.filter(grupoItem => grupoItem.ativo).some(grupoItem => grupoItem.opened);
  }

  static getGrupoItemTotal(idOrcamentoGrupoItem: number): (state: DefinicaoEscopoLojaInsumoStateModel) => number {
    return createSelector([DefinicaoEscopoLojaInsumoState], ({ grupoItens }) => {
      if (!idOrcamentoGrupoItem || !grupoItens) return 0;
      const grupoItem = grupoItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      if (!grupoItem || !grupoItem.ativo) return 0;
      if (!grupoItem.filhos?.length) {
        return grupoItem.valorTotal;
      }
      return grupoItem.filhos.reduce((acc, filho) => {
        return acc + filho.quantidade * filho.valorProduto;
      }, 0);
    });
  }

  @Selector([DefinicaoEscopoLojaInsumoState])
  static hasAnyGrupoItemInvalid({ grupoItens }: DefinicaoEscopoLojaInsumoStateModel): boolean {
    const hasAnyAtivo = grupoItens.some(grupoItem => grupoItem.ativo);
    return (
      !hasAnyAtivo ||
      grupoItens.some(grupoItem => {
        return (
          grupoItem.loading ||
          grupoItem.quantitativo?.loading ||
          Object.values(grupoItem.statusProperty ?? {}).includes('loading') ||
          (grupoItem.filhos ?? []).some(
            filho =>
              filho.loading ||
              (filho.catalogo ?? []).some(catalogo => catalogo.loading) ||
              (filho.produtos ?? []).some(produto => produto.loading) ||
              Object.values(filho.statusProperty ?? {}).includes('loading')
          )
        );
      })
    );
  }

  static getStatusProperty(
    idOrcamentoGrupoItem: number,
    property: KeyofGrupoItemDELI
  ): (state: DefinicaoEscopoLojaInsumoStateModel) => AwInputStatus {
    return createSelector([DefinicaoEscopoLojaInsumoState], state => {
      return state.grupoItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem)?.statusProperty?.[
        property
      ];
    });
  }

  static getGrupoItemFilhosGrouped(
    idOrcamentoGrupoItem: number
  ): (state: DefinicaoEscopoLojaInsumoStateModel) => GrupoItemDELIFilhoGrouped[] {
    return createSelector([DefinicaoEscopoLojaInsumoState], ({ grupoItens }) => {
      const grupoItem = grupoItens.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      const grouped = groupBy(grupoItem.filhos, 'descricaoInsumo');
      return Object.entries(grouped).map(([descricao, itens]) => ({
        descricao,
        itens,
      }));
    });
  }

  @Action(DefinocaoEscopoLojaInsumoActionsArray)
  actions(ctx: StateContext<DefinicaoEscopoLojaInsumoStateModel>, action: NgxsAction): any {
    return action.action(ctx, this);
  }
}
